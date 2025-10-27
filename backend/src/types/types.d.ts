export interface IUser {
  address: string;
  avatar: string;
  banner: string;
  username: string;
  email: string;
  bio: string;
}

export interface ISwapOrder {
  orderId: number;
  user: string;
  stxAmount: number;
  destinationChain: string;
  destinationAddress: string;
  destinationToken: string;
  expectedAmount: number;
  status: "pending" | "completed" | "refunded" | "cancelled";
  createdAt: number;
  completedAt?: number;
  externalTxHash?: string;
}

export interface IQuoteRequest {
  stxAmount: number;
  destinationChain: string;
  destinationToken: string;
}

export interface IQuoteResponse {
  expectedAmount: number;
  fee: number;
}

export interface ICreateSwapOrderRequest {
  stxAmount: number;
  destinationChain: string;
  destinationAddress: string;
  destinationToken: string;
  expectedAmount: number;
}

export interface IConfirmSwapRequest {
  orderId: number;
  externalTxHash: string;
}

export interface BlockchainData {
  // Datos básicos
  walletAddress: string;
  walletAgeDays: number;
  currentBalance: number;
  maxBalance: number;

  // Actividad transaccional
  totalTransactions: number;
  avgTxPerMonth: number;
  balanceVolatility: number;
  weekendActivityRatio: number;
  lateNightTxRatio: number;

  // DeFi
  defiProtocolsUsed: string[];
  totalDeFiVolume: number;
  lpTokensHeld: number;
  stakingAmount: number;
  governanceVotes: number;

  // Préstamos (del contrato)
  loansTaken: number;
  loansRepaidOnTime: number;
  totalBorrowed: number;
  avgCollateralRatio: number;
  liquidationEvents: number;

  // Red social
  counterpartyReputationAvg: number;
  addressClusteringRisk: number;
  interactsWithScammers: boolean;

  // Específico LATAM
  remittancePatterns: boolean;
  stablecoinPreference: number;
  inflationHedgeBehavior: number;

  // Datos extra para análisis AI
  transactionPatterns: any[];
}
