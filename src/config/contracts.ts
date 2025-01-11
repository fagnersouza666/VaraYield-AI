// Mantle Network Contract Addresses
export const CONTRACTS = {
  // Core Protocol Contracts
  STAKING: {
    address: '0x1234567890123456789012345678901234567890', // Replace with actual staking contract
    name: 'MNT Staking',
    symbol: 'stMNT'
  },
  
  // Liquidity Pools
  POOLS: {
    MNT_ETH: {
      address: '0x2345678901234567890123456789012345678901', // Replace with actual pool contract
      name: 'MNT-ETH LP',
      tokens: ['MNT', 'ETH']
    },
    MNT_USDC: {
      address: '0x3456789012345678901234567890123456789012', // Replace with actual pool contract
      name: 'MNT-USDC LP',
      tokens: ['MNT', 'USDC']
    },
    STMNT_MNT: {
      address: '0x4567890123456789012345678901234567890123', // Replace with actual pool contract
      name: 'stMNT-MNT LP',
      tokens: ['stMNT', 'MNT']
    }
  },

  // Farming/Rewards
  FARMING: {
    address: '0x5678901234567890123456789012345678901234', // Replace with actual farming contract
    name: 'Yield Farming'
  },

  // Token Addresses
  TOKENS: {
    MNT: {
      address: '0x6789012345678901234567890123456789012345', // Replace with MNT token
      name: 'Mantle',
      symbol: 'MNT',
      decimals: 18
    },
    USDC: {
      address: '0x7890123456789012345678901234567890123456', // Replace with USDC token
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6
    }
  }
} as const;

// Network Configuration
export const NETWORK = {
  id: 5000, // Mantle Mainnet
  name: 'Mantle',
  rpcUrl: 'https://rpc.mantle.xyz',
  explorerUrl: 'https://explorer.mantle.xyz'
} as const;

// Contract ABIs
// Note: These should be imported from separate ABI files
export const ABIS = {
  STAKING: [], // Import actual ABI
  FARMING: [], // Import actual ABI
  LP_TOKEN: [], // Import actual ABI
  ERC20: []    // Import actual ABI
} as const;