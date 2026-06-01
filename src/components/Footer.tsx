import { MessageCircle, Globe } from 'lucide-react'

const partners = [
  'BNB Chain', 'PancakeSwap', 'Trust Wallet', 'MetaMask', 'TokenPocket', 'Chainlink'
]

const socialLinks = [
  { icon: MessageCircle, label: 'Telegram', href: '#' },
  { icon: Globe, label: 'Website', href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-bg border-t border-panel-line/60">
      <div className="container-custom py-12">
        {/* Partners Section */}
        <div className="mb-10">
          <h3 className="text-center text-gold font-display text-lg mb-6 tracking-wider">
            生态合作伙伴
          </h3>
          <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
            {partners.map((partner) => (
              <div
                key={partner}
                className="px-6 py-3 card text-gray-400 text-sm font-display hover:text-gold transition-colors cursor-pointer"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mb-8">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="p-3 card text-gray-400 hover:text-gold transition-all hover:scale-110"
              aria-label={link.label}
            >
              <link.icon size={20} />
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gold/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <span className="text-gold font-display font-bold text-lg">FORSAGE2046</span>
              <p className="text-gray-500 text-sm mt-1">
                BNB Chain 全能发射台 · 去中心化自治
              </p>
            </div>
            <div className="text-gray-500 text-sm text-center md:text-right">
              <p> 2026 Forsage2046. All rights reserved.</p>
              <p className="mt-1">安全审计 · 公平铸币 · 质押生息</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
