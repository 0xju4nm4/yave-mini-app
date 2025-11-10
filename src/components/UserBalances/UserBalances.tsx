"use client";

import { useState } from "react";
import Header from "../Header/Header";
import styles from "./UserBalances.module.css";

export default function UserBalances() {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

  return (
    <div className={`${styles.container} ${isHeaderExpanded ? styles.expanded : ""}`}>
      <Header isExpanded={isHeaderExpanded} onExpand={() => setIsHeaderExpanded(!isHeaderExpanded)} />
      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Assets</h2>
          <div className={styles.assetList}>
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No assets yet</p>
              <p className={styles.emptySubtext}>Start by lending or swapping tokens</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <div className={styles.activityList}>
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
