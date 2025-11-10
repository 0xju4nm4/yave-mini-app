"use client";

import { UserOutlined } from "@ant-design/icons";
import styles from "./Header.module.css";

interface HeaderProps {
  isExpanded?: boolean;
  onExpand?: () => void;
}

export default function Header({ isExpanded = false, onExpand }: HeaderProps) {
  return (
    <header className={`${styles.header} ${isExpanded ? styles.expanded : ""}`}>
      <div className={styles.compact}>
        <div className={styles.logo}>Yave</div>
        <div className={styles.userInfo}>
          <div className={styles.balance}>
            <span className={styles.balanceLabel}>Total</span>
            <span className={styles.balanceValue}>$0.00</span>
          </div>
          <button className={styles.userButton} onClick={onExpand}>
            <UserOutlined />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.userDetails}>
            <div className={styles.avatar}>
              <UserOutlined />
            </div>
            <div className={styles.userStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Wallet</span>
                <span className={styles.statValue}>0x0000...0000</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Net Worth</span>
                <span className={styles.statValue}>$0.00</span>
              </div>
            </div>
          </div>
          <div className={styles.quickStats}>
            <div className={styles.quickStat}>
              <span className={styles.quickStatLabel}>Supplied</span>
              <span className={styles.quickStatValue}>$0.00</span>
            </div>
            <div className={styles.quickStat}>
              <span className={styles.quickStatLabel}>Borrowed</span>
              <span className={styles.quickStatValue}>$0.00</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
