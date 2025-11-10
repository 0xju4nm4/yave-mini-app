"use client";

import Header from "@/components/Header/Header";
import LendBorrow from "@/components/LendBorrow/LendBorrow";
import MobileNav, { ViewType } from "@/components/MobileNav/MobileNav";
import Swap from "@/components/Swap/Swap";
import UserBalances from "@/components/UserBalances/UserBalances";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>("balances");
  // const [wallet, setWallet] = useState<string | undefined>(undefined);

  // const handleAuthentication = async () => {
  //   try {
  //     const authentication = await authenticate();
  //     console.log(authentication);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  useEffect(() => {
    //handleAuthentication();
  }, []);

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
      <Header />
      {renderView()}
      <MobileNav activeView={activeView} onViewChange={setActiveView} />
    </div>
  );
}
