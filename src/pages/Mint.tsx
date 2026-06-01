import { useState } from 'react'
import { motion } from 'framer-motion'
import { Coins, Check, AlertCircle, Flame, Zap, Shield, Copy, ExternalLink } from 'lucide-react'

interface TokenConfig {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  maxSupply: string
  burnable: boolean
  mintable: boolean
  pausable: boolean
}

export default function Mint() {
  const [config, setConfig] = useState<TokenConfig>({
    name: '',
    symbol: '',
    decimals: 18,
    totalSupply: '1000000',
    maxSupply: '10000000',
    burnable: true,
    mintable: false,
    pausable: false,
  })

  const [step, setStep] = useState(1)
  const [deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const [contractAddress, setContractAddress] = useState('')
  const [copied, setCopied] = useState(false)

  const handleDeploy = async () => {
    if (!config.name || !config.symbol) {
      alert('请填写代币名称和符号')
      return
    }

    setDeploying(true)
    
    // Simulate deployment
    setTimeout(() => {
      setContractAddress('0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''))
      setDeploying(false)
      setDeployed(true)
    }, 3000)
  }

  const updateConfig = (key: keyof TokenConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(contractAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetForm = () => {
    setConfig({
      name: '',
      symbol: '',
      decimals: 18,
      totalSupply: '1000000',
      maxSupply: '10000000',
      burnable: true,
      mintable: false,
      pausable: false,
    })
    setStep(1)
    setDeployed(false)
    setContractAddress('')
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-gold mb-4">
            一键发币
          </h1>
          <p className="text-gray-400">
            零代码部署 BEP20 代币合约，支持自定义参数
          </p>
        </motion.div>

        {/* Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center space-x-4">
            {[
              { num: 1, label: '配置' },
              { num: 2, label: '预览' },
              { num: 3, label: '部署' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold transition-all ${
                    step >= s.num ? 'bg-gold text-black shadow-gold' : 'bg-panel-light text-gray-500'
                  }`}>
                    {step > s.num ? <Check size={20} /> : s.num}
                  </div>
                  <span className={`text-xs mt-1 font-display ${
                    step >= s.num ? 'text-gold' : 'text-gray-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`w-16 h-0.5 mx-2 mb-5 ${
                    step > s.num ? 'bg-gold' : 'bg-panel-light'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Configuration */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 lg:p-8 gradient-border"
          >
            <h2 className="text-xl font-display font-bold text-white mb-6">代币配置</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">代币名称 *</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => updateConfig('name', e.target.value)}
                  placeholder="例如: Forsage Token"
                  className="w-full bg-panel-light border border-gold/20 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">代币符号 *</label>
                <input
                  type="text"
                  value={config.symbol}
                  onChange={(e) => updateConfig('symbol', e.target.value.toUpperCase())}
                  placeholder="例如: FST"
                  className="w-full bg-panel-light border border-gold/20 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">精度 (Decimals)</label>
                <input
                  type="number"
                  value={config.decimals}
                  onChange={(e) => updateConfig('decimals', parseInt(e.target.value))}
                  min={0}
                  max={18}
                  className="w-full bg-panel-light border border-gold/20 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">初始供应量</label>
                <input
                  type="text"
                  value={config.totalSupply}
                  onChange={(e) => updateConfig('totalSupply', e.target.value)}
                  className="w-full bg-panel-light border border-gold/20 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">最大供应量</label>
                <input
                  type="text"
                  value={config.maxSupply}
                  onChange={(e) => updateConfig('maxSupply', e.target.value)}
                  className="w-full bg-panel-light border border-gold/20 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm text-gray-400 mb-2">高级选项</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-3 cursor-pointer p-3 bg-panel-light rounded-lg border border-gold/10 hover:border-gold/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.burnable}
                    onChange={(e) => updateConfig('burnable', e.target.checked)}
                    className="w-4 h-4 accent-gold"
                  />
                  <Flame size={16} className="text-orange-400" />
                  <span className="text-gray-300 text-sm">可销毁 (Burnable)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 bg-panel-light rounded-lg border border-gold/10 hover:border-gold/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.mintable}
                    onChange={(e) => updateConfig('mintable', e.target.checked)}
                    className="w-4 h-4 accent-gold"
                  />
                  <Zap size={16} className="text-yellow-400" />
                  <span className="text-gray-300 text-sm">可增发 (Mintable)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 bg-panel-light rounded-lg border border-gold/10 hover:border-gold/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.pausable}
                    onChange={(e) => updateConfig('pausable', e.target.checked)}
                    className="w-4 h-4 accent-gold"
                  />
                  <Shield size={16} className="text-blue-400" />
                  <span className="text-gray-300 text-sm">可暂停 (Pausable)</span>
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="btn-gold"
              >
                下一步
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 lg:p-8 gradient-border"
          >
            <h2 className="text-xl font-display font-bold text-white mb-6">预览确认</h2>
            
            <div className="bg-panel-light rounded-xl p-6 mb-6 border border-gold/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-gold to-orange-500 rounded-full flex items-center justify-center pulse-glow">
                  <Coins size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">{config.name || 'Token Name'}</h3>
                  <p className="text-gold text-lg">{config.symbol || 'SYMBOL'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-bg rounded-lg text-center">
                  <p className="text-gray-500 text-xs mb-1">精度</p>
                  <p className="text-white font-display">{config.decimals}</p>
                </div>
                <div className="p-3 bg-bg rounded-lg text-center">
                  <p className="text-gray-500 text-xs mb-1">初始供应量</p>
                  <p className="text-white font-display">{config.totalSupply}</p>
                </div>
                <div className="p-3 bg-bg rounded-lg text-center">
                  <p className="text-gray-500 text-xs mb-1">最大供应量</p>
                  <p className="text-white font-display">{config.maxSupply}</p>
                </div>
                <div className="p-3 bg-bg rounded-lg text-center">
                  <p className="text-gray-500 text-xs mb-1">功能</p>
                  <p className="text-white text-sm">
                    {[
                      config.burnable && '可销毁',
                      config.mintable && '可增发',
                      config.pausable && '可暂停',
                    ].filter(Boolean).join(', ') || '标准'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
              <AlertCircle size={18} className="text-yellow-500 mt-0.5" />
              <p className="text-sm text-yellow-500/80">
                部署代币合约需要支付 Gas 费用。请确保钱包中有足够的 BNB 用于支付网络费用。
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="btn-outline"
              >
                返回修改
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-gold"
              >
                确认部署
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Deploy */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 lg:p-8 text-center gradient-border"
          >
            {!deployed ? (
              <>
                <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 pulse-glow">
                  <Coins size={40} className="text-gold" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-4">
                  部署代币合约
                </h2>
                <p className="text-gray-400 mb-8">
                  确认后将在 BNB Chain 上部署您的代币合约
                </p>
                <button
                  onClick={handleDeploy}
                  disabled={deploying}
                  className={`btn-gold text-lg px-12 py-4 ${
                    deploying ? 'opacity-50 cursor-wait' : ''
                  }`}
                >
                  {deploying ? '部署中...' : '确认部署'}
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-4">
                  部署成功!
                </h2>
                <p className="text-gray-400 mb-6">
                  您的代币合约已成功部署到 BNB Chain
                </p>
                <div className="bg-panel-light rounded-xl p-4 mb-6 border border-gold/10">
                  <p className="text-gray-500 text-sm mb-2">合约地址</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-gold font-mono text-sm break-all">{contractAddress}</p>
                    <button
                      onClick={copyAddress}
                      className="p-2 text-gold hover:bg-gold/10 rounded-lg transition-colors"
                      title="复制地址"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={resetForm}
                    className="btn-outline"
                  >
                    再部署一个
                  </button>
                  <a
                    href={`https://bscscan.com/address/${contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold inline-flex items-center gap-2"
                  >
                    查看区块浏览器
                    <ExternalLink size={16} />
                  </a>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
