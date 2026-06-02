// Cloudflare Pages Function — handles POST /api/chat
// (Vercel-style api/chat.js does NOT run on Cloudflare Pages; this does.)
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'
const FALLBACK_DEEPSEEK_API_KEY = 'sk-0f4d2791a63e4f07bd9d410340fe65df'

// 实时行情币种（CoinGecko id -> 展示符号），免费、无需 key
const MARKET_COINS = [
  { id: 'binancecoin', symbol: 'BNB' },
  { id: 'bitcoin', symbol: 'BTC' },
  { id: 'ethereum', symbol: 'ETH' },
  { id: 'solana', symbol: 'SOL' },
  { id: 'ripple', symbol: 'XRP' },
  { id: 'pancakeswap-token', symbol: 'CAKE' },
]

const SYSTEM_PROMPT = `
你是 Forsage AI，面向 FORSAGE2046 的链上投资助手。
要求：
1. 使用简体中文回答，语气专业、直接、适合普通 Web3 用户。
2. 可以分析行情、质押策略、预测市场、项目风险、链上资产配置。
3. 系统会在下方附上部分主流币种的实时行情数据；分析价格、涨跌、成交量时请直接使用这些真实数据，并注明数据时间与来源（CoinGecko）。若被问到未提供数据的币种或链上指标（如 TVL、某些小币），再说明暂无该实时数据、建议用户自行核对，切勿编造未提供的数字。
4. 涉及投资结论时必须提示风险，不得承诺收益。
5. 回答尽量结构清晰，优先给可执行建议。
`.trim()

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return []

  return messages
    .filter((message) => message && ['user', 'assistant'].includes(message.role))
    .map((message) => ({
      role: message.role,
      content: String(message.content || '').slice(0, 4000),
    }))
    .slice(-12)
}

function formatPrice(n) {
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (n >= 1) return n.toFixed(2)
  return n.toPrecision(4)
}

function formatUsd(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`
  return n.toFixed(0)
}

// 拉取实时行情（CoinGecko 免费公共接口）。失败时返回空串，不影响对话。
async function fetchMarketData() {
  try {
    const ids = MARKET_COINS.map((c) => c.id).join(',')
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return ''
    const data = await res.json()
    const lines = MARKET_COINS.map(({ id, symbol }) => {
      const d = data[id]
      if (!d || typeof d.usd !== 'number') return null
      const chg = typeof d.usd_24h_change === 'number' ? d.usd_24h_change : null
      const vol = typeof d.usd_24h_vol === 'number' ? d.usd_24h_vol : null
      const chgStr = chg === null ? '' : ` (24h ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%)`
      const volStr = vol ? `，24h成交额 $${formatUsd(vol)}` : ''
      return `- ${symbol}: $${formatPrice(d.usd)}${chgStr}${volStr}`
    }).filter(Boolean)
    if (lines.length === 0) return ''
    const ts = `${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`
    return `实时行情数据（来源 CoinGecko，更新时间 ${ts}）：\n${lines.join('\n')}`
  } catch {
    return ''
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequestPost({ request, env }) {
  const apiKey = (env && env.DEEPSEEK_API_KEY) || FALLBACK_DEEPSEEK_API_KEY
  if (!apiKey) {
    return json({ error: 'DEEPSEEK_API_KEY is not configured' }, 500)
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { messages, deepThink } = body || {}
    const chatMessages = normalizeMessages(messages)

    if (chatMessages.length === 0) {
      return json({ error: 'messages is required' }, 400)
    }

    const marketData = await fetchMarketData()
    const systemContent = marketData ? `${SYSTEM_PROMPT}\n\n${marketData}` : SYSTEM_PROMPT

    const payload = {
      model: deepThink ? 'deepseek-v4-pro' : 'deepseek-v4-flash',
      messages: [{ role: 'system', content: systemContent }, ...chatMessages],
      stream: false,
      thinking: { type: deepThink ? 'enabled' : 'disabled' },
      ...(deepThink ? { reasoning_effort: 'high' } : { temperature: 0.7 }),
    }

    const upstream = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await upstream.json().catch(() => null)

    if (!upstream.ok) {
      return json(
        { error: data?.error?.message || data?.message || 'DeepSeek request failed' },
        upstream.status,
      )
    }

    const content = data?.choices?.[0]?.message?.content
    if (!content) {
      return json({ error: 'DeepSeek returned an empty response' }, 502)
    }

    return json({ content })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected server error' }, 500)
  }
}
