// src/lib/config/tokens.ts
export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  icon?: string;
  balance?: string;
}

export const ELECTRONEUM_TOKENS: Token[] = [
  {
    symbol: "ETN",
    name: "Electroneum",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    icon: "⚡"
  },
  {
    symbol: "sUSDC",
    name: "Synthetic USDC",
    address: "0x38334FE9b4e7D2A7e92372B446a9820E8eF3Df3d",
    decimals: 18,
    icon: "💵"
  },
  {
    symbol: "sUSDT",
    name: "Synthetic USDT",
    address: "0x09cF09d871b26984f052E7631EaCBA9df089E3dA",
    decimals: 18,
    icon: "💲"
  },
  {
    symbol: "sBNB",
    name: "Synthetic BNB",
    address: "0x9F1DA3Fe5C5C7bEd3793FCC71B4B9eB461251d30",
    decimals: 18,
    icon: "🟡"
  },
  {
    symbol: "sETH",
    name: "Synthetic ETH",
    address: "0xA50B70C81F2CccDa119809274EB205c453A23fb5",
    decimals: 18,
    icon: "💎"
  }
];

export const getTokenBySymbol = (symbol: string): Token | undefined => {
  return ELECTRONEUM_TOKENS.find(
    (token) => token.symbol.toLowerCase() === symbol.toLowerCase()
  );
};
