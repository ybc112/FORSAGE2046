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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
