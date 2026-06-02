import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ethers } from 'ethers'
import { Rocket, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { MINT_CONTRACT_ADDRESS, MINT_ABI, BNB_RPC, TOKENS } from '../utils/contracts'

const TOTAL_SUPPLY_LABEL = '2046 万'
const DEFAULT_PRICE = '0.02'
// 展示给用户的代币合约地址（铸造交易仍发往销售合约 MINT_CONTRACT_ADDRESS）
const TOKEN_ADDRESS = TOKENS.FORSAGE.address

// 把链上/钱包报错转成友好中文提示
function mintError(e: unknown): string {
  const err = e as { code?: string | number; shortMessage?: string; message?: string }
  const msg = (err?.shortMessage || err?.message || '').toLowerCase()
  if (err?.code === 'INSUFFICIENT_FUNDS' || msg.includes('insufficient funds')) {
    return 'BNB 余额不足：每份需 0.02 BNB，外加少量 gas 手续费，请先给钱包充值后重试'
  }
  if (err?.code === 'ACTION_REJECTED' || err?.code === 4001 || msg.includes('rejected') || msg.includes('denied')) {
    return '你已取消这笔交易'
  }
  if (msg.includes('value not match')) {
    return '铸造金额不符，请刷新页面后重试'
  }
  return '铸造失败，请稍后重试'
}

export default function Launchpad() {
  const account = useStore((s) => s.account)
  const signer = useStore((s) => s.signer)
  const provider = useStore((s) => s.provider)
  const connect = useStore((s) => s.connect)
  const ensureBscChain = useStore((s) => s.ensureBscChain)

  const [price, setPrice] = useState(DEFAULT_PRICE)
  const [minted, setMinted] = useState('-')
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [copied, setCopied] = useState(false)

  const readContract = useCallback(async () => {
    try {
      const read = provider ?? new ethers.JsonRpcProvider(BNB_RPC)
      const c = new ethers.Contract(MINT_CONTRACT_ADDRESS, MINT_ABI, read)
      const [p, m] = await Promise.all([c.price(), c.minted()])
      setPrice(ethers.formatEther(p))
      setMinted(m.toString())
    } catch {
      // 读取失败时保留默认展示
    }
  }, [provider])

  useEffect(() => {
    readContract()
  }, [readContract])

  const handleMint = async () => {
    setErrMsg('')
    if (!account || !signer) {
      await connect()
      return
    }
    const ok = await ensureBscChain()
    if (!ok) return
    try {
      setStatus('pending')
      const read = provider ?? new ethers.JsonRpcProvider(BNB_RPC)
      const c = new ethers.Contract(MINT_CONTRACT_ADDRESS, MINT_ABI, read)
      // 用链上实时价格作为发送金额，避免金额不符被合约 revert
      const value = await c.price()
      const tx = await signer.sendTransaction({ to: MINT_CONTRACT_ADDRESS, value })
      await tx.wait()
      setStatus('success')
      readContract()
      setTimeout(() => setStatus('idle'), 4000)
    } catch (e) {
      setErrMsg(mintError(e))
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  const copyAddr = () => {
    navigator.clipboard.writeText(TOKEN_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shortAddr = `${TOKEN_ADDRESS.slice(0, 6)}...${TOKEN_ADDRESS.slice(-4)}`

  const btnLabel = () => {
    if (status === 'pending') return '铸造中...'
    if (status === 'success') return '铸造成功 ✓'
    if (status === 'error') return '铸造失败，请重试'
    if (!account) return '连接钱包铸造'
    return `立即铸造 · ${price} BNB / 份`
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-custom max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-gold mb-3">Mint</h1>
          <p className="text-gray-400">FORSAGE 2046 公平铸造 · 每份 {price} BNB</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 lg:p-8 gradient-border"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-gold to-orange-500 rounded-2xl flex items-center justify-center pulse-glow">
              <Rocket size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-white">FORSAGE 2046</h2>
              <p className="text-gold">链上公平铸造</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-panel-light rounded-xl text-center">
              <p className="text-gray-500 text-xs mb-1">总量</p>
              <p className="text-white font-display text-lg">{TOTAL_SUPPLY_LABEL}</p>
            </div>
            <div className="p-4 bg-panel-light rounded-xl text-center">
              <p className="text-gray-500 text-xs mb-1">单价</p>
              <p className="text-white font-display text-lg">{price} BNB / 份</p>
            </div>
            <div className="p-4 bg-panel-light rounded-xl text-center">
              <p className="text-gray-500 text-xs mb-1">已铸造</p>
              <p className="text-white font-display text-lg">{minted} 份</p>
            </div>
            <div className="p-4 bg-panel-light rounded-xl text-center">
              <p className="text-gray-500 text-xs mb-1">网络</p>
              <p className="text-white font-display text-lg">BNB Chain</p>
            </div>
          </div>

          {/* 合约地址 */}
          <div className="flex items-center justify-between bg-bg rounded-xl px-4 py-3 mb-6">
            <span className="text-gray-500 text-sm">合约</span>
            <div className="flex items-center gap-2">
              <span className="text-gold font-mono text-sm">{shortAddr}</span>
              <button onClick={copyAddr} className="text-gold hover:bg-gold/10 p-1 rounded transition-colors" title="复制地址">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <a
                href={`https://bscscan.com/address/${TOKEN_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="text-gold hover:bg-gold/10 p-1 rounded transition-colors"
                title="区块浏览器"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {errMsg && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-sm break-words">{errMsg}</p>
            </div>
          )}

          <button
            onClick={handleMint}
            disabled={status === 'pending'}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
              status === 'success'
                ? 'bg-green-500 text-white'
                : status === 'error'
                  ? 'bg-red-500 text-white'
                  : 'btn-gold'
            } ${status === 'pending' ? 'opacity-60 cursor-wait' : ''}`}
          >
            {btnLabel()}
          </button>

          <p className="text-center text-[11px] text-gray-500 mt-3 leading-relaxed">
            点击后钱包将向合约支付 {price} BNB 完成一份铸造。请确认在 BNB Chain 上操作并核对合约地址；链上交易不可撤销。
          </p>
        </motion.div>
      </div>
    </div>
  )
}
