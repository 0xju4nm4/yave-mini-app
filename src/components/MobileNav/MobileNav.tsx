"use client";

import { WalletOutlined, SwapOutlined, DollarOutlined } from "@ant-design/icons";
import styles from "./MobileNav.module.css";

export type ViewType = "balances" | "lend" | "swap";

interface MobileNavProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function MobileNav({ activeView, onViewChange }: MobileNavProps) {
  return (
    <nav className={styles.nav}>
      <button
        className={`${styles.navItem} ${activeView === "balances" ? styles.active : ""}`}
        onClick={() => onViewChange("balances")}
      >
        <WalletOutlined className={styles.icon} />
        <span className={styles.label}>Balances</span>
      </button>
      <button
        className={`${styles.navItem} ${activeView === "lend" ? styles.active : ""}`}
        onClick={() => onViewChange("lend")}
      >
        <DollarOutlined className={styles.icon} />
        <span className={styles.label}>Lend/Borrow</span>
      </button>
      <button
        className={`${styles.navItem} ${activeView === "swap" ? styles.active : ""}`}
        onClick={() => onViewChange("swap")}
      >
        <SwapOutlined className={styles.icon} />
        <span className={styles.label}>Swap</span>
      </button>
    </nav>
  );
}
