"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./TokenIcon.module.css";

interface TokenIconProps {
  symbol: string;
  address?: string;
  imageUrl?: string;
  size?: number;
  className?: string;
}

export default function TokenIcon({
  symbol,
  address,
  imageUrl,
  size = 40,
  className = "",
}: TokenIconProps) {
  const [imgError, setImgError] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

  const symbolLower = symbol.toLowerCase();

  // Multiple fallback URLs for token icons
  const getTokenIconUrls = (): string[] => {
    const urls: string[] = [];

    // 1. Use imageUrl from Aave data if available (most reliable)
    if (imageUrl) {
      urls.push(imageUrl);
    }

    // 2. Try Trust Wallet assets (most reliable for Ethereum-based tokens)
    if (address) {
      // For Base chain, try Ethereum address format
      const addressLower = address.toLowerCase();
      urls.push(
        `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${addressLower}/logo.png`
      );
      urls.push(
        `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/${addressLower}/logo.png`
      );
    }

    // 3. Try CoinGecko (for major tokens)
    const coinGeckoIds: Record<string, string> = {
      usdc: "6319",
      usdt: "825",
      dai: "4943",
      weth: "2396",
      wbtc: "3717",
      eth: "279",
      btc: "1",
      aave: "7278",
      link: "1975",
      uni: "1256",
      matic: "3890",
      avax: "5805",
      usd: "6319",
    };

    if (coinGeckoIds[symbolLower]) {
      urls.push(
        `https://assets.coingecko.com/coins/images/${coinGeckoIds[symbolLower]}/small/${symbolLower}.png`
      );
    }

    // 4. Try a generic token icon service
    urls.push(`https://cryptologos.cc/logos/${symbolLower}-${symbolLower}-logo.png?v=029`);

    // 5. Try token.xyz (another popular service)
    if (address) {
      urls.push(`https://token-icons.s3.amazonaws.com/${address.toLowerCase()}.png`);
    }

    return urls;
  };

  const urls = getTokenIconUrls();
  const currentUrl = urls[currentUrlIndex] || urls[0];

  // Fallback: show first letter of symbol
  const getFallbackIcon = () => {
    return (
      <div
        className={`${styles.fallbackIcon} ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {symbol.charAt(0).toUpperCase()}
      </div>
    );
  };

  const handleImageError = () => {
    if (currentUrlIndex < urls.length - 1) {
      // Try next URL
      setCurrentUrlIndex(currentUrlIndex + 1);
    } else {
      // All URLs failed, show fallback
      setImgError(true);
    }
  };

  if (imgError || urls.length === 0) {
    return getFallbackIcon();
  }

  return (
    <div
      className={`${styles.tokenIcon} ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={currentUrl}
        alt={symbol}
        width={size}
        height={size}
        className={styles.iconImage}
        onError={handleImageError}
        unoptimized
      />
    </div>
  );
}
