// config/tokens.ts
export interface TokenConfig {
  symbol: string;
  address: string;
  decimals: number;
  name: string;
}

export const ELECTRONEUM_TOKENS: Record<string, TokenConfig> = {
  sUSDC: {
    symbol: "sUSDC",
    address: "0x38334FE9b4e7D2A7e92372B446a9820E8eF3Df3d",
    decimals: 18,
    name: "Stacks USDC",
  },
  sUSDT: {
    symbol: "sUSDT",
    address: "0x09cF09d871b26984f052E7631EaCBA9df089E3dA",
    decimals: 18,
    name: "Stacks USDT",
  },
  sBNB: {
    symbol: "sBNB",
    address: "0xA50B70C81F2CccDa119809274EB205c453A23fb5",
    decimals: 18,
    name: "Stacks BNB",
  },
  sETH: {
    symbol: "sETH",
    address: "0x93b4edf2633b4A08880be7Fe00913A7041f1E3ff",
    decimals: 18,
    name: "Stacks ETH",
  },
};

// Función helper para obtener dirección del token por símbolo
export const getTokenAddress = (symbol: string): string | null => {
  const token = ELECTRONEUM_TOKENS[symbol.toUpperCase()];
  return token ? token.address : null;
};

// Función helper para validar si el token existe
export const isValidToken = (symbol: string): boolean => {
  return symbol.toUpperCase() in ELECTRONEUM_TOKENS;
};
