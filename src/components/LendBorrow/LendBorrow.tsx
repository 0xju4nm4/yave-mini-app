"use client";

import { calculateAllMarketsAPY, type AssetAPY } from "@/utils/apyCalculator";
import { chainId, useAaveMarkets } from "@aave/react";
import { useState } from "react";
import Header from "../Header/Header";
import TokenIcon from "../TokenIcon/TokenIcon";
import styles from "./LendBorrow.module.css";

export default function LendBorrow() {
  const [activeTab, setActiveTab] = useState<"lend" | "borrow">("lend");
  const [selectedAsset, setSelectedAsset] = useState<AssetAPY | null>(null);

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
  const sortedAssets = [...allAssets].sort((a, b) => {
    const aAPY = activeTab === "lend" ? a.supplyAPY : a.borrowAPY;
    const bAPY = activeTab === "lend" ? b.supplyAPY : b.borrowAPY;
    return bAPY - aAPY;
  });

  const handleAssetSelect = (asset: AssetAPY) => {
    setSelectedAsset(asset);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.content}>
          <div className={styles.loading}>Loading markets...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.content}>
          <div className={styles.error}>Error loading markets</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "lend" ? styles.active : ""}`}
            onClick={() => setActiveTab("lend")}
          >
            Lend
          </button>
          <button
            className={`${styles.tab} ${activeTab === "borrow" ? styles.active : ""}`}
            onClick={() => setActiveTab("borrow")}
          >
            Borrow
          </button>
        </div>

        {selectedAsset ? (
          <div className={styles.form}>
            <button className={styles.backButton} onClick={() => setSelectedAsset(null)}>
              ← Back to markets
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
                {activeTab === "lend" ? "Supply" : "Borrow"} APY:{" "}
                <span className={styles.apyValue}>
                  {activeTab === "lend"
                    ? selectedAsset.supplyAPYFormatted
                    : selectedAsset.borrowAPYFormatted}
                </span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Amount</label>
              <div className={styles.inputWrapper}>
                <input type="number" className={styles.input} placeholder="0.00" />
                <button className={styles.maxButton}>MAX</button>
              </div>
            </div>

            <div className={styles.info}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>APY</span>
                <span className={styles.infoValue}>
                  {activeTab === "lend"
                    ? selectedAsset.supplyAPYFormatted
                    : selectedAsset.borrowAPYFormatted}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Available</span>
                <span className={styles.infoValue}>--</span>
              </div>
            </div>

            <button className={styles.actionButton}>
              {activeTab === "lend" ? "Supply" : "Borrow"}
            </button>
          </div>
        ) : (
          <div className={styles.marketsList}>
            <div className={styles.marketsHeader}>
              <h2 className={styles.marketsTitle}>
                {activeTab === "lend" ? "Supply Markets" : "Borrow Markets"}
              </h2>
              <p className={styles.marketsSubtitle}>{sortedAssets.length} assets available</p>
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
                    {activeTab === "lend" ? "Supply" : "Borrow"} APY
                    <span className={styles.apyValue}>
                      {activeTab === "lend" ? asset.supplyAPYFormatted : asset.borrowAPYFormatted}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
