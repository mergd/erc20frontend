import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  useDisclosure,
  Button,
  NumberInput,
  NumberInputField,
  Input,
  Box,
  Link,
  Icon,
} from '@chakra-ui/react'
import { CopyIcon } from '@chakra-ui/icons'
import { Head } from 'components/layout/Head'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import { LinkComponent } from 'components/layout/LinkComponent'
import { Address, zeroAddress } from 'viem'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useNetwork } from 'wagmi'

export default function Home() {
  const router = useRouter()
  const baseUrl = router.basePath
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [chainId, setChainId] = useState(1)
  const [address, setAddress] = useState('')

  return (
    <>
      <Head />

      <main>
        <HeadingComponent as="h2">Use ERC20s for (almost) any chain</HeadingComponent>
        <Text>
          Use this tool to easily use ERC20 tokens on any chain. <br />
          <br />
          Here is an example of{' '}
          <LinkComponent underlined={true} href="/erc20/137/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174">
            {' '}
            USDC on Polygon
          </LinkComponent>
          <br />
          <br />
          Mint various (supported) mock ERC20s to your wallet for testing as well.
        </Text>

        <Button mt={4} onClick={onOpen}>
          Create link
        </Button>
      </main>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Craft a link</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text py={2}> Chain ID: </Text>
            <NumberInput>
              <NumberInputField value={chainId} onChange={(e) => setChainId(parseInt(e.target.value))} />
            </NumberInput>

            <Text py={2}> Token Address: </Text>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />

            <Link onClick={() => router.push(`/erc20/${chainId}/${address ? address : zeroAddress}`)} fontWeight={'semibold'}>
              {' '}
              {baseUrl}/erc20/{chainId}/{address ? address : zeroAddress}
            </Link>
            <Icon mr={4} as={CopyIcon} onClick={() => navigator.clipboard.writeText(`${baseUrl}/erc20/${chainId}/${address}`)} />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
