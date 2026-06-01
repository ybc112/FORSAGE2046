import { useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Clock, Users, Target, ChevronRight } from 'lucide-react'

interface LaunchProject {
  id: number
  name: string
  symbol: string
  status: 'upcoming' | 'live' | 'ended'
  startTime: string
  endTime: string
  totalRaise: string
  participants: number
  progress: number
  price: string
  description: string
}

const projects: LaunchProject[] = [
  {
    id: 1,
    name: 'Forsage Token',
    symbol: 'FST',
    status: 'live',
    startTime: '2026-06-01 00:00',
    endTime: '2026-06-07 23:59',
    totalRaise: '500 BNB',
    participants: 128,
    progress: 65,
    price: '1 BNB = 10000 FST',
    description: 'Forsage2046 生态治理代币，持有可享受平台收益分红',
  },
  {
    id: 2,
    name: 'Metaverse Coin',
    symbol: 'MVC',
    status: 'upcoming',
    startTime: '2026-06-10 00:00',
    endTime: '2026-06-17 23:59',
    totalRaise: '300 BNB',
    participants: 0,
    progress: 0,
    price: '1 BNB = 5000 MVC',
    description: '元宇宙生态通用代币，支持跨链流通',
  },
  {
    id: 3,
    name: 'GameFi Token',
    symbol: 'GFT',
    status: 'ended',
    startTime: '2026-05-20 00:00',
    endTime: '2026-05-27 23:59',
    totalRaise: '800 BNB',
    participants: 256,
    progress: 100,
    price: '1 BNB = 20000 GFT',
    description: 'GameFi 游戏平台代币，用于游戏内交易和奖励',
  },
]

const statusConfig = {
  upcoming: { label: '即将开始', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  live: { label: '进行中', color: 'text-green-400', bg: 'bg-green-400/10' },
  ended: { label: '已结束', color: 'text-gray-400', bg: 'bg-gray-400/10' },
}

export default function Launchpad() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'ended'>('all')
  const [selectedProject, setSelectedProject] = useState<LaunchProject | null>(null)

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.status === filter)

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-gold mb-4">
            发射台
          </h1>
          <p className="text-gray-400">
            公平发射，自动流通，发现下一个明星项目
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {(['all', 'upcoming', 'live', 'ended'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg font-display text-sm transition-all ${
                filter === f
                  ? 'bg-gold text-black'
                  : 'bg-panel-light text-gray-400 hover:text-gold'
              }`}
            >
              {f === 'all' ? '全部' : f === 'upcoming' ? '即将开始' : f === 'live' ? '进行中' : '已结束'}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 hover:scale-[1.02] transition-transform cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gold to-orange-500 rounded-xl flex items-center justify-center">
                    <Rocket size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">{project.name}</h3>
                    <p className="text-gold text-sm">{project.symbol}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-display ${statusConfig[project.status].bg} ${statusConfig[project.status].color}`}>
                  {statusConfig[project.status].label}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-4">{project.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Target size={14} className="text-gold" />
                  <span>募集: {project.totalRaise}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users size={14} className="text-gold" />
                  <span>参与: {project.participants}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock size={14} className="text-gold" />
                  <span>{project.startTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="text-gold">价格:</span>
                  <span>{project.price}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">进度</span>
                  <span className="text-gold font-display">{project.progress}%</span>
                </div>
                <div className="h-2 bg-panel-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <button className="w-full py-3 bg-gold/10 border border-gold/30 rounded-lg text-gold font-display text-sm hover:bg-gold/20 transition-all flex items-center justify-center gap-2">
                查看详情
                <ChevronRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Project Detail Modal */}
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="card p-6 lg:p-8 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-gold to-orange-500 rounded-xl flex items-center justify-center">
                  <Rocket size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">{selectedProject.name}</h2>
                  <p className="text-gold">{selectedProject.symbol}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-2 border-b border-gold/10">
                  <span className="text-gray-400">状态</span>
                  <span className={`${statusConfig[selectedProject.status].color}`}>
                    {statusConfig[selectedProject.status].label}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gold/10">
                  <span className="text-gray-400">开始时间</span>
                  <span className="text-white">{selectedProject.startTime}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gold/10">
                  <span className="text-gray-400">结束时间</span>
                  <span className="text-white">{selectedProject.endTime}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gold/10">
                  <span className="text-gray-400">募集目标</span>
                  <span className="text-white">{selectedProject.totalRaise}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gold/10">
                  <span className="text-gray-400">兑换比例</span>
                  <span className="text-gold">{selectedProject.price}</span>
                </div>
              </div>

              {selectedProject.status === 'live' && (
                <button className="w-full btn-gold py-4">
                  立即参与
                </button>
              )}

              <button
                onClick={() => setSelectedProject(null)}
                className="w-full mt-4 py-3 text-gray-400 hover:text-white transition-colors"
              >
                关闭
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
