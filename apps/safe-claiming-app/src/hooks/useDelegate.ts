import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk"
import { Contract, ethers } from "ethers"
import {
  CHAIN_CONSTANTS,
  DelegateRegistryAddress,
  ZERO_ADDRESS,
} from "src/config/constants"
import { useEffect, useMemo, useState } from "react"
import { getWeb3Provider } from "src/utils/getWeb3Provider"
import { Interface } from "ethers/lib/utils"

export const useDelegate = () => {
  const [delegateAddress, setDelegateAddress] = useState<string>()
  const { sdk, safe } = useSafeAppsSDK()

  const ethersProvider = useMemo(() => getWeb3Provider(safe, sdk), [safe, sdk])

  const chainConstants = CHAIN_CONSTANTS[safe.chainId]

  useEffect(() => {
    if (!chainConstants) {
      return
    }
    let isCurrent = true

    const delegateIDInBytes = ethers.utils.formatBytes32String(
      chainConstants.DELEGATE_ID
    )

    const checkDelegate = async () => {
      try {
        const abiInterface = new Interface([
          "function delegation(address, bytes32) public view returns (address)",
          "function setDelegate(bytes32 id, address delegate) public",
        ])
        const address = await new Contract(
          DelegateRegistryAddress,
          abiInterface,
          ethersProvider
        ).delegation(safe.safeAddress, delegateIDInBytes)

        if (address !== ZERO_ADDRESS) {
          isCurrent && setDelegateAddress(address)
        }
      } catch (error) {
        console.error(error)
      }
    }

    checkDelegate()

    return () => {
      isCurrent = false
    }
  }, [chainConstants, ethersProvider, safe.safeAddress])

  return delegateAddress
}
