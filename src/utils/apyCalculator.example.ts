/**
 * Example usage of APY calculation utilities
 *
 * This file demonstrates how to calculate APY for all markets using the Aave SDK.
 */

import { chainId, useAaveMarkets } from "@aave/react";
import { Market } from "@aave/graphql";
import {
  calculateAllMarketsAPY,
  calculateMarketAPY,
  formatAPY,
  getHighestSupplyAPY,
  getHighestBorrowAPY,
  type MarketAPY,
} from "./apyCalculator";

/**
 * Example 1: Using with React hooks (useAaveMarkets)
 *
 * In your component:
 */
export function ExampleWithHooks() {
  const { data: markets, loading, error } = useAaveMarkets({
    chainIds: [chainId(8453)], // Base chain
  });

  if (loading) return <div>Loading markets...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!markets) return null;

  // Calculate APY for all markets
  const marketsAPY = calculateAllMarketsAPY(markets);

  return (
    <div>
      {marketsAPY.map((marketAPY) => (
        <div key={marketAPY.marketAddress}>
          <h2>{marketAPY.marketName}</h2>
          <p>Chain ID: {marketAPY.chainId}</p>
          <ul>
            {marketAPY.assets.map((asset) => (
              <li key={asset.address}>
                {asset.symbol} ({asset.name}):
                <br />
                Supply APY: {asset.supplyAPYFormatted}
                <br />
                Borrow APY: {asset.borrowAPYFormatted}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 2: Using with AaveClient directly (server-side or outside React)
 *
 * ```ts
 * import { client } from "@/services/aave";
 * import { markets } from "@aave/client/actions";
 * import { chainId } from "@aave/react";
 *
 * async function fetchAndCalculateAPY() {
 *   const result = await markets(client, {
 *     chainIds: [chainId(8453)],
 *   });
 *
 *   if (result.isErr()) {
 *     console.error("Error fetching markets:", result.error);
 *     return;
 *   }
 *
 *   const marketsData = result.value;
 *   const marketsAPY = calculateAllMarketsAPY(marketsData);
 *
 *   return marketsAPY;
 * }
 * ```
 */

/**
 * Example 3: Finding highest APY assets
 */
export function findHighestAPYAssets(marketsAPY: MarketAPY[]) {
  for (const marketAPY of marketsAPY) {
    const highestSupply = getHighestSupplyAPY(marketAPY);
    const highestBorrow = getHighestBorrowAPY(marketAPY);

    console.log(`Market: ${marketAPY.marketName}`);
    if (highestSupply) {
      console.log(
        `Highest Supply APY: ${highestSupply.symbol} at ${highestSupply.supplyAPYFormatted}`
      );
    }
    if (highestBorrow) {
      console.log(
        `Highest Borrow APY: ${highestBorrow.symbol} at ${highestBorrow.borrowAPYFormatted}`
      );
    }
  }
}

/**
 * Example 4: Filtering and sorting assets by APY
 */
export function filterAndSortByAPY(marketsAPY: MarketAPY[]) {
  // Get all assets from all markets
  const allAssets = marketsAPY.flatMap((market) =>
    market.assets.map((asset) => ({
      ...asset,
      marketName: market.marketName,
      chainId: market.chainId,
    }))
  );

  // Sort by supply APY (highest first)
  const sortedBySupplyAPY = [...allAssets].sort(
    (a, b) => b.supplyAPY - a.supplyAPY
  );

  // Sort by borrow APY (highest first)
  const sortedByBorrowAPY = [...allAssets].sort(
    (a, b) => b.borrowAPY - a.borrowAPY
  );

  // Filter assets with supply APY > 5%
  const highSupplyAPY = allAssets.filter((asset) => asset.supplyAPY > 0.05);

  return {
    sortedBySupplyAPY,
    sortedByBorrowAPY,
    highSupplyAPY,
  };
}

/**
 * Example 5: Calculate average APY across all markets
 */
export function calculateAverageAPY(marketsAPY: MarketAPY[]) {
  const allAssets = marketsAPY.flatMap((market) => market.assets);

  if (allAssets.length === 0) {
    return { averageSupplyAPY: 0, averageBorrowAPY: 0 };
  }

  const totalSupplyAPY = allAssets.reduce(
    (sum, asset) => sum + asset.supplyAPY,
    0
  );
  const totalBorrowAPY = allAssets.reduce(
    (sum, asset) => sum + asset.borrowAPY,
    0
  );

  return {
    averageSupplyAPY: totalSupplyAPY / allAssets.length,
    averageBorrowAPY: totalBorrowAPY / allAssets.length,
    averageSupplyAPYFormatted: formatAPY(totalSupplyAPY / allAssets.length),
    averageBorrowAPYFormatted: formatAPY(totalBorrowAPY / allAssets.length),
  };
}
