"use client";

import { SwapOutlined } from "@ant-design/icons";
import Header from "../Header/Header";
import styles from "./Swap.module.css";

export default function Swap() {
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>From</label>
            <div className={styles.inputRow}>
              <input
                type="number"
                className={styles.input}
                placeholder="0.00"
              />
              <select className={styles.assetSelect}>
                <option value="usdc">USDC</option>
                <option value="usdt">USDT</option>
                <option value="dai">DAI</option>
              </select>
            </div>
            <div className={styles.balance}>
              <span className={styles.balanceLabel}>Balance: </span>
              <span className={styles.balanceValue}>0.00</span>
            </div>
          </div>

          <div className={styles.swapButton}>
            <button className={styles.swapIconButton}>
              <SwapOutlined />
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>To</label>
            <div className={styles.inputRow}>
              <input
                type="number"
                className={styles.input}
                placeholder="0.00"
              />
              <select className={styles.assetSelect}>
                <option value="usdt">USDT</option>
                <option value="usdc">USDC</option>
                <option value="dai">DAI</option>
              </select>
            </div>
            <div className={styles.balance}>
              <span className={styles.balanceLabel}>Balance: </span>
              <span className={styles.balanceValue}>0.00</span>
            </div>
          </div>

          <div className={styles.info}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Rate</span>
              <span className={styles.infoValue}>1 USDC = 1.00 USDT</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Slippage</span>
              <span className={styles.infoValue}>0.5%</span>
            </div>
          </div>

          <button className={styles.actionButton}>Swap</button>
        </div>
      </div>
    </div>
  );
}
