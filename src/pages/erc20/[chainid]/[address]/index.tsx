import {
  chakra,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Box,
  Stack,
  Select,
  Icon,
  Grid,
  GridItem,
  useMediaQuery,
  Button,
} from '@chakra-ui/react'
import { Head } from 'components/layout/Head'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import { LinkComponent } from 'components/layout/LinkComponent'

import { useRouter } from 'next/router'
import {
  useNetwork,
  useSwitchNetwork,
  useContractWrite,
  usePrepareContractWrite,
  erc20ABI,
  useBalance,
  useToken,
  Address,
  useEnsAddress,
  useAccount,
} from 'wagmi'
import { isAddress, formatUnits, parseUnits, maxUint256, zeroAddress } from 'viem'
import React, { useEffect, useState } from 'react'
import { FaPaste } from 'react-icons/fa'
import { useDebounce } from 'components/useDebounce'

export default function Erc20() {
  const router = useRouter()
  const [isSmallerThanMd] = useMediaQuery('(max-width: 48em)')
  const { chain } = useNetwork()
  const { chainid, address } = router.query
  const [tokenAddress, setTokenAddress] = useState<Address>()
  const [receipientString, setRecipientString] = useState<string>()
  const debouncedRecipientString = useDebounce(receipientString, 500)
  const [balance, setBalance] = useState<string>()
  const [decimals, setDecimals] = useState<number>(18)
  const [decimalsSet, setDecimalsSet] = useState<boolean>(false)
  const [symbol, setSymbol] = useState<string>()
  const [name, setName] = useState<string>()
  const [isMintAvailable, setIsMintAvailable] = useState<boolean>(true)
  const [totalSupply, setTotalSupply] = useState<string>()
  const [_chainId, setChainId] = useState<number>()
  const [valid, setValid] = useState(false)
  const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork({
    chainId: _chainId ? _chainId : 1,
  })
  const mintABI = [
    {
      inputs: [
        {
          internalType: 'address',
          name: '_to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: '_amount',
          type: 'uint256',
        },
      ],
      name: 'mint',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as const
  const { address: userAddr, isConnecting, isDisconnected } = useAccount()

  useEffect(() => {
    if (!valid && isAddress(address as Address) && !isNaN(parseInt(chainid as string))) {
      setChainId(parseInt(chainid as string))
      setTokenAddress(address as Address)
      setValid(true)
    }
  }, [router.isReady])

  // // Check if mint is available
  // const { config: checkMintConfig } = usePrepareContractWrite({
  //   address: tokenAddress,
  //   abi: mintABI,
  //   functionName: 'mint',
  //   args: ['0x1234567890123456789012345678901234567890', parseUnits('1', decimals)],
  // })

  const { data: data3, isError: isError3, isLoading: isLoading3 } = useBalance({ address: userAddr, token: tokenAddress })

  const {
    data: data2,
    isError: isError2,
    isLoading: isLoading2,
  } = useEnsAddress({
    name: debouncedRecipientString,
  })

  useEffect(() => {
    if (data2) {
      setRecipientString(data2)
    }
  }, [data2])

  const {
    data: data1,
    isError: isError1,
    isLoading: isLoading1,
  } = useToken({
    address: tokenAddress,
  })

  const handlePasteClick = async () => {
    const clipboardText = await navigator.clipboard.readText()
    setRecipientString(clipboardText)
  }

  const { config: approveConfig } = usePrepareContractWrite({
    address: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    abi: erc20ABI,
    functionName: 'approve',
    args: [receipientString ? (receipientString as Address) : zeroAddress, parseUnits(balance ? balance : '', decimals)],
  })

  const { data: approveData, isLoading: isloadingApprove, isSuccess: approveSuccess, write: approveWrite } = useContractWrite(approveConfig)

  const { config: transferConfig } = usePrepareContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'transfer',
    args: [receipientString ? (receipientString as Address) : zeroAddress, parseUnits(balance ? balance : '', decimals)],
  })

  const { data: transferData, isLoading: isloadingTransfer, isSuccess: transferSuccess, write: transferWrite } = useContractWrite(transferConfig)
  const { config: mintConfig } = usePrepareContractWrite({
    address: tokenAddress,
    abi: mintABI,
    functionName: 'mint',
    args: [receipientString ? (receipientString as Address) : zeroAddress, parseUnits(balance ? balance : '', decimals)],
  })

  const { data: mintData, isLoading: isloadingMint, isSuccess: mintSuccess, write: mintWrite } = useContractWrite(mintConfig)

  const tokenDetailsCard = () => {
    if (data1 && !name) {
      data1.decimals && setDecimals(data1.decimals)
      data1.decimals && setDecimalsSet(true)
      data1.symbol && setSymbol(data1.symbol)
      data1.name && setName(data1.name)
      data1.totalSupply && setTotalSupply(parseInt(formatUnits(data1.totalSupply.value, data1.decimals)).toLocaleString())

      // setIsMintAvailable(checkMintConfig ? true : false)
    }

    return (
      <Card>
        <CardHeader>
          <Heading size="md">Token Details</Heading>
        </CardHeader>
        {isError1 && <CardBody> There was an error loading these details. Double check the token address. </CardBody>}
        {isLoading1 && <CardBody>Loading...</CardBody>}
        {!isError1 && !isLoading1 && (
          <CardBody>
            <Grid templateColumns={!isSmallerThanMd ? 'repeat(2, 1fr)' : ''} gap={4}>
              <GridItem>
                <Heading size="xs" textTransform="uppercase">
                  Address:
                </Heading>
                <Text pt="2" fontSize="sm">
                  {tokenAddress}
                </Text>
              </GridItem>
              <GridItem>
                <Heading size="xs" textTransform="uppercase">
                  Decimals:
                </Heading>
                <Text pt="2" fontSize="sm">
                  {decimals}
                </Text>
              </GridItem>
              <GridItem>
                <Heading size="xs" textTransform="uppercase">
                  Symbol:
                </Heading>
                <Text pt="2" fontSize="sm">
                  {symbol}
                </Text>
              </GridItem>
              <GridItem>
                <Heading size="xs" textTransform="uppercase">
                  Total Supply:
                </Heading>
                <Text pt="2" fontSize="sm">
                  {totalSupply} {symbol}
                </Text>
              </GridItem>
            </Grid>
          </CardBody>
        )}
      </Card>
    )
  }

  const decimalButtons = (
    <Box py={3}>
      <Text> Set the token decimals: </Text>
      <Select
        onChange={(e) => {
          setDecimals(parseInt(e.target.value))
        }}
        placeholder="18"
        h="1.75rem"
        size="sm">
        <option value="8">8 (WBTC)</option>
        <option value="6">6 (USDC, USDT)</option>
        <option value="0">0</option>
      </Select>
    </Box>
  )

  const balanceInputBox = (input?: string) => {
    return (
      <Box>
        <InputGroup>
          <InputLeftAddon>Amount</InputLeftAddon>
          <Input
            onChange={(e) => {
              const value = e.target.value
              const regex = /^[0-9]*\.?[0-9]*$/
              if (regex.test(value)) {
                setBalance(value)
              }
            }}
            value={balance}
            placeholder="0.0"
          />
          <InputRightAddon>
            {input === 'transfer' && (
              <Text fontSize={'xs'} pr={2} onClick={() => setBalance(data3?.formatted)}>
                {' '}
                MAX{' '}
              </Text>
            )}
            {input === 'approve' && (
              <Text fontSize={'xs'} pr={2} onClick={() => setBalance(maxUint256.toString())}>
                {' '}
                MAX{' '}
              </Text>
            )}
            {symbol}
          </InputRightAddon>
        </InputGroup>
        {balance && <Text fontSize={'xs'}> Raw Value: {parseUnits(balance, decimals).toString()}</Text>}
      </Box>
    )
  }

  const addressInputBox = (
    <InputGroup>
      <InputLeftAddon>Address</InputLeftAddon>
      <Input
        value={receipientString}
        onChange={(e) => {
          const value = e.target.value
          setRecipientString(value)
        }}
        placeholder="0x... or vitalik.eth"
      />
      <InputRightAddon>
        <Icon as={FaPaste} onClick={handlePasteClick} />
      </InputRightAddon>
    </InputGroup>
  )

  const transferDetail = (
    <Box>
      <Grid templateColumns={!isSmallerThanMd ? 'repeat(2, 1fr)' : ''} gap={4}>
        <GridItem>{addressInputBox}</GridItem>
        <GridItem>
          {balanceInputBox('transfer')}
          {!decimalsSet && decimalButtons}
        </GridItem>
        <GridItem pt={-4}>
          <Button disabled={!transferWrite} onClick={() => transferWrite?.()}>
            {' '}
            Transfer{' '}
          </Button>
        </GridItem>
      </Grid>
    </Box>
  )
  // const transferFromDetail = <Box>{!decimalsSet && decimalButtons}</Box>
  const approve = (
    <Box>
      <Grid templateColumns={!isSmallerThanMd ? 'repeat(2, 1fr)' : ''} gap={4}>
        <GridItem>{addressInputBox}</GridItem>
        <GridItem>
          {balanceInputBox('approve')}
          {!decimalsSet && decimalButtons}
        </GridItem>
        <GridItem pt={-4}>
          <Button disabled={!approveWrite} onClick={() => approveWrite?.()}>
            {' '}
            Approve{' '}
          </Button>
        </GridItem>
      </Grid>
    </Box>
  )
  const mint = (
    <Box>
      <Text py={4}> Mint testnet coins on testnet chains. Minting has to have this ABI: mint(address, uint256) in order to work. </Text>
      <Grid templateColumns={!isSmallerThanMd ? 'repeat(2, 1fr)' : ''} gap={4}>
        <GridItem>{addressInputBox}</GridItem>
        <GridItem>
          {balanceInputBox()}
          {!decimalsSet && decimalButtons}
        </GridItem>
        <GridItem pt={-4}>
          <Button disabled={!mintWrite} onClick={() => mintWrite?.()}>
            {' '}
            Mint{' '}
          </Button>
        </GridItem>
      </Grid>
    </Box>
  )

  return (
    <>
      <Head />
      {!valid && (
        <main>
          <HeadingComponent as="h2">Invalid ERC20</HeadingComponent>

          <Text> Please check that the chainId or the address you entered in is correct!</Text>
          <Text py={4}>
            The chainId is {chainid} and the token address is {address}
          </Text>
        </main>
      )}

      {valid && isDisconnected && (
        <main>
          <HeadingComponent as="h2">Connect Wallet</HeadingComponent>
          <Text py={4}> Please connect your wallet!</Text>
        </main>
      )}

      {valid && !isDisconnected && chain?.id != _chainId && (
        <main>
          <HeadingComponent as="h2">Wrong Network</HeadingComponent>
          <Text py={4}>
            {' '}
            Currently connected to {chain?.name} (ID: {chain?.id}) Please switch to {_chainId}{' '}
          </Text>

          <Button disabled={!switchNetwork} onClick={() => switchNetwork?.(_chainId)}>
            Switch to {_chainId}
          </Button>
        </main>
      )}

      {valid && !isDisconnected && chain?.id === _chainId && (
        <main>
          <HeadingComponent as="h2">ERC20 Helper</HeadingComponent>
          <Text py={4}>
            The chain ID is{' '}
            <chakra.span fontWeight={'bold'}>
              {chain?.name} ({chain?.id})
            </chakra.span>{' '}
            and the token address is <chakra.span fontWeight={'bold'}>{symbol ? symbol : address}</chakra.span>. Balance:{' '}
            <chakra.span fontWeight={'bold'}>
              {data3 && parseInt(data3.formatted).toLocaleString()} {symbol}
            </chakra.span>
            .
          </Text>

          <Tabs variant="enclosed">
            <TabList>
              <Tab>Token Info</Tab>
              <Tab>Transfer</Tab>
              {/* <Tab>Transfer From</Tab> */}
              <Tab>Approve</Tab>
              <Tab disabled={isMintAvailable}>Mint</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>{tokenDetailsCard()}</TabPanel>
              <TabPanel>{transferDetail}</TabPanel>
              {/* <TabPanel>{transferFromDetail}</TabPanel> */}
              <TabPanel>{approve}</TabPanel>
              <TabPanel>{mint}</TabPanel>
            </TabPanels>
          </Tabs>
        </main>
      )}
    </>
  )
}
