import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Gift, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { useStore } from '../stores/useStore'

interface StakePool {
  id: number
  name: string
  token: string
  apy: number
  totalStaked: string
  userStaked: string
  rewards: string
  lockPeriod: string
  status: 'active' | 'ended'
}

const pools: StakePool[] = [
  {
    id: 1,
    name: 'FORSAGE 单币质押',
    token: 'FORSAGE',
    apy: 125.5,
    totalStaked: '2,500,000',
    userStaked: '0',
    rewards: '0',
    lockPeriod: '30天',
    status: 'active',
  },
  {
    id: 2,
    name: 'BNB-FORSAGE LP',
    token: 'LP',
    apy: 280.2,
    totalStaked: '1,200,000',
    userStaked: '0',
    rewards: '0',
    lockPeriod: '60天',
    status: 'active',
  },
  {
    id: 3,
    name: 'USDT 稳定质押',
    token: 'USDT',
    apy: 45.8,
    totalStaked: '5,000,000',
    userStaked: '0',
    rewards: '0',
    lockPeriod: '7天',
    status: 'active',
  },
]

export default function Stake() {
  const { isConnected } = useStore()
  const [selectedPool, setSelectedPool] = useState<StakePool | null>(null)
  const [stakeAmount, setStakeAmount] = useState('')
  const [action, setAction] = useState<'stake' | 'unstake'>('stake')

  const handleStake = async () => {
    if (!isConnected) {
      alert('请先连接钱包')
      return
    }
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert('请输入有效的数量')
      return
    }
    alert(`${action === 'stake' ? '质押' : '解除质押'} ${stakeAmount} ${selectedPool?.token}`)
    setStakeAmount('')
    setSelectedPool(null)
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
            质押挖矿
          </h1>
          <p className="text-gray-400">
            质押代币获取高收益，支持单币和流动性挖矿
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="card p-6 text-center">
            <TrendingUp size={24} className="text-gold mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-gold">$8.7M</p>
            <p className="text-gray-400 text-sm">总质押价值</p>
          </div>
          <div className="card p-6 text-center">
            <Gift size={24} className="text-gold mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-gold">$450K</p>
            <p className="text-gray-400 text-sm">总奖励发放</p>
          </div>
          <div className="card p-6 text-center">
            <Lock size={24} className="text-gold mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-gold">2,847</p>
            <p className="text-gray-400 text-sm">质押用户</p>
          </div>
        </div>

        {/* Stake Pools */}
        <div className="space-y-6">
          {pools.map((pool) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gold to-orange-500 rounded-xl flex items-center justify-center">
                    <Lock size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">{pool.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>质押: {pool.token}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {pool.lockPeriod}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 lg:gap-10">
                  <div className="text-center">
                    <p className="text-2xl font-display font-bold text-green-400">{pool.apy}%</p>
                    <p className="text-gray-400 text-xs">APY</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-display text-white">{pool.totalStaked}</p>
                    <p className="text-gray-400 text-xs">总质押</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-display text-white">{pool.rewards}</p>
                    <p className="text-gray-400 text-xs">待领取</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPool(pool)
                      setAction('stake')
                    }}
                    className="btn-gold text-sm px-6"
                  >
                    质押
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPool(pool)
                      setAction('unstake')
                    }}
                    className="btn-outline text-sm px-6"
                  >
                    取出
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stake Modal */}
        {selectedPool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedPool(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="card p-6 lg:p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                {action === 'stake' ? '质押' : '取出'} {selectedPool.token}
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                {selectedPool.name} · APY {selectedPool.apy}%
              </p>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  {action === 'stake' ? '质押数量' : '取出数量'}
                </label>
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
                  余额: 0 {selectedPool.token}
                </p>
              </div>

              {action === 'stake' && (
                <div className="bg-panel-light rounded-lg p-4 mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">预计收益 (年化)</span>
                    <span className="text-green-400">
                      {stakeAmount ? (parseFloat(stakeAmount) * selectedPool.apy / 100).toFixed(2) : '0'} {selectedPool.token}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">锁定期</span>
                    <span className="text-white">{selectedPool.lockPeriod}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
                <AlertCircle size={16} className="text-yellow-500 mt-0.5" />
                <p className="text-xs text-yellow-500/80">
                  {action === 'stake' 
                    ? '质押后需等待锁定期结束才能取出。提前取出将扣除部分收益。'
                    : '取出后收益将停止计算，已产生的收益会自动发放到钱包。'
                  }
                </p>
              </div>

              <button
                onClick={handleStake}
                className="w-full btn-gold py-4"
              >
                {action === 'stake' ? '确认质押' : '确认取出'}
              </button>

              <button
                onClick={() => setSelectedPool(null)}
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
