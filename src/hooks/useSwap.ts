import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import {
  TOKENS,
  getRouterContract,
  getTokenContract,
  getSwapPath,
  formatAmount,
  parseAmount,
  PANCAKE_ROUTER_ADDRESS,
  BNB_RPC,
} from '../utils/contracts'
import { useStore } from '../stores/useStore'

export interface TokenInfo {
  symbol: string
  name: string
  address: string
  decimals: number
  logo: string
  balance: string
}

const tokenDecimals = (address: string): number => {
  if (address === TOKENS.BNB.address) return 18
  return Object.values(TOKENS).find((t) => t.address === address)?.decimals ?? 18
}

export function useSwap() {
  // 钱包状态全部来自全局 store，与 Navbar 共享同一连接
  const provider = useStore((s) => s.provider)
  const signer = useStore((s) => s.signer)
  const account = useStore((s) => s.account)
  const connect = useStore((s) => s.connect)
  const walletError = useStore((s) => s.error)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // 获取代币余额
  const getTokenBalance = useCallback(
    async (tokenAddress: string): Promise<string> => {
      if (!provider || !account) return '0'
      try {
        if (tokenAddress === TOKENS.BNB.address) {
          const balance = await provider.getBalance(account)
          return parseAmount(balance, 18)
        }
        const tokenContract = getTokenContract(tokenAddress, provider)
        const balance = await tokenContract.balanceOf(account)
        const decimals = await tokenContract.decimals()
        return parseAmount(balance, decimals)
      } catch (err) {
        console.error('获取余额失败:', err)
        return '0'
      }
    },
    [provider, account],
  )

  // 获取兑换金额（链上报价）
  const getAmountOut = useCallback(
    async (
      amountIn: string,
      fromToken: string,
      toToken: string,
      fromDecimals?: number,
      toDecimals?: number,
    ): Promise<string> => {
      if (!provider || !amountIn || parseFloat(amountIn) <= 0) return '0'
      try {
        const router = getRouterContract(provider)
        const path = getSwapPath(fromToken, toToken)
        const amountInWei = formatAmount(amountIn, fromDecimals ?? tokenDecimals(fromToken))
        const amounts = await router.getAmountsOut(amountInWei, path)
        return parseAmount(amounts[amounts.length - 1], toDecimals ?? tokenDecimals(toToken))
      } catch (err) {
        console.error('获取兑换金额失败:', err)
        return '0'
      }
    },
    [provider],
  )

  // 检查授权额度
  const checkAllowance = useCallback(
    async (tokenAddress: string, spender: string = PANCAKE_ROUTER_ADDRESS): Promise<bigint> => {
      if (!provider || !account || tokenAddress === TOKENS.BNB.address) {
        return ethers.MaxUint256
      }
      try {
        const tokenContract = getTokenContract(tokenAddress, provider)
        return await tokenContract.allowance(account, spender)
      } catch (err) {
        console.error('检查授权失败:', err)
        return 0n
      }
    },
    [provider, account],
  )

  // 授权代币
  const approveToken = useCallback(
    async (tokenAddress: string, amount: string, spender: string = PANCAKE_ROUTER_ADDRESS): Promise<boolean> => {
      if (!signer || tokenAddress === TOKENS.BNB.address) return true
      try {
        setLoading(true)
        const tokenContract = getTokenContract(tokenAddress, signer)
        const decimals = await tokenContract.decimals()
        const amountWei = formatAmount(amount, decimals)
        const tx = await tokenContract.approve(spender, amountWei)
        await tx.wait()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : '授权失败')
        return false
      } finally {
        setLoading(false)
      }
    },
    [signer],
  )

  // 执行兑换
  const executeSwap = useCallback(
    async (
      amountIn: string,
      expectedOut: string,
      fromToken: string,
      toToken: string,
      slippage: number = 0.5,
      fromDecimals?: number,
      toDecimals?: number,
    ): Promise<boolean> => {
      if (!signer || !account) {
        setError('请先连接钱包')
        return false
      }
      try {
        setLoading(true)
        setError('')

        const router = getRouterContract(signer)
        const path = getSwapPath(fromToken, toToken)
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 分钟

        const amountInWei = formatAmount(amountIn, fromDecimals ?? tokenDecimals(fromToken))

        // 按滑点计算最小到账：expectedOut * (1 - slippage%)
        const expectedOutWei = formatAmount(expectedOut, toDecimals ?? tokenDecimals(toToken))
        const slippageBps = BigInt(Math.round((100 - slippage) * 100)) // 0.5% -> 9950
        const amountOutMinWei = (expectedOutWei * slippageBps) / 10000n

        let tx
        if (fromToken === TOKENS.BNB.address) {
          tx = await router.swapExactETHForTokens(amountOutMinWei, path, account, deadline, {
            value: amountInWei,
          })
        } else if (toToken === TOKENS.BNB.address) {
          tx = await router.swapExactTokensForETH(amountInWei, amountOutMinWei, path, account, deadline)
        } else {
          tx = await router.swapExactTokensForTokens(amountInWei, amountOutMinWei, path, account, deadline)
        }

        await tx.wait()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : '交易失败')
        return false
      } finally {
        setLoading(false)
      }
    },
    [signer, account],
  )

  // 按合约地址读取代币信息（未连接钱包时用公共 RPC 兜底）
  const getTokenInfo = useCallback(
    async (address: string) => {
      try {
        const read: ethers.Provider = provider ?? new ethers.JsonRpcProvider(BNB_RPC)
        const contract = getTokenContract(address, read)
        const [symbol, name, decimals] = await Promise.all([
          contract.symbol(),
          contract.name(),
          contract.decimals(),
        ])
        return {
          symbol: String(symbol),
          name: String(name),
          address,
          decimals: Number(decimals),
          logo: '🪙',
        }
      } catch {
        return null
      }
    },
    [provider],
  )

  return {
    account,
    loading,
    error: error || walletError,
    connectWallet: connect,
    getTokenBalance,
    getAmountOut,
    checkAllowance,
    approveToken,
    executeSwap,
    getTokenInfo,
  }
}
