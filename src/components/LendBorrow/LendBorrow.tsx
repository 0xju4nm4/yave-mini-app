"use client";

import { calculateAllMarketsAPY, type AssetAPY } from "@/utils/apyCalculator";
import { chainId, useAaveMarkets } from "@aave/react";
import { callSmartContract } from "@lemoncash/mini-app-sdk";
import { useState } from "react";
import TokenIcon from "../TokenIcon/TokenIcon";
import styles from "./LendBorrow.module.css";

const aaveProxyContract = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";

export default function LendBorrow() {
  const [selectedAsset, setSelectedAsset] = useState<AssetAPY | null>(null);
  const [amount, setAmount] = useState<string>("");

  const {
    data: markets,
    loading,
    error,
  } = useAaveMarkets({
    chainIds: [chainId(8453)],
  });
  const marketsAPY = markets ? calculateAllMarketsAPY(markets) : [];
  const allAssets = marketsAPY.flatMap((market) => market.assets);

  // Sort assets by APY (supply for lend, borrow for borrow)
  const sortedAssets = [...allAssets]
    .sort((a, b) => {
      const aAPY = a.supplyAPY;
      const bAPY = b.supplyAPY;
      return bAPY - aAPY;
    })
    .filter((asset) => asset.supplyAPY > 0.01);

  const handleAssetSelect = (asset: AssetAPY) => {
    setSelectedAsset(asset);
  };

  const supply = async () => {
    try {
      const result = await callSmartContract({
        contractAddress: aaveProxyContract,
        functionName: "supply",
        functionParams: [
          selectedAsset?.address,
          parseInt(amount, selectedAsset?.decimals),
          null,
          null,
        ],
        value: "0",
      });
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  console.log(markets, selectedAsset);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>Loading markets...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.error}>Error loading markets</div>
        </div>
      </div>
    );
  }

  if (selectedAsset) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.form}>
            <button className={styles.backButton} onClick={() => setSelectedAsset(null)}>
              ← Back
            </button>

            <div className={styles.selectedAsset}>
              <div className={styles.assetHeader}>
                <div className={styles.assetHeaderContent}>
                  <TokenIcon
                    symbol={selectedAsset.symbol}
                    address={selectedAsset.address}
                    imageUrl={selectedAsset.imageUrl}
                    size={48}
                  />
                  <div className={styles.assetHeaderText}>
                    <div className={styles.assetSymbol}>{selectedAsset.symbol}</div>
                    <div className={styles.assetName}>{selectedAsset.name}</div>
                  </div>
                </div>
              </div>
              <div className={styles.assetAPY}>
                Supply APY:
                <span className={styles.apyValue}>{selectedAsset.supplyAPYFormatted}%</span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Amount</label>
              <div className={styles.inputWrapper}>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button className={styles.maxButton}>MAX</button>
              </div>
            </div>

            <div className={styles.info}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>APY</span>
                <span className={styles.infoValue}>{selectedAsset.supplyAPYFormatted}%</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Available</span>
                <span className={styles.infoValue}>--</span>
              </div>
            </div>

            <button className={styles.actionButton}>Supply</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.marketsList}>
          <div className={styles.marketsHeader}>
            <h2 className={styles.marketsTitle}>Supply Markets</h2>
          </div>

          <div className={styles.assetsList}>
            {sortedAssets.map((asset) => (
              <button
                key={asset.address}
                className={styles.assetCard}
                onClick={() => handleAssetSelect(asset)}
              >
                <div className={styles.assetInfo}>
                  <TokenIcon
                    symbol={asset.symbol}
                    address={asset.address}
                    imageUrl={asset.imageUrl}
                    size={40}
                    className={styles.assetIcon}
                  />
                  <div className={styles.assetText}>
                    <div className={styles.assetSymbol}>{asset.symbol}</div>
                    <div className={styles.assetName}>{asset.name}</div>
                  </div>
                </div>
                <div className={styles.assetAPY}>
                  Supply APY
                  <span className={styles.apyValue}>{asset.supplyAPYFormatted}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
