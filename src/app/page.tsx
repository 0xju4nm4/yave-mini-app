"use client";

import LendBorrow from "@/components/LendBorrow/LendBorrow";
import MobileNav, { ViewType } from "@/components/MobileNav/MobileNav";
import Swap from "@/components/Swap/Swap";
import UserBalances from "@/components/UserBalances/UserBalances";
import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>("balances");

  const renderView = () => {
    switch (activeView) {
      case "balances":
        return <UserBalances />;
      case "lend":
        return <LendBorrow />;
      case "swap":
        return <Swap />;
      default:
        return <UserBalances />;
    }
  };

  return (
    <div className={styles.app}>
      {renderView()}
      <MobileNav activeView={activeView} onViewChange={setActiveView} />
    </div>
  );
}
