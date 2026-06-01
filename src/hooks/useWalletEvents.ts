import { useEffect } from 'react'
import { useStore } from '../stores/useStore'

// 在 App 根部挂载一次：监听钱包账户 / 网络变化并同步到全局 store，
// 解决「在 MetaMask 中切换账户或网络后应用状态陈旧」的问题。
export function useWalletEvents() {
  const syncAccount = useStore((s) => s.syncAccount)
  const setChainId = useStore((s) => s.setChainId)

  useEffect(() => {
    const eth = window.ethereum
    if (!eth) return

    // 初始静默检查：若钱包已授权过本站，恢复连接状态
    eth
      .request({ method: 'eth_accounts' })
      .then((res) => {
        const accounts = res as string[]
        if (accounts && accounts.length > 0) {
          void syncAccount(accounts[0])
        }
      })
      .catch(() => {})

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[]
      void syncAccount(accounts && accounts.length > 0 ? accounts[0] : null)
    }

    const handleChainChanged = (...args: unknown[]) => {
      const chainId = args[0] as string
      setChainId(parseInt(chainId, 16))
    }

    eth.on('accountsChanged', handleAccountsChanged)
    eth.on('chainChanged', handleChainChanged)

    return () => {
      eth.removeListener('accountsChanged', handleAccountsChanged)
      eth.removeListener('chainChanged', handleChainChanged)
    }
  }, [syncAccount, setChainId])
}
