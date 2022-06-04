import { WalletConnectHDWallet } from '@shapeshiftoss/hdwallet-walletconnect'
import { getConfig } from 'config'
import React, { useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { ActionTypes, WalletActions } from 'context/WalletProvider/actions'
import { KeyManager } from 'context/WalletProvider/KeyManager'
import { setLocalWalletTypeAndDeviceId } from 'context/WalletProvider/local-wallet'
import { useWallet } from 'hooks/useWallet/useWallet'

import { ConnectModal } from '../../components/ConnectModal'
import { LocationState } from '../../NativeWallet/types'
import { WalletConnectConfig } from '../config'

export interface WalletConnectSetupProps
  extends RouteComponentProps<
    {},
    any, // history
    LocationState
  > {
  dispatch: React.Dispatch<ActionTypes>
}

/**
 * WalletConnect Connect component
 *
 * Test WalletConnect Tool: https://test.walletconnect.org/
 */
export const WalletConnectConnect = ({ history }: WalletConnectSetupProps) => {
  const { dispatch, state } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setErrorLoading = (e: string | null) => {
    setError(e)
    setLoading(false)
  }

  const pairDevice = async () => {
    setError(null)
    setLoading(true)

    const rpcUrl = getConfig().REACT_APP_ETHEREUM_NODE_URL
    if (!rpcUrl) {
      throw new Error('walletProvider.walletConnect.errors.rpcUrlNotFound')
    }
    const config = {
      rpc: {
        1: rpcUrl,
      },
    }

    if (state.adapters && state.adapters?.has(KeyManager.WalletConnect)) {
      const wallet = (await state.adapters
        .get(KeyManager.WalletConnect)
        ?.pairDevice(config)) as WalletConnectHDWallet
      if (!wallet) {
        setErrorLoading('walletProvider.errors.walletNotFound')
        throw new Error('Call to hdwallet-walletconnect::pairDevice returned null or undefined')
      }

      const { name, icon } = WalletConnectConfig
      try {
        const deviceId = await wallet.getDeviceID()

        dispatch({
          type: WalletActions.SET_WALLET,
          payload: { wallet, name, icon, deviceId },
        })
        dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: true })
        setLocalWalletTypeAndDeviceId(KeyManager.WalletConnect, deviceId)
        dispatch({ type: WalletActions.SET_WALLET_MODAL, payload: false })
      } catch (e: any) {
        if (e?.message?.startsWith('walletProvider.')) {
          console.error('WalletConnect Connect: There was an error initializing the wallet', e)
          setErrorLoading(e?.message)
        } else {
          setErrorLoading('walletProvider.walletConnect.errors.unknown')
          history.push('/walletconnect/failure')
        }
      }
    }
    setLoading(false)
  }

  // The WalletConnect modal handles desktop and mobile detection as well as deep linking
  return (
    <ConnectModal
      headerText={'walletProvider.walletConnect.connect.header'}
      bodyText={'walletProvider.walletConnect.connect.body'}
      buttonText={'walletProvider.walletConnect.connect.button'}
      pairDevice={pairDevice}
      loading={loading}
      error={error}
    ></ConnectModal>
  )
}