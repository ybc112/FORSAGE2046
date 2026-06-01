import { create } from 'zustand'
import { ethers } from 'ethers'
import { BNB_CHAIN_ID, BNB_RPC } from '../utils/contracts'

const BSC_PARAMS = {
  chainId: '0x38', // 56
  chainName: 'BNB Smart Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: [BNB_RPC],
  blockExplorerUrls: ['https://bscscan.com'],
}

interface WalletState {
  account: string | null
  isConnected: boolean
  chainId: number | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  error: string

  // 钱包动作
  connect: () => Promise<void>
  disconnect: () => void
  ensureBscChain: () => Promise<boolean>

  // 供 useWalletEvents 同步外部变更
  syncAccount: (account: string | null) => Promise<void>
  setChainId: (chainId: number | null) => void
  setError: (error: string) => void
}

const getInjected = () => (typeof window !== 'undefined' ? window.ethereum : undefined)

export const useStore = create<WalletState>((set, get) => ({
  account: null,
  isConnected: false,
  chainId: null,
  provider: null,
  signer: null,
  error: '',

  ensureBscChain: async () => {
    const eth = getInjected()
    if (!eth) return false
    try {
      const current = (await eth.request({ method: 'eth_chainId' })) as string
      if (parseInt(current, 16) === BNB_CHAIN_ID) return true
      try {
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_PARAMS.chainId }],
        })
      } catch (switchErr) {
        // 4902: 链未添加，尝试添加
        if ((switchErr as { code?: number })?.code === 4902) {
          await eth.request({ method: 'wallet_addEthereumChain', params: [BSC_PARAMS] })
        } else {
          throw switchErr
        }
      }
      set({ chainId: BNB_CHAIN_ID })
      return true
    } catch {
      set({ error: '请将钱包切换到 BNB Chain' })
      return false
    }
  },

  connect: async () => {
    const eth = getInjected()
    if (!eth) {
      set({ error: '请安装 MetaMask 或其他 Web3 钱包' })
      return
    }
    try {
      set({ error: '' })
      const ok = await get().ensureBscChain()
      if (!ok) return

      const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[]
      const provider = new ethers.BrowserProvider(eth)
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()

      set({
        provider,
        signer,
        account: accounts[0] || null,
        isConnected: !!accounts[0],
        chainId: Number(network.chainId),
      })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '连接钱包失败' })
    }
  },

  disconnect: () => {
    set({ account: null, isConnected: false, signer: null, error: '' })
  },

  // 外部账户变化（MetaMask 切换账户）时重新建立 signer
  syncAccount: async (account) => {
    if (!account) {
      get().disconnect()
      return
    }
    const eth = getInjected()
    if (!eth) return
    const provider = new ethers.BrowserProvider(eth)
    const signer = await provider.getSigner()
    set({ provider, signer, account, isConnected: true })
  },

  setChainId: (chainId) => set({ chainId }),
  setError: (error) => set({ error }),
}))
