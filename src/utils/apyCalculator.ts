import { Market, Reserve } from "@aave/graphql";

/**
 * Represents APY information for a single asset/reserve
 */
export interface AssetAPY {
  symbol: string;
  name: string;
  address: string;
  imageUrl?: string;
  supplyAPY: number;
  borrowAPY: number;
  supplyAPYFormatted: string;
  borrowAPYFormatted: string;
}

/**
 * Represents APY information for all assets in a market
 */
export interface MarketAPY {
  marketName: string;
  marketAddress: string;
  chainId: number;
  assets: AssetAPY[];
}

/**
 * Extracts APY information from a single Reserve
 */
export function extractReserveAPY(reserve: Reserve): AssetAPY | null {
  // Check if reserve has supply and borrow info
  if (!reserve.supplyInfo || !reserve.borrowInfo) {
    return null;
  }

  return {
    symbol: reserve.underlyingToken.symbol,
    name: reserve.underlyingToken.name,
    address: reserve.underlyingToken.address,
    imageUrl: reserve.underlyingToken.imageUrl || undefined,
    supplyAPY: Number(reserve.supplyInfo.apy.value),
    borrowAPY: Number(reserve.borrowInfo.apy.value),
    supplyAPYFormatted: reserve.supplyInfo.apy.formatted,
    borrowAPYFormatted: reserve.borrowInfo.apy.formatted,
  };
}

/**
 * Calculates APY for all reserves in a single market
 *
 * The Market type includes both `borrowReserves` and `supplyReserves` arrays.
 * We combine them to get all unique reserves (some assets may appear in both).
 */
export function calculateMarketAPY(market: Market): MarketAPY {
  const assets: AssetAPY[] = [];
  const seenAddresses = new Set<string>();

  // Process supply reserves
  if ("supplyReserves" in market && Array.isArray(market.supplyReserves)) {
    for (const reserve of market.supplyReserves) {
      const reserveAddress = reserve.underlyingToken.address;
      if (!seenAddresses.has(reserveAddress)) {
        seenAddresses.add(reserveAddress);
        const apy = extractReserveAPY(reserve as Reserve);
        if (apy) {
          assets.push(apy);
        }
      }
    }
  }

  // Process borrow reserves (may include assets not in supply reserves)
  if ("borrowReserves" in market && Array.isArray(market.borrowReserves)) {
    for (const reserve of market.borrowReserves) {
      const reserveAddress = reserve.underlyingToken.address;
      if (!seenAddresses.has(reserveAddress)) {
        seenAddresses.add(reserveAddress);
        const apy = extractReserveAPY(reserve as Reserve);
        if (apy) {
          assets.push(apy);
        }
      }
    }
  }

  return {
    marketName: market.name,
    marketAddress: market.address,
    chainId: Number(market.chain.chainId),
    assets,
  };
}

/**
 * Calculates APY for all markets
 *
 * @param markets - Array of Market objects from useAaveMarkets
 * @returns Array of MarketAPY objects with APY information for each market
 */
export function calculateAllMarketsAPY(markets: Market[]): MarketAPY[] {
  return markets.map(calculateMarketAPY);
}

/**
 * Helper function to format APY as percentage
 */
export function formatAPY(apy: number): string {
  return `${(apy * 100).toFixed(2)}%`;
}

/**
 * Helper function to get the highest supply APY asset from a market
 */
export function getHighestSupplyAPY(marketAPY: MarketAPY): AssetAPY | null {
  if (marketAPY.assets.length === 0) {
    return null;
  }

  return marketAPY.assets.reduce((highest, current) => {
    return current.supplyAPY > highest.supplyAPY ? current : highest;
  });
}

/**
 * Helper function to get the highest borrow APY asset from a market
 */
export function getHighestBorrowAPY(marketAPY: MarketAPY): AssetAPY | null {
  if (marketAPY.assets.length === 0) {
    return null;
  }

  return marketAPY.assets.reduce((highest, current) => {
    return current.borrowAPY > highest.borrowAPY ? current : highest;
  });
}
