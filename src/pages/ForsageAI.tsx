import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowUp, Globe, Lightbulb, Square } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  '分析一下 BNB 近期走势',
  '帮我推荐一套质押策略',
  'FORSAGE 这个项目前景如何',
  '现在适合参与预测市场吗',
]

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// 无后端，按关键词生成「链上分析」风格的模拟回复
function generateReply(input: string, deepThink: boolean): string {
  const q = input.toLowerCase()
  let body: string

  if (q.includes('bnb')) {
    body =
      'BNB / USDT 当前约 $320，24h +5.2%，置信度 78%。\n\n' +
      '· 技术面：站上短期均线，量能温和放大，结构偏多。\n' +
      '· 资金面：BNB Chain 生态活跃度回升，链上交互上升。\n' +
      '· 操作建议：短期看涨，可分批介入，止损放在 $305 下方。'
  } else if (q.includes('btc') || q.includes('比特币')) {
    body =
      'BTC / USDT 当前约 $67,420，24h -0.8%，置信度 52%。\n\n' +
      '· 多空胶着，处于关键区间震荡。\n' +
      '· 建议观望，等待放量突破方向明确后再跟进。'
  } else if (q.includes('eth') || q.includes('以太')) {
    body =
      'ETH / USDT 当前约 $3,850，24h +2.1%，置信度 65%。\n\n' +
      '· 轻度看涨，跟随大盘节奏。\n' +
      '· 可小仓位参与，注意控制风险敞口。'
  } else if (q.includes('质押') || q.includes('stake') || q.includes('策略')) {
    body =
      '根据你的风险偏好，给三套配置参考：\n\n' +
      '· 保守型（预期 APY 15–25%）：USDT 质押 60% / BNB 质押 30% / 其他 10%。\n' +
      '· 平衡型（25–60%）：LP 挖矿 40% / 单币质押 35% / 预测市场 25%。\n' +
      '· 激进型（60–150%）：新币发射 40% / 高 APY LP 35% / 杠杆 25%。\n\n' +
      '建议先从保守型起步，熟悉机制后再加仓。'
  } else if (q.includes('forsage')) {
    body =
      'FORSAGE / USDT 当前约 $0.052，24h +12.5%，置信度 85%，强烈看涨。\n\n' +
      '· 生态闭环：发币 → 发射 → Swap → 质押 → 预测，相互导流。\n' +
      '· 短期受生态利好驱动，热度较高。\n' +
      '· 注意：新项目波动大，建议仓位可控、分批参与。'
  } else if (q.includes('预测') || q.includes('predict')) {
    body =
      '预测市场平均胜率约 68%，适合用小仓位博取高赔率。\n\n' +
      '· 优先选择临近结算、池子较大的盘口，赔率更稳。\n' +
      '· 单次投入建议不超过总资金的 5%。'
  } else {
    body =
      '我可以帮你分析行情、设计质押/挖矿配置、评估发射与预测机会。\n\n' +
      '你可以这样问我：\n' +
      '· “分析 BNB / BTC / ETH 走势”\n' +
      '· “帮我配一套平衡型质押策略”\n' +
      '· “FORSAGE 现在能不能进”'
  }

  const prefix = deepThink ? '（已开启深度思考）\n\n' : ''
  return prefix + body + '\n\n⚠️ 以上为智能分析，仅供参考，不构成投资建议。'
}

export default function ForsageAI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [deepThink, setDeepThink] = useState(false)
  const [webSearch, setWebSearch] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const stopRef = useRef(false)

  // 自动滚到底部
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // 输入框自适应高度
  useEffect(() => {
    const ta = taRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
    }
  }, [input])

  const send = useCallback(
    async (text: string) => {
      const content = text.trim()
      if (!content || loading) return

      setInput('')
      setMessages((prev) => [...prev, { role: 'user', content }])
      setLoading(true)
      stopRef.current = false

      await sleep(deepThink ? 900 : 450)

      const full = generateReply(content, deepThink)
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      // 打字机式逐步显示
      for (let i = 2; i <= full.length; i += 2) {
        if (stopRef.current) {
          setMessages((prev) => {
            const copy = [...prev]
            copy[copy.length - 1] = { role: 'assistant', content: full }
            return copy
          })
          break
        }
        await sleep(16)
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: full.slice(0, i) }
          return copy
        })
      }

      setLoading(false)
    },
    [loading, deepThink],
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const empty = messages.length === 0

  // 输入框组件（空状态居中、对话态置底复用）
  const InputBar = (
    <div className="w-full">
      <div className="rounded-3xl border border-panel-line bg-panel p-3 focus-within:border-gold/50 transition-colors">
        <textarea
          ref={taRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="给 Forsage AI 发送消息，问问行情或策略…"
          className="w-full bg-transparent text-white outline-none resize-none placeholder-gray-500 px-2 py-1 max-h-40"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeepThink((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                deepThink
                  ? 'bg-gold/15 border-gold/50 text-gold'
                  : 'bg-bg border-panel-line text-muted hover:text-gold'
              }`}
            >
              <Lightbulb size={14} />
              深度思考
            </button>
            <button
              onClick={() => setWebSearch((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                webSearch
                  ? 'bg-gold/15 border-gold/50 text-gold'
                  : 'bg-bg border-panel-line text-muted hover:text-gold'
              }`}
            >
              <Globe size={14} />
              联网搜索
            </button>
          </div>
          <button
            onClick={() => (loading ? (stopRef.current = true) : send(input))}
            disabled={!loading && !input.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              loading
                ? 'bg-panel-light text-white'
                : input.trim()
                  ? 'bg-btn-gold text-black'
                  : 'bg-panel-light text-gray-600 cursor-not-allowed'
            }`}
          >
            {loading ? <Square size={15} className="fill-current" /> : <ArrowUp size={18} />}
          </button>
        </div>
      </div>
      <p className="text-center text-[11px] text-gray-600 mt-2">内容由 AI 模拟生成，仅供参考，请自行甄别风险</p>
    </div>
  )

  return (
    <div className="mt-16 lg:mt-[72px] h-[calc(100vh-64px)] lg:h-[calc(100vh-72px)] flex flex-col">
      {empty ? (
        /* 空状态：居中欢迎 + 输入框 + 建议 */
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center mx-auto mb-5 shadow-gold">
              <Sparkles size={30} className="text-black" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-2">我是 Forsage AI</h1>
            <p className="text-muted mb-8">你的链上投资助手，有什么行情或策略想问的尽管问</p>

            {InputBar}

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="px-4 py-2 rounded-full bg-panel border border-panel-line text-sm text-gray-300 hover:text-gold hover:border-gold/40 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 对话态：消息列表 + 置底输入框 */
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles size={16} className="text-black" />
                    </div>
                  )}
                  <div
                    className={`whitespace-pre-wrap leading-relaxed text-[15px] ${
                      m.role === 'user'
                        ? 'bg-panel border border-panel-line rounded-2xl rounded-tr-sm px-4 py-2.5 text-white max-w-[80%]'
                        : 'text-gray-200 pt-1 max-w-[88%]'
                    }`}
                  >
                    {m.content}
                    {m.role === 'assistant' && loading && i === messages.length - 1 && (
                      <span className="inline-block w-1.5 h-4 align-middle ml-0.5 bg-gold animate-pulse" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="border-t border-panel-line/60 bg-bg/80 backdrop-blur">
            <div className="max-w-2xl mx-auto px-4 py-3">{InputBar}</div>
          </div>
        </>
      )}
    </div>
  )
}
