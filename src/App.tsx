import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ParticleBg from './components/ParticleBg'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Mint from './pages/Mint'
import Launchpad from './pages/Launchpad'
import Swap from './pages/Swap'
import Stake from './pages/Stake'
import Predict from './pages/Predict'
import ForsageAI from './pages/ForsageAI'
import { useWalletEvents } from './hooks/useWalletEvents'

// 美股板块（链上股票）占位 —— 实际页面后续再做
function StocksComingSoon() {
  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
      <div className="panel max-w-md w-full text-center">
        <h1 className="text-2xl font-extrabold text-white mb-2">美股板块</h1>
        <p className="text-gold mb-2">链上股票 · On-chain Stocks</p>
        <p className="text-muted text-sm">敬请期待，即将上线</p>
      </div>
    </div>
  )
}

function App() {
  useWalletEvents()

  return (
    <Router>
      <div className="relative min-h-screen bg-bg">
        <ParticleBg />
        <Navbar />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mint" element={<Mint />} />
            <Route path="/launchpad" element={<Launchpad />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/stake" element={<Stake />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/ai" element={<ForsageAI />} />
            <Route path="/stocks" element={<StocksComingSoon />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
