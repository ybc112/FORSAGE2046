import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Clock, Trophy, History } from 'lucide-react'
import { useStore } from '../stores/useStore'

interface Prediction {
  id: number
  pair: string
  currentPrice: string
  targetTime: string
  timeLeft: string
  totalUp: string
  totalDown: string
  myPrediction?: 'up' | 'down'
  myStake?: string
  status: 'open' | 'closed'
  result?: 'up' | 'down'
}

const predictions: Prediction[] = [
  {
    id: 1,
    pair: 'BNB/USDT',
    currentPrice: '$320.50',
    targetTime: '2026-06-01 14:00',
    timeLeft: '2小时15分',
    totalUp: '125 BNB',
    totalDown: '89 BNB',
    status: 'open',
  },
  {
    id: 2,
    pair: 'BTC/USDT',
    currentPrice: '$67,420.00',
    targetTime: '2026-06-01 16:00',
    timeLeft: '4小时15分',
    totalUp: '2.5 BTC',
    totalDown: '1.8 BTC',
    status: 'open',
  },
  {
    id: 3,
    pair: 'ETH/USDT',
    currentPrice: '$3,850.20',
    targetTime: '2026-06-01 12:00',
    timeLeft: '15分',
    totalUp: '45 ETH',
    totalDown: '38 ETH',
    myPrediction: 'up',
    myStake: '0.5 ETH',
    status: 'open',
  },
]

const history = [
  { pair: 'BNB/USDT', prediction: 'up' as const, result: 'up' as const, stake: '0.2 BNB', reward: '0.35 BNB', time: '2小时前' },
  { pair: 'BTC/USDT', prediction: 'down' as const, result: 'up' as const, stake: '0.05 BTC', reward: '0 BTC', time: '5小时前' },
  { pair: 'ETH/USDT', prediction: 'up' as const, result: 'up' as const, stake: '0.3 ETH', reward: '0.52 ETH', time: '1天前' },
]

export default function Predict() {
  const { isConnected } = useStore()
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  const [predictionType, setPredictionType] = useState<'up' | 'down'>('up')
  const [stakeAmount, setStakeAmount] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  const handlePredict = async () => {
    if (!isConnected) {
      alert('请先连接钱包')
      return
    }
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert('请输入有效的质押数量')
      return
    }
    alert(`预测 ${selectedPrediction?.pair} ${predictionType === 'up' ? '上涨' : '下跌'}，质押 ${stakeAmount}`)
    setStakeAmount('')
    setSelectedPrediction(null)
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
            预测市场
          </h1>
          <p className="text-gray-400">
            预测币价涨跌，质押参与赢取奖励
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="card p-6 text-center">
            <Trophy size={24} className="text-gold mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-gold">$2.1M</p>
            <p className="text-gray-400 text-sm">总预测金额</p>
          </div>
          <div className="card p-6 text-center">
            <TrendingUp size={24} className="text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-green-400">68%</p>
            <p className="text-gray-400 text-sm">平均胜率</p>
          </div>
          <div className="card p-6 text-center">
            <History size={24} className="text-gold mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-gold">12,847</p>
            <p className="text-gray-400 text-sm">总预测次数</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-lg font-display text-sm transition-all ${
              activeTab === 'active'
                ? 'bg-gold text-black'
                : 'bg-panel-light text-gray-400 hover:text-gold'
            }`}
          >
            进行中
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg font-display text-sm transition-all ${
              activeTab === 'history'
                ? 'bg-gold text-black'
                : 'bg-panel-light text-gray-400 hover:text-gold'
            }`}
          >
            历史记录
          </button>
        </div>

        {/* Active Predictions */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            {predictions.map((prediction) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-display font-bold text-white">{prediction.pair}</h3>
                      <span className="px-2 py-1 bg-green-400/10 text-green-400 text-xs rounded-full">
                        进行中
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>当前价格: {prediction.currentPrice}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        剩余: {prediction.timeLeft}
                      </span>
                    </div>
                    {prediction.myPrediction && (
                      <p className="text-sm text-gold mt-2">
                        我的预测: {prediction.myPrediction === 'up' ? '上涨' : '下跌'} · 质押: {prediction.myStake}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-green-400 mb-1">
                        <TrendingUp size={16} />
                        <span className="font-display font-bold">{prediction.totalUp}</span>
                      </div>
                      <p className="text-gray-500 text-xs">看涨</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-red-400 mb-1">
                        <TrendingDown size={16} />
                        <span className="font-display font-bold">{prediction.totalDown}</span>
                      </div>
                      <p className="text-gray-500 text-xs">看跌</p>
                    </div>
                    <button
                      onClick={() => setSelectedPrediction(prediction)}
                      className="btn-gold text-sm px-6"
                    >
                      参与预测
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-panel-light rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-green-400 transition-all"
                      style={{ 
                        width: `${(parseFloat(prediction.totalUp) / (parseFloat(prediction.totalUp) + parseFloat(prediction.totalDown))) * 100}%` 
                      }}
                    />
                    <div
                      className="h-full bg-red-400 transition-all"
                      style={{ 
                        width: `${(parseFloat(prediction.totalDown) / (parseFloat(prediction.totalUp) + parseFloat(prediction.totalDown))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="card p-6">
            <div className="space-y-4">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-4 border-b border-gold/10 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.prediction === 'up' ? 'bg-green-400/10' : 'bg-red-400/10'
                    }`}>
                      {item.prediction === 'up' ? (
                        <TrendingUp size={20} className="text-green-400" />
                      ) : (
                        <TrendingDown size={20} className="text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-display">{item.pair}</p>
                      <p className="text-gray-500 text-sm">
                        预测{item.prediction === 'up' ? '上涨' : '下跌'} · 质押 {item.stake}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-display font-bold ${
                      item.result === item.prediction ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.result === item.prediction ? `+${item.reward}` : `-${item.stake}`}
                    </p>
                    <p className="text-gray-500 text-sm">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prediction Modal */}
        {selectedPrediction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedPrediction(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="card p-6 lg:p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                预测 {selectedPrediction.pair}
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                当前价格: {selectedPrediction.currentPrice}
              </p>

              {/* Prediction Type */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setPredictionType('up')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    predictionType === 'up'
                      ? 'border-green-400 bg-green-400/10'
                      : 'border-dark-100 hover:border-green-400/50'
                  }`}
                >
                  <TrendingUp size={32} className="text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-display font-bold">看涨</p>
                  <p className="text-gray-500 text-xs mt-1">价格上涨</p>
                </button>
                <button
                  onClick={() => setPredictionType('down')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    predictionType === 'down'
                      ? 'border-red-400 bg-red-400/10'
                      : 'border-dark-100 hover:border-red-400/50'
                  }`}
                >
                  <TrendingDown size={32} className="text-red-400 mx-auto mb-2" />
                  <p className="text-red-400 font-display font-bold">看跌</p>
                  <p className="text-gray-500 text-xs mt-1">价格下跌</p>
                </button>
              </div>

              {/* Stake Amount */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">质押数量</label>
                <div className="relative">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-panel-light border border-gold/20 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-gold focus:outline-none"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gold text-sm">
                    MAX
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  余额: 0 {selectedPrediction.pair.split('/')[0]}
                </p>
              </div>

              {/* Potential Reward */}
              <div className="bg-panel-light rounded-lg p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">潜在奖励</span>
                  <span className="text-green-400">
                    {stakeAmount ? (parseFloat(stakeAmount) * 1.8).toFixed(4) : '0'} {selectedPrediction.pair.split('/')[0]}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">胜率</span>
                  <span className="text-white">{predictionType === 'up' ? '58%' : '42%'}</span>
                </div>
              </div>

              <button
                onClick={handlePredict}
                className="w-full btn-gold py-4"
              >
                确认预测
              </button>

              <button
                onClick={() => setSelectedPrediction(null)}
                className="w-full mt-4 py-3 text-gray-400 hover:text-white transition-colors"
              >
                取消
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
