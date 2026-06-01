import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, TrendingDown, Shield, Zap, BarChart3, AlertTriangle, CheckCircle, Target } from 'lucide-react'

interface Analysis {
  pair: string
  trend: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  price: string
  change24h: string
  recommendation: string
}

const analyses: Analysis[] = [
  {
    pair: 'BNB/USDT',
    trend: 'bullish',
    confidence: 78,
    price: '$320.50',
    change24h: '+5.2%',
    recommendation: '建议买入，短期看涨',
  },
  {
    pair: 'BTC/USDT',
    trend: 'neutral',
    confidence: 52,
    price: '$67,420.00',
    change24h: '-0.8%',
    recommendation: '观望，等待突破',
  },
  {
    pair: 'ETH/USDT',
    trend: 'bullish',
    confidence: 65,
    price: '$3,850.20',
    change24h: '+2.1%',
    recommendation: '轻度看涨，可小仓位',
  },
  {
    pair: 'FORSAGE/USDT',
    trend: 'bullish',
    confidence: 85,
    price: '$0.052',
    change24h: '+12.5%',
    recommendation: '强烈看涨，生态利好',
  },
]

const strategies = [
  {
    name: '保守型',
    icon: Shield,
    description: '低风险，稳定收益',
    apy: '15-25%',
    risk: '低',
    allocation: ['USDT 质押 60%', 'BNB 质押 30%', '其他 10%'],
  },
  {
    name: '平衡型',
    icon: BarChart3,
    description: '中等风险，均衡收益',
    apy: '25-60%',
    risk: '中',
    allocation: ['LP 挖矿 40%', '单币质押 35%', '预测市场 25%'],
  },
  {
    name: '激进型',
    icon: Zap,
    description: '高风险，高收益',
    apy: '60-150%',
    risk: '高',
    allocation: ['新币发射 40%', '高APY LP 35%', '杠杆交易 25%'],
  },
]

const trendConfig = {
  bullish: { label: '看涨', color: 'text-green-400', bg: 'bg-green-400/10', icon: TrendingUp },
  bearish: { label: '看跌', color: 'text-red-400', bg: 'bg-red-400/10', icon: TrendingDown },
  neutral: { label: '中性', color: 'text-gray-400', bg: 'bg-gray-400/10', icon: Target },
}

export default function ForsageAI() {
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleAnalyze = () => {
    setAnalyzing(true)
    setTimeout(() => setAnalyzing(false), 2000)
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-gold mb-4">
            智能分析
          </h1>
          <p className="text-gray-400">
            智能分析市场趋势，提供个性化策略建议
          </p>
        </motion.div>

        {/* AI Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-10 gradient-border"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-gold to-orange-500 rounded-xl flex items-center justify-center pulse-glow">
                <Sparkles size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">智能分析引擎</h2>
                <p className="text-gray-400 text-sm">实时分析 · 智能预测 · 策略推荐</p>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className={`btn-gold ${analyzing ? 'opacity-50 cursor-wait' : ''}`}
            >
              {analyzing ? '分析中...' : '重新分析'}
            </button>
          </div>
        </motion.div>

        {/* Market Analysis */}
        <div className="mb-10">
          <h2 className="text-xl font-display font-bold text-white mb-6">市场分析</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {analyses.map((analysis) => {
              const trend = trendConfig[analysis.trend]
              return (
                <motion.div
                  key={analysis.pair}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-6 hover-lift"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-display font-bold text-white">{analysis.pair}</h3>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${trend.bg} ${trend.color}`}>
                      <trend.icon size={12} />
                      {trend.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-500 text-xs">当前价格</p>
                      <p className="text-white font-display text-lg">{analysis.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">24h 涨跌</p>
                      <p className={`font-display text-lg ${
                        analysis.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {analysis.change24h}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">置信度</span>
                      <span className="text-gold font-display">{analysis.confidence}%</span>
                    </div>
                    <div className="h-2 bg-panel-light rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${analysis.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-panel-light rounded-lg">
                    <CheckCircle size={16} className="text-gold mt-0.5" />
                    <p className="text-sm text-gray-300">{analysis.recommendation}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Strategy Recommendations */}
        <div>
          <h2 className="text-xl font-display font-bold text-white mb-6">策略推荐</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {strategies.map((strategy, index) => (
              <motion.div
                key={strategy.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card p-6 cursor-pointer transition-all duration-300 ${
                  selectedStrategy === index ? 'border-gold scale-105' : ''
                }`}
                onClick={() => setSelectedStrategy(index)}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gold to-orange-500 rounded-xl flex items-center justify-center mb-4">
                  <strategy.icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-2">{strategy.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{strategy.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">预期 APY</span>
                    <span className="text-green-400 font-display">{strategy.apy}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">风险等级</span>
                    <span className={`font-display ${
                      strategy.risk === '低' ? 'text-green-400' :
                      strategy.risk === '中' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {strategy.risk}
                    </span>
                  </div>
                </div>

                <div className="bg-panel-light rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-2">资产配置</p>
                  {strategy.allocation.map((item, i) => (
                    <p key={i} className="text-sm text-gray-300">{item}</p>
                  ))}
                </div>

                {selectedStrategy === index && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full mt-4 btn-gold"
                  >
                    应用此策略
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Risk Warning */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 card p-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-yellow-500 mt-1" />
            <div>
              <h3 className="text-lg font-display font-bold text-yellow-500 mb-2">风险提示</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                智能分析仅供参考，不构成投资建议。加密货币市场波动剧烈，投资有风险，入市需谨慎。
                请根据自身风险承受能力做出投资决策，切勿投入超过承受能力的资金。
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
