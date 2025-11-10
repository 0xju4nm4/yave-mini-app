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
    </header>
  );
}
