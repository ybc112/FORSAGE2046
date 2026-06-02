// Cloudflare Pages Function — handles POST /api/chat
// (Vercel-style api/chat.js does NOT run on Cloudflare Pages; this does.)
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'
const FALLBACK_DEEPSEEK_API_KEY = 'sk-0f4d2791a63e4f07bd9d410340fe65df'

const SYSTEM_PROMPT = `
你是 Forsage AI，面向 FORSAGE2046 的链上投资助手。
要求：
1. 使用简体中文回答，语气专业、直接、适合普通 Web3 用户。
2. 可以分析行情、质押策略、预测市场、项目风险、链上资产配置。
3. 不要编造实时价格、成交量、涨跌幅、APY 或链上数据；没有实时数据时明确说明需要接入行情源或链上池子确认。
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

    const payload = {
      model: deepThink ? 'deepseek-v4-pro' : 'deepseek-v4-flash',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...chatMessages],
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
