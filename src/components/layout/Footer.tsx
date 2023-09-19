import React from 'react'
import { Flex, Text } from '@chakra-ui/react'
import { FaGithub, FaTwitter } from 'react-icons/fa'
import { LinkComponent } from './LinkComponent'
import { SITE_DESCRIPTION, SOCIAL_GITHUB, SOCIAL_TWITTER } from 'utils/config'

interface Props {
  className?: string
}

export function Footer(props: Props) {
  const className = props.className ?? ''

  return (
    <Flex as="footer" className={className} flexDirection="column" justifyContent="center" alignItems="center" my={8}>
      <Text>ERC20 Helper, 2023</Text>

      <Flex color="gray.500" gap={2} alignItems="center" mt={2}>
        <LinkComponent href={`https://github.com/mergd`}>
          <FaGithub />
        </LinkComponent>
        <LinkComponent href={`https://twitter.com/w_y_x`}>
          <FaTwitter />
        </LinkComponent>
      </Flex>
    </Flex>
  )
}
