import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Wallet } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { name: '首页', path: '/' },
  { name: '一键发币', path: '/mint' },
  { name: 'Mint', path: '/launchpad' },
  { name: 'SWAP', path: '/swap' },
  { name: '质押', path: '/stake' },
  { name: 'Deep Lucky 预言机', path: '/predict' },
  { name: 'AI', path: '/ai' },
  { name: '美股', path: '/stocks' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { account, isConnected, connect, disconnect } = useStore()
  const location = useLocation()

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/85 backdrop-blur-md border-b border-panel-line/60">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/logo/forsage2046-logo.jpg"
              alt="FORSAGE2046"
              className="h-9 w-[180px] object-contain object-left lg:h-10 lg:w-[220px]"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-semibold tracking-wide transition-all duration-300 rounded-lg relative ${
                  location.pathname === item.path ? 'text-gold' : 'text-gray-400 hover:text-gold'
                }`}
              >
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gold/10 rounded-lg border border-gold/30"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Wallet Button */}
          <div className="hidden lg:block">
            {isConnected && account ? (
              <button
                onClick={disconnect}
                className="flex items-center space-x-2 px-4 py-2 bg-panel border border-panel-line rounded-2xl text-gold hover:border-gold/50 transition-all font-semibold text-sm"
              >
                <Wallet size={16} />
                <span>{formatAddress(account)}</span>
              </button>
            ) : (
              <button onClick={connect} className="btn-gold text-sm py-2">
                <Wallet size={16} />
                <span>连接钱包</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-gold p-2 hover:bg-gold/10 rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden pb-4"
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 text-sm font-semibold tracking-wide transition-all rounded-xl ${
                    location.pathname === item.path
                      ? 'text-gold bg-gold/10 border border-gold/30'
                      : 'text-gray-400 hover:text-gold hover:bg-gold/5'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2">
                {isConnected && account ? (
                  <button
                    onClick={disconnect}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-panel border border-panel-line rounded-2xl text-gold font-semibold"
                  >
                    <Wallet size={16} />
                    <span>{formatAddress(account)}</span>
                  </button>
                ) : (
                  <button onClick={connect} className="w-full btn-gold">
                    <Wallet size={16} />
                    <span>连接钱包</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}
