import { motion } from 'framer-motion'
import { Coins, Rocket, ArrowLeftRight, Lock, TrendingUp, Sparkles, ChevronRight, Shield, Zap, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

const stats = [
  { label: 'TVL', value: '$12.5M', suffix: '' },
  { label: '总交易量', value: '89.2', suffix: 'M' },
  { label: '用户数量', value: '15.8', suffix: 'K' },
  { label: '发射项目', value: '128', suffix: '' },
]

const features = [
  {
    icon: Coins,
    title: '一键发币',
    desc: '零代码部署代币合约，支持自定义参数',
    path: '/mint',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Rocket,
    title: '发射台',
    desc: '公平发射，自动流通，流动性注入',
    path: '/launchpad',
    color: 'from-red-400 to-pink-500',
  },
  {
    icon: ArrowLeftRight,
    title: 'Swap交易',
    desc: '自有流动性池，低滑点兑换',
    path: '/swap',
    color: 'from-green-400 to-emerald-500',
  },
  {
    icon: Lock,
    title: '质押挖矿',
    desc: '高收益质押，复利增长',
    path: '/stake',
    color: 'from-blue-400 to-indigo-500',
  },
  {
    icon: TrendingUp,
    title: '预测市场',
    desc: '涨跌预测，质押参与赢奖励',
    path: '/predict',
    color: 'from-purple-400 to-violet-500',
  },
  {
    icon: Sparkles,
    title: '智能分析',
    desc: '市场分析，策略推荐',
    path: '/ai',
    color: 'from-cyan-400 to-teal-500',
  },
]

const highlights = [
  { icon: Shield, title: '低门槛', desc: '零代码即可发币和参与' },
  { icon: Zap, title: '高安全', desc: '代码审计，去中心化运行' },
  { icon: Globe, title: '全闭环', desc: '发行交易质押一体化' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="px-4 py-2 card text-gold text-sm font-display tracking-wider">
                BNB Chain 生态
              </span>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold mb-6 leading-tight">
              <span className="text-gold">FORSAGE2046</span>
            </h1>
            <h2 className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-4 font-display">
              BNB Chain 全能发射台
            </h2>
            <p className="text-lg md:text-xl text-gold mb-4 font-display tracking-wide">
              零代码发币 · 自有Swap交易 · 预测质押挖矿
            </p>
            <p className="text-gray-400 mb-10 text-base md:text-lg">
              去中心化 · 无控盘 · 高收益 · 稳增长
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/mint" className="btn-gold inline-flex items-center justify-center space-x-2 pulse-glow">
                <span>立即开始</span>
                <ChevronRight size={18} />
              </Link>
              <Link to="/mint" className="btn-outline inline-flex items-center justify-center">
                了解更多
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 lg:py-16">
        <div className="container-custom">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="card p-6 text-center hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-2xl lg:text-3xl font-display font-bold text-gold mb-2">
                  {stat.value}
                  <span className="text-lg">{stat.suffix}</span>
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-gold mb-4">
              核心功能
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              一站式DeFi服务平台，覆盖代币发行、交易、质押全场景
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Link to={feature.path}>
                  <div className="card p-6 h-full hover-lift group">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:shadow-gold transition-shadow duration-300`}>
                      <feature.icon size={28} className="text-white" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-gold transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Concept Section */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-8 lg:p-12 text-center max-w-4xl mx-auto gradient-border"
          >
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-gold mb-6">
              Forsage2046｜链上永动机
            </h2>
            <div className="space-y-4 text-lg text-gray-300">
              <p className="font-display">发射即流通 · 流通即增值 · 增值即分红</p>
              <p className="font-display">Swap赋能交易 · 质押驱动收益 · 代码定义公平</p>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {highlights.map((item) => (
                <motion.div
                  key={item.title}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 border border-gold/20 rounded-lg hover:border-gold/50 transition-all duration-300"
                >
                  <item.icon size={24} className="text-gold mx-auto mb-2" />
                  <div className="text-gold font-display font-bold text-xl mb-2">{item.title}</div>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
