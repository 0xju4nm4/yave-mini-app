"use client";

import {
  GetExecutionStatusResponse,
  OneClickService,
  OpenAPI,
  QuoteRequest,
  QuoteResponse,
  TokenResponse,
} from "@defuse-protocol/one-click-sdk-typescript";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { BrowserProvider, Contract } from "ethers";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

const apikey =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjIwMjUtMDQtMjMtdjEifQ.eyJ2IjoxLCJrZXlfdHlwZSI6ImRpc3RyaWJ1dGlvbl9jaGFubmVsIiwicGFydG5lcl9pZCI6InRudGxhYnMiLCJpYXQiOjE3NjQxNDk3MzgsImV4cCI6MTc5NTY4NTczOH0.PQypuH-lP3j06uXq8WXwwT0CHw_WPVQFYPOjnmiHBbe4RDM7Uhy4gtve4thvzy6Cbrvg5kuFI84EHtH09UO5cerGouJ5fGAWTfuCmpGGqVHu7i4d026wSvYnjtNAVELEdJ1qECRvpZv51KI4-ss_PNjBhpvpsulkmnnJAV-gZMjnObRFflTGKmedcnpDrSsVkDKbHMmi-G65QhIbTH3i2Dmtej1yD8kpJGEEBKrT6b5LJKoZ8xcq1qSEq2uRv3LPmTLqQ3ND-guwfkUlbwCxsqO_pMmHONUg0q886GkBLmGz1nG5gNFO69C5NF7p7Z7zczK28PFCm6J21CTAyO0Fjg";

OpenAPI.BASE = "https://1click.chaindefuser.com";
OpenAPI.TOKEN = apikey;

// ERC20 ABI - only need transfer function
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

// Network chain IDs mapping
const CHAIN_IDS: Record<
  string,
  { chainId: string; name: string; rpcUrl: string; blockExplorer: string }
> = {
  eth: {
    chainId: "0x1",
    name: "Ethereum Mainnet",
    rpcUrl: "https://eth.llamarpc.com",
    blockExplorer: "https://etherscan.io",
  },
  arb: {
    chainId: "0xa4b1",
    name: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
  },
  base: {
    chainId: "0x2105",
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
  },
  bsc: {
    chainId: "0x38",
    name: "BNB Smart Chain",
    rpcUrl: "https://bsc-dataseed.binance.org",
    blockExplorer: "https://bscscan.com",
  },
  pol: {
    chainId: "0x89",
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
  },
  op: {
    chainId: "0xa",
    name: "Optimism",
    rpcUrl: "https://mainnet.optimism.io",
    blockExplorer: "https://optimistic.etherscan.io",
  },
  avax: {
    chainId: "0xa86a",
    name: "Avalanche",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorer: "https://snowtrace.io",
  },
  gnosis: {
    chainId: "0x64",
    name: "Gnosis",
    rpcUrl: "https://rpc.gnosischain.com",
    blockExplorer: "https://gnosisscan.io",
  },
  xlayer: {
    chainId: "0x9e",
    name: "X Layer",
    rpcUrl: "https://rpc.xlayer.tech",
    blockExplorer: "https://xlayerscan.io",
  },
  monad: {
    chainId: "0x1a0",
    name: "Monad",
    rpcUrl: "https://rpc.monad.xyz",
    blockExplorer: "https://monadscan.com",
  },
  bera: {
    chainId: "0x80094",
    name: "Berachain",
    rpcUrl: "https://bartio.rpc.berachain.com",
    blockExplorer: "https://berascan.com",
  },
};

// Get chain ID for a blockchain name
const getChainId = (blockchain: string): string | null => {
  const chain = CHAIN_IDS[blockchain.toLowerCase()];
  return chain ? chain.chainId : null;
};

// Switch to the correct network
const switchNetwork = async (blockchain: string): Promise<boolean> => {
  if (typeof window === "undefined" || !window.ethereum) {
    return false;
  }

  const chainId = getChainId(blockchain);
  if (!chainId) {
    alert(`Unsupported blockchain: ${blockchain}`);
    return false;
  }

  const chainConfig = CHAIN_IDS[blockchain.toLowerCase()];

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Add the network if it doesn't exist
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId,
              chainName: chainConfig.name,
              rpcUrls: chainConfig.rpcUrl ? [chainConfig.rpcUrl] : [],
              blockExplorerUrls: chainConfig.blockExplorer ? [chainConfig.blockExplorer] : [],
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error("Error adding network:", addError);
        alert(`Failed to add ${chainConfig.name} network. Please add it manually in MetaMask.`);
        return false;
      }
    } else if (switchError.code === 4001) {
      // User rejected the request
      alert("Network switch was rejected. Please switch manually in MetaMask.");
      return false;
    } else {
      console.error("Error switching network:", switchError);
      alert(`Failed to switch to ${chainConfig.name}. Please switch manually in MetaMask.`);
      return false;
    }
  }
};

export default function Home() {
  const [tokens, setTokens] = useState<TokenResponse[]>([]);
  const [fromToken, setFromToken] = useState<string>("");
  const [toToken, setToToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const getTokens = async () => {
    try {
      const tokensData = await OneClickService.getTokens();
      const sortedTokens = (tokensData || []).sort((a, b) => {
        if (a.blockchain < b.blockchain) return -1;
        if (a.blockchain > b.blockchain) return 1;
        return 0;
      });
      setTokens(sortedTokens);

      // Set default tokens if available
      if (tokensData && tokensData.length > 0) {
        setFromToken(tokensData[0].assetId || "");
        if (tokensData.length > 1) {
          setToToken(tokensData[1].assetId || "");
        }
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
    }
  };

  useEffect(() => {
    getTokens();
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0].address);
          setProvider(provider);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setProvider(provider);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setProvider(null);
    setQuote(null);
    setShowConfirmModal(false);
  };

  const getQuote = async () => {
    if (!fromToken || !toToken || !amount) {
      alert("Please select from token, to token, and enter an amount");
      return;
    }

    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      // Find the from token to get decimals
      const fromTokenData = tokens.find((t) => t.assetId === fromToken);
      const decimals = fromTokenData?.decimals || 6;

      // Convert amount to smallest units
      const amountInSmallestUnits = (parseFloat(amount) * Math.pow(10, decimals)).toString();

      // Calculate deadline (1 hour from now)
      const deadline = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      const quoteRequest: QuoteRequest = {
        dry: false, // Set to false to get depositAddress
        swapType: QuoteRequest.swapType.EXACT_INPUT,
        slippageTolerance: 10, // 0.1%
        originAsset: fromToken,
        depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
        destinationAsset: toToken,
        amount: amountInSmallestUnits,
        refundTo: walletAddress,
        refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
        recipient: walletAddress,
        recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
        deadline: deadline,
      };

      // Get quote
      const quoteResponse = await OneClickService.getQuote(quoteRequest);
      console.log("Quote:", quoteResponse);
      setQuote(quoteResponse);
      setShowConfirmModal(true);
    } catch (error) {
      console.error("Error getting quote:", error);
      alert("Error getting quote. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatus = async (depositAddress: string) => {
    let finished = false;

    while (!finished) {
      const status = await OneClickService.getExecutionStatus(depositAddress);
      console.log("Status:", status);

      if (status.status === GetExecutionStatusResponse.status.SUCCESS) {
        finished = true;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  };

  const executeTransfer = async () => {
    if (!quote || !provider || !walletAddress) {
      alert("Missing required information for transfer");
      return;
    }

    const fromTokenData = tokens.find((t) => t.assetId === fromToken);
    if (!fromTokenData) {
      alert("Token data not found");
      return;
    }

    // Check if token is on an EVM chain (ERC20)
    const evmChains = [
      "eth",
      "arb",
      "base",
      "bsc",
      "pol",
      "op",
      "avax",
      "gnosis",
      "xlayer",
      "monad",
      "bera",
    ];
    if (!evmChains.includes(fromTokenData.blockchain.toLowerCase())) {
      alert("Only ERC20 tokens on EVM chains are supported for direct transfer");
      return;
    }

    // Extract contract address from assetId (format: nep141:chain-address.omft.near)
    const assetIdParts = fromToken.split(":");
    if (assetIdParts.length < 2) {
      alert("Invalid token asset ID format");
      return;
    }

    const chainAndAddress = assetIdParts[1].split(".")[0];
    const addressParts = chainAndAddress.split("-");
    if (addressParts.length < 2) {
      alert("Invalid token address format");
      return;
    }

    const depositAddress = quote.quote.depositAddress;

    if (!depositAddress) {
      alert("Deposit address not found in quote");
      return;
    }

    // Check and switch to the correct network
    const currentNetwork = await provider.getNetwork();
    const requiredChainId = getChainId(fromTokenData.blockchain);

    if (!requiredChainId) {
      alert(`Unsupported blockchain: ${fromTokenData.blockchain}`);
      setIsTransferring(false);
      return;
    }

    // Convert chainId to number for comparison
    const currentChainIdHex = `0x${currentNetwork.chainId.toString(16)}`;
    const requiredChainIdLower = requiredChainId.toLowerCase();
    const currentChainIdLower = currentChainIdHex.toLowerCase();

    if (currentChainIdLower !== requiredChainIdLower) {
      const chainConfig = CHAIN_IDS[fromTokenData.blockchain.toLowerCase()];
      const switchConfirmed = confirm(
        `You need to switch to ${chainConfig.name} to complete this transaction. Switch now?`
      );

      if (!switchConfirmed) {
        setIsTransferring(false);
        return;
      }

      const switched = await switchNetwork(fromTokenData.blockchain);
      if (!switched) {
        setIsTransferring(false);
        return;
      }

      // Wait a bit for the network to switch and MetaMask to update
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setIsTransferring(true);
    try {
      // Always get a fresh provider to ensure we're using the current network
      if (!window.ethereum) {
        alert("MetaMask not found. Please refresh the page.");
        setIsTransferring(false);
        return;
      }

      const currentProvider = new BrowserProvider(window.ethereum);
      const signer = await currentProvider.getSigner();

      // Verify we're on the correct network
      const network = await currentProvider.getNetwork();
      const currentChainIdHex = `0x${network.chainId.toString(16)}`;
      const requiredChainIdLower = getChainId(fromTokenData.blockchain)?.toLowerCase();

      if (currentChainIdHex.toLowerCase() !== requiredChainIdLower) {
        alert(
          `Please switch to ${CHAIN_IDS[fromTokenData.blockchain.toLowerCase()]?.name} in MetaMask and try again.`
        );
        setIsTransferring(false);
        return;
      }

      const tokenContract = new Contract(fromTokenData.contractAddress!, ERC20_ABI, signer);
      // Get the amount from the quote
      const transferAmount = quote.quote.amountIn;

      // Execute transfer
      const tx = await tokenContract.transfer(depositAddress, transferAmount);
      console.log("Transaction sent:", tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      const submitDeposit = await OneClickService.submitDepositTx({
        txHash: tx.hash,
        depositAddress: depositAddress,
      });

      fetchStatus(depositAddress);

      console.log("Submit deposit:", submitDeposit);

      alert(`Transfer successful! Transaction hash: ${tx.hash}`);
      setShowConfirmModal(false);
      setQuote(null);
    } catch (error: any) {
      console.error("Error executing transfer:", error);
      if (error.code === 4001) {
        alert("Transaction was rejected by user");
      } else {
        alert(`Error executing transfer: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsTransferring(false);
    }
  };

  const getTokenDisplayName = (token: TokenResponse) => {
    const symbol =
      token.symbol || token.assetId?.split(":")[1]?.split(".")[0] || token.assetId || "Unknown";
    return token.blockchain ? `${symbol} [${token.blockchain}]` : symbol;
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={styles.app}>
      <div className={styles.swapContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Swap Tokens</h1>
          <DynamicWidget />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>From</label>
          <div className={styles.inputRow}>
            <input
              type="number"
              className={styles.input}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select
              className={styles.assetSelect}
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
            >
              <option value="">Select token</option>
              {tokens.map((token) => (
                <option key={token.assetId} value={token.assetId}>
                  {getTokenDisplayName(token)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.swapButton}>
          <button
            className={styles.swapIconButton}
            onClick={() => {
              const temp = fromToken;
              setFromToken(toToken);
              setToToken(temp);
            }}
            type="button"
          >
            ⇅
          </button>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>To</label>
          <div className={styles.inputRow}>
            <input type="text" className={styles.input} placeholder="0.00" readOnly />
            <select
              className={styles.assetSelect}
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
            >
              <option value="">Select token</option>
              {tokens.map((token) => (
                <option key={token.assetId} value={token.assetId}>
                  {getTokenDisplayName(token)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className={styles.quoteButton}
          onClick={getQuote}
          disabled={isLoading || !fromToken || !toToken || !amount || !walletAddress}
        >
          {isLoading ? "Getting Quote..." : "Get Quote"}
        </button>
      </div>

      {showConfirmModal && quote && (
        <div className={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Confirm Transfer</h2>
              <button className={styles.closeButton} onClick={() => setShowConfirmModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.quoteInfo}>
                <div className={styles.quoteRow}>
                  <span className={styles.quoteLabel}>From:</span>
                  <span className={styles.quoteValue}>
                    {quote.quote.amountInFormatted}{" "}
                    {getTokenDisplayName(tokens.find((t) => t.assetId === fromToken)!)}
                  </span>
                </div>
                <div className={styles.quoteRow}>
                  <span className={styles.quoteLabel}>To:</span>
                  <span className={styles.quoteValue}>
                    {quote.quote.amountOutFormatted}{" "}
                    {getTokenDisplayName(tokens.find((t) => t.assetId === toToken)!)}
                  </span>
                </div>
                <div className={styles.quoteRow}>
                  <span className={styles.quoteLabel}>Deposit Address:</span>
                  <span className={styles.quoteValue}>
                    {formatAddress(quote.quote.depositAddress || "")}
                  </span>
                </div>
                <div className={styles.quoteRow}>
                  <span className={styles.quoteLabel}>Estimated Time:</span>
                  <span className={styles.quoteValue}>{quote.quote.timeEstimate}s</span>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isTransferring}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmButton}
                  onClick={executeTransfer}
                  disabled={isTransferring}
                >
                  {isTransferring ? "Transferring..." : "Confirm & Transfer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
