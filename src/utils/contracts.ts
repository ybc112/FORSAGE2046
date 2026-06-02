import { ethers } from 'ethers'

// BNB Chain 配置
export const BNB_CHAIN_ID = 56
export const BNB_RPC = 'https://bsc-dataseed.binance.org/'

// PancakeSwap 合约地址
export const PANCAKE_ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
export const PANCAKE_FACTORY_ADDRESS = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'

// WBNB 地址
export const WBNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'

// FORSAGE 2046 MINT 合约：向合约发送 price()（实测 0.02 BNB）即铸造一份，金额不符会 revert
export const MINT_CONTRACT_ADDRESS = '0x9E67B42aa0ACdDBd1C86DdbF7ff3B9a332951534'
export const MINT_ABI = [
  'function price() view returns (uint256)',
  'function minted() view returns (uint256)',
]

// 常用代币列表
export const TOKENS = {
  BNB: {
    symbol: 'BNB',
    name: 'BNB',
    address: '0x0000000000000000000000000000000000000000', // 原生代币
    decimals: 18,
    logo: '🔶',
  },
  WBNB: {
    symbol: 'WBNB',
    name: 'Wrapped BNB',
    address: WBNB_ADDRESS,
    decimals: 18,
    logo: '🔶',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    logo: '💵',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    decimals: 18,
    logo: '💲',
  },
  BUSD: {
    symbol: 'BUSD',
    name: 'Binance USD',
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    decimals: 18,
    logo: '💲',
  },
  CAKE: {
    symbol: 'CAKE',
    name: 'PancakeSwap',
    address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    decimals: 18,
    logo: '🥞',
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum Token',
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    decimals: 18,
    logo: '💎',
  },
  BTCB: {
    symbol: 'BTCB',
    name: 'Bitcoin BEP2',
    address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    decimals: 18,
    logo: '₿',
  },
}

// PancakeSwap Router ABI (简化版)
export const ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)',
  'function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)',
]

// ERC20 ABI (简化版)
export const ERC20_ABI = [
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address recipient, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
]

// 获取 Router 合约实例
export const getRouterContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(PANCAKE_ROUTER_ADDRESS, ROUTER_ABI, signerOrProvider)
}

// 获取 Token 合约实例
export const getTokenContract = (tokenAddress: string, signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(tokenAddress, ERC20_ABI, signerOrProvider)
}

// 获取代币路径
export const getSwapPath = (fromToken: string, toToken: string): string[] => {
  const from = fromToken === TOKENS.BNB.address ? TOKENS.WBNB.address : fromToken
  const to = toToken === TOKENS.BNB.address ? TOKENS.WBNB.address : toToken
  
  // 如果直接交易对存在，直接返回
  if (from === to) return [from]
  
  // 否则通过 WBNB 中转
  if (from !== TOKENS.WBNB.address && to !== TOKENS.WBNB.address) {
    return [from, TOKENS.WBNB.address, to]
  }
  
  return [from, to]
}

// 格式化金额
export const formatAmount = (amount: string, decimals: number): bigint => {
  return ethers.parseUnits(amount, decimals)
}

// 解析金额
export const parseAmount = (amount: bigint, decimals: number): string => {
  return ethers.formatUnits(amount, decimals)
}
