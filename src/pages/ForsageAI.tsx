import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowUp, Lightbulb, Square } from 'lucide-react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Markdown 渲染样式（让 DeepSeek 返回的 **加粗**、列表、表格等正常显示）
const mdComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h1 className="text-lg font-bold text-white mt-3 mb-2 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-bold text-white mt-3 mb-2 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="text-[15px] font-semibold text-white mt-2 mb-1.5 first:mt-0">{children}</h3>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-gold underline underline-offset-2 break-all">
      {children}
    </a>
  ),
  code: ({ children }) => <code className="bg-bg/60 px-1 py-0.5 rounded text-[13px] text-gold">{children}</code>,
  pre: ({ children }) => <pre className="bg-bg/60 p-3 rounded-lg overflow-x-auto text-[13px] mb-2">{children}</pre>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-gold/40 pl-3 text-gray-400 my-2">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-panel-line px-2 py-1 text-left text-gold">{children}</th>,
  td: ({ children }) => <td className="border border-panel-line px-2 py-1">{children}</td>,
  hr: () => <hr className="border-panel-line my-3" />,
}

export default function ForsageAI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [deepThink, setDeepThink] = useState(false)

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
      const nextMessages: Message[] = [...messages, { role: 'user', content }]
      setMessages(nextMessages)
      setLoading(true)
      stopRef.current = false

      let full = ''
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: nextMessages,
            deepThink,
          }),
        })

        const data = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(data?.error || 'DeepSeek 请求失败')
        }

        full = String(data?.content || '').trim()
        if (!full) {
          throw new Error('DeepSeek 返回了空内容')
        }
      } catch (error) {
        full = `AI 服务暂时不可用：${error instanceof Error ? error.message : '未知错误'}`
      }

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
    [loading, messages, deepThink],
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
      <p className="text-center text-[11px] text-gray-600 mt-2">内容由 DeepSeek 生成，仅供参考，请自行甄别风险</p>
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
                    className={`leading-relaxed text-[15px] ${
                      m.role === 'user'
                        ? 'whitespace-pre-wrap bg-panel border border-panel-line rounded-2xl rounded-tr-sm px-4 py-2.5 text-white max-w-[80%]'
                        : 'text-gray-200 pt-1 max-w-[88%]'
                    }`}
                  >
                    {m.role === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                        {m.content}
                      </ReactMarkdown>
                    ) : (
                      m.content
                    )}
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
