import { ArrowBackIcon } from '@chakra-ui/icons'
import { Center } from '@chakra-ui/layout'
import { Button, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { upperFirst } from 'lodash'
import { useMenuRoutes } from 'components/Layout/Header/NavBar/hooks/useMenuRoutes'

type ExpandedMenuItemProps = {
  title?: string
  description?: string
}

export const SubmenuHeader = ({ title, description }: ExpandedMenuItemProps) => {
  const { handleBackClick } = useMenuRoutes()
  const headerColor = useColorModeValue('black', 'white')
  const backArrowColor = useColorModeValue('black.500', 'lightgrey')
  const descriptionTextColor = useColorModeValue('black', 'whiteAlpha.600')

  return (
    <Flex flexDir='column' mb={3}>
      <Flex mb={3} justifyContent='space-between' alignItems='center'>
        <Button onClick={handleBackClick} ml={2} size='sm'>
          <ArrowBackIcon color={backArrowColor} />
        </Button>
        <Center fontWeight='bold' color={headerColor} fontSize='sm' flex={1} pr={7}>
          {upperFirst(title)}
        </Center>
      </Flex>
      {description && (
        <Text fontSize='sm' color={descriptionTextColor}>
          {description}
        </Text>
      )}
    </Flex>
  )
}
