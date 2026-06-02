import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { ArrowDownUp, ChevronDown, Settings, BarChart3, X, Search } from 'lucide-react'
import { useSwap } from '../hooks/useSwap'
import { useStore } from '../stores/useStore'
import { TOKENS } from '../utils/contracts'
import TokenIcon from '../components/TokenIcon'

interface TokenOption {
  symbol: string
  name: string
  address: string
  decimals: number
  logo: string
}

// 可交易代币（排除 WBNB，原生 BNB 已覆盖）
const tokenList: TokenOption[] = Object.values(TOKENS).filter((t) => t.symbol !== 'WBNB')

const SLIPPAGE_PRESETS = [0.1, 0.5, 1]

export default function Swap() {
  const { account, loading, error, connectWallet, getTokenBalance, getAmountOut, checkAllowance, approveToken, executeSwap, getTokenInfo } =
    useSwap()
  const isConnected = useStore((s) => s.isConnected)

  const [fromToken, setFromToken] = useState<TokenOption>(tokenList.find((t) => t.symbol === 'BNB') ?? tokenList[0]) // BNB
  const [toToken, setToToken] = useState<TokenOption>(tokenList.find((t) => t.symbol === 'FORSAGE') ?? tokenList[1]) // FORSAGE
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [fromBalance, setFromBalance] = useState('0')
  const [toBalance, setToBalance] = useState('0')
  const [slippage, setSlippage] = useState(0.5)
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'pending' | 'success' | 'error'>('idle')
  const [needsApproval, setNeedsApproval] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [picker, setPicker] = useState<null | 'from' | 'to'>(null)
  const [search, setSearch] = useState('')
  // 用户通过合约地址导入的代币（会话内保留）
  const [customTokens, setCustomTokens] = useState<TokenOption[]>([])
  const [customToken, setCustomToken] = useState<TokenOption | null>(null)
  const [importing, setImporting] = useState(false)

  const allTokens = [...tokenList, ...customTokens]

  // 拉取余额（未连接时 getTokenBalance 返回 '0'，无需同步 setState）
  useEffect(() => {
    getTokenBalance(fromToken.address).then(setFromBalance)
    getTokenBalance(toToken.address).then(setToBalance)
  }, [account, fromToken, toToken, getTokenBalance])

  // 实时报价
  useEffect(() => {
    let active = true
    const calc = async () => {
      if (fromAmount && parseFloat(fromAmount) > 0) {
        const out = await getAmountOut(fromAmount, fromToken.address, toToken.address, fromToken.decimals, toToken.decimals)
        if (active) setToAmount(out)
      } else {
        setToAmount('')
      }
    }
    calc()
    return () => {
      active = false
    }
  }, [fromAmount, fromToken, toToken, getAmountOut])

  // 授权检查
  useEffect(() => {
    const check = async () => {
      if (account && fromAmount && parseFloat(fromAmount) > 0 && fromToken.address !== TOKENS.BNB.address) {
        const allowance = await checkAllowance(fromToken.address)
        let amountWei: bigint
        try {
          amountWei = ethers.parseUnits(fromAmount || '0', fromToken.decimals)
        } catch {
          amountWei = 0n
        }
        setNeedsApproval(allowance < amountWei)
      } else {
        setNeedsApproval(false)
      }
    }
    check()
  }, [account, fromAmount, fromToken, checkAllowance])

  // 在选币弹层里粘贴合约地址 → 读取链上信息，作为可导入代币
  useEffect(() => {
    const q = search.trim()
    const isAddress = /^0x[a-fA-F0-9]{40}$/.test(q)
    const known =
      tokenList.some((t) => t.address.toLowerCase() === q.toLowerCase()) ||
      customTokens.some((t) => t.address.toLowerCase() === q.toLowerCase())
    if (!isAddress || known) {
      setCustomToken(null)
      setImporting(false)
      return
    }
    let active = true
    setImporting(true)
    getTokenInfo(q).then((info) => {
      if (!active) return
      setCustomToken(info)
      setImporting(false)
    })
    return () => {
      active = false
    }
  }, [search, getTokenInfo, customTokens])

  const handleSwap = async () => {
    if (!account) {
      connectWallet()
      return
    }
    if (!fromAmount || parseFloat(fromAmount) <= 0) return

    if (needsApproval) {
      setTxStatus('approving')
      const approved = await approveToken(fromToken.address, fromAmount)
      if (!approved) {
        setTxStatus('error')
        setTimeout(() => setTxStatus('idle'), 3000)
        return
      }
      setNeedsApproval(false)
    }

    setTxStatus('pending')
    const success = await executeSwap(fromAmount, toAmount, fromToken.address, toToken.address, slippage, fromToken.decimals, toToken.decimals)
    if (success) {
      setTxStatus('success')
      setFromAmount('')
      setToAmount('')
      getTokenBalance(fromToken.address).then(setFromBalance)
      getTokenBalance(toToken.address).then(setToBalance)
    } else {
      setTxStatus('error')
    }
    setTimeout(() => setTxStatus('idle'), 3000)
  }

  const switchTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const selectToken = (token: TokenOption) => {
    const inList =
      tokenList.some((t) => t.address.toLowerCase() === token.address.toLowerCase()) ||
      customTokens.some((t) => t.address.toLowerCase() === token.address.toLowerCase())
    if (!inList) setCustomTokens((prev) => [...prev, token])

    if (picker === 'from') {
      if (token.address === toToken.address) switchTokens()
      else setFromToken(token)
    } else if (picker === 'to') {
      if (token.address === fromToken.address) switchTokens()
      else setToToken(token)
    }
    setPicker(null)
    setSearch('')
    setCustomToken(null)
  }

  const setPercent = (pct: number) => {
    const bal = parseFloat(fromBalance)
    if (bal > 0) setFromAmount(((bal * pct) / 100).toString())
  }

  const sliderPct = (() => {
    const bal = parseFloat(fromBalance)
    const amt = parseFloat(fromAmount)
    if (!bal || !amt) return 0
    return Math.min(100, Math.round((amt / bal) * 100))
  })()

  const rate =
    fromAmount && toAmount && parseFloat(fromAmount) > 0
      ? (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)
      : '0'

  const minReceived =
    toAmount && parseFloat(toAmount) > 0 ? (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6) : '0'

  const buttonLabel = () => {
    if (txStatus === 'approving') return '授权中...'
    if (txStatus === 'pending') return '交易提交中...'
    if (txStatus === 'success') return '交易成功 ✓'
    if (txStatus === 'error') return '交易失败'
    if (!account) return '连接钱包'
    if (!fromAmount || parseFloat(fromAmount) <= 0) return '输入数量'
    if (parseFloat(fromAmount) > parseFloat(fromBalance)) return `${fromToken.symbol} 余额不足`
    if (needsApproval) return `授权 ${fromToken.symbol}`
    return '兑换'
  }

  const buttonDisabled =
    loading ||
    txStatus === 'pending' ||
    txStatus === 'approving' ||
    (!!account && (!fromAmount || parseFloat(fromAmount) <= 0 || parseFloat(fromAmount) > parseFloat(fromBalance)))

  const filteredTokens = allTokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.address.toLowerCase() === search.trim().toLowerCase(),
  )

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-[480px] mx-auto">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-extrabold text-white">
            FORSAGE <span className="text-gold">Swap</span>
          </h1>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-panel border border-panel-line text-gold hover:border-gold/50 transition-colors">
              <BarChart3 size={18} />
            </button>
            <button
              onClick={() => setShowSettings((v) => !v)}
              className="p-2.5 rounded-xl bg-panel border border-panel-line text-gold hover:border-gold/50 transition-colors"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* 主兑换面板 */}
        <div className="panel relative">
          {/* 滑点设置弹层 */}
          {showSettings && (
            <div className="absolute right-5 top-5 z-20 w-64 card p-4 shadow-panel">
              <p className="text-sm text-muted mb-3">滑点容差</p>
              <div className="flex items-center gap-2">
                {SLIPPAGE_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSlippage(p)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      slippage === p ? 'bg-btn-gold text-black' : 'bg-bg text-muted hover:text-gold'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
                <div className="flex items-center gap-1 surface px-2 py-1.5 rounded-lg flex-1">
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(Math.max(0, Math.min(50, parseFloat(e.target.value) || 0)))}
                    className="w-full bg-transparent text-right text-white text-sm outline-none"
                  />
                  <span className="text-muted text-sm">%</span>
                </div>
              </div>
            </div>
          )}

          {/* From */}
          <div className="surface p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setPicker('from')}
                className="flex items-center gap-2 bg-panel hover:bg-panel-light border border-panel-line rounded-full pl-1.5 pr-3 py-1.5 transition-colors"
              >
                <TokenIcon symbol={fromToken.symbol} address={fromToken.address} size={28} />
                <span className="font-bold text-white">{fromToken.symbol}</span>
                <ChevronDown size={16} className="text-muted" />
              </button>
              <span className="text-muted text-sm">余额: {parseFloat(fromBalance).toFixed(4)}</span>
            </div>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-gray-600"
            />
            {/* 百分比 + 滑块 */}
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={sliderPct}
                onChange={(e) => setPercent(parseInt(e.target.value))}
                className="range-gold flex-1"
              />
              <div className="flex gap-1">
                {[25, 50, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPercent(p)}
                    className="px-2 py-1 text-xs rounded-md bg-panel border border-panel-line text-muted hover:text-gold hover:border-gold/40 transition-colors"
                  >
                    {p === 100 ? 'MAX' : `${p}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 切换 */}
          <div className="flex justify-center -my-3 relative z-10">
            <button
              onClick={switchTokens}
              className="p-2.5 bg-panel rounded-xl text-gold border border-panel-line hover:border-gold/60 hover:rotate-180 transition-all duration-300"
            >
              <ArrowDownUp size={18} />
            </button>
          </div>

          {/* To */}
          <div className="surface p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setPicker('to')}
                className="flex items-center gap-2 bg-panel hover:bg-panel-light border border-panel-line rounded-full pl-1.5 pr-3 py-1.5 transition-colors"
              >
                <TokenIcon symbol={toToken.symbol} address={toToken.address} size={28} />
                <span className="font-bold text-white">{toToken.symbol}</span>
                <ChevronDown size={16} className="text-muted" />
              </button>
              <span className="text-muted text-sm">余额: {parseFloat(toBalance).toFixed(4)}</span>
            </div>
            <input
              type="text"
              value={toAmount ? parseFloat(toAmount).toFixed(6) : ''}
              readOnly
              placeholder="0.0"
              className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-gray-600"
            />
          </div>

          {/* 报价信息 */}
          {fromAmount && parseFloat(fromAmount) > 0 && (
            <div className="mt-4 surface p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">汇率</span>
                <span className="text-white">
                  1 {fromToken.symbol} ≈ {rate} {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">最小到账 (滑点 {slippage}%)</span>
                <span className="text-white">
                  {minReceived} {toToken.symbol}
                </span>
              </div>
            </div>
          )}

          {/* 错误 */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm text-center break-words">{error}</p>
            </div>
          )}

          {/* 操作按钮 */}
          <button
            onClick={handleSwap}
            disabled={buttonDisabled}
            className={`w-full mt-4 py-4 rounded-2xl font-bold text-base transition-all ${
              txStatus === 'success'
                ? 'bg-green-500 text-white'
                : txStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'btn-gold'
            } ${buttonDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {buttonLabel()}
          </button>
        </div>

        {!isConnected && (
          <p className="text-center text-muted text-sm mt-4">连接钱包后即可在 BNB Chain 上兑换</p>
        )}
      </div>

      {/* 代币选择器 */}
      {picker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setPicker(null)}
        >
          <div className="panel w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">选择代币</h3>
              <button onClick={() => setPicker(null)} className="text-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="surface flex items-center gap-2 px-3 py-2.5 mb-4">
              <Search size={16} className="text-muted" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索名称或符号"
                className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-600"
              />
            </div>
            <div className="max-h-80 overflow-y-auto -mx-2">
              {filteredTokens.map((token) => {
                const active = token.address === fromToken.address || token.address === toToken.address
                return (
                  <button
                    key={token.address}
                    onClick={() => selectToken(token)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-panel-light transition-colors text-left"
                  >
                    <TokenIcon symbol={token.symbol} address={token.address} size={36} />
                    <div className="flex-1">
                      <p className="font-bold text-white">{token.symbol}</p>
                      <p className="text-xs text-muted">{token.name}</p>
                    </div>
                    {active && <span className="text-xs text-gold">已选</span>}
                  </button>
                )
              })}
              {filteredTokens.length === 0 && importing && (
                <p className="text-center text-muted text-sm py-8">查询链上代币信息…</p>
              )}
              {filteredTokens.length === 0 && !importing && customToken && (
                <>
                  <button
                    onClick={() => selectToken(customToken)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-panel-light transition-colors text-left"
                  >
                    <TokenIcon symbol={customToken.symbol} address={customToken.address} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white">{customToken.symbol}</p>
                      <p className="text-xs text-muted truncate">{customToken.name}</p>
                    </div>
                    <span className="text-xs text-gold border border-gold/40 rounded-md px-2 py-1 shrink-0">导入</span>
                  </button>
                  <p className="text-[11px] text-muted px-3 pt-2 leading-relaxed">
                    导入的代币请自行核实合约地址、注意诈骗风险；需在 PancakeSwap 有流动性池才能交易。
                  </p>
                </>
              )}
              {filteredTokens.length === 0 && !importing && !customToken && (
                <p className="text-center text-muted text-sm py-8">未找到代币，可粘贴合约地址（0x…）导入</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
