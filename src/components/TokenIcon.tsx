import { useState } from 'react'
import { TOKENS } from '../utils/contracts'

interface TokenIconProps {
  symbol: string
  address: string
  size?: number
}

// 本地已有的 logo（其余走 PancakeSwap 公共 token 图床，失败再降级为首字母徽标）
const LOCAL_LOGOS: Record<string, string> = {
  BNB: '/logo/BNB.png',
  WBNB: '/logo/BNB.png',
  USDT: '/logo/USDT.png',
  FORSAGE: '/logo/forsage.jpg',
}

const GRADIENTS = [
  'linear-gradient(135deg,#f6a623,#e0721d)',
  'linear-gradient(135deg,#4f9cf9,#6a5cf6)',
  'linear-gradient(135deg,#33c27f,#1d9e63)',
  'linear-gradient(135deg,#b06ef7,#7b3ff2)',
]

export default function TokenIcon({ symbol, address, size = 36 }: TokenIconProps) {
  const [errored, setErrored] = useState(false)

  const src =
    LOCAL_LOGOS[symbol] ??
    (address && address !== TOKENS.BNB.address
      ? `https://tokens.pancakeswap.finance/images/${address}.png`
      : undefined)

  if (!src || errored) {
    const grad = GRADIENTS[(symbol.charCodeAt(0) || 0) % GRADIENTS.length]
    return (
      <div
        className="flex items-center justify-center rounded-full font-bold text-white shrink-0"
        style={{ width: size, height: size, background: grad, fontSize: size * 0.42 }}
      >
        {symbol.slice(0, 1)}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={symbol}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className="rounded-full shrink-0 object-cover bg-bg"
      style={{ width: size, height: size }}
    />
  )
}
