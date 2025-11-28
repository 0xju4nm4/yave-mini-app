"use client";

import {
  GetExecutionStatusResponse,
  OneClickService,
  OpenAPI,
  QuoteRequest,
  QuoteResponse,
  TokenResponse,
} from "@defuse-protocol/one-click-sdk-typescript";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { createGelatoSmartWalletClient, sponsored } from "@gelatonetwork/smartwallet";
import { Interface } from "ethers";
import { useEffect, useState } from "react";
import { Account } from "viem";
import {
  PrepareAuthorizationParameters,
  SignAuthorizationReturnType,
  prepareAuthorization,
} from "viem/actions";
import styles from "./page.module.css";

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

export default function Home() {
  const [tokens, setTokens] = useState<TokenResponse[]>([]);
  const [fromToken, setFromToken] = useState<string>("");
  const [toToken, setToToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const { primaryWallet } = useDynamicContext();

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
  }, []);

  const getQuote = async () => {
    if (!fromToken || !toToken || !amount) {
      alert("Please select from token, to token, and enter an amount");
      return;
    }

    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
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
        refundTo: primaryWallet?.address,
        refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
        recipient: primaryWallet?.address,
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
    if (!quote) {
      alert("Missing required information for transfer");
      return;
    }

    const fromTokenData = tokens.find((t) => t.assetId === fromToken);
    if (!fromTokenData) {
      alert("Token data not found");
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

    setIsTransferring(true);

    try {
      if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
        return;
      }

      // The Gelato client expects an ethers.js Account as first argument, not a Dynamic Wallet.
      // You should get the wallet client/account from primaryWallet, and pass it in directly.
      // Fixed: Dynamic Wallet's `getAccount` does not exist; get the EIP-1193 provider/signer from primaryWallet
      const client = await primaryWallet?.getWalletClient();
      const connector = primaryWallet?.connector;

      client.account.signAuthorization = async (parameters) => {
        const preparedAuthorization = await prepareAuthorization(client, parameters);
        const signedAuthorization = await (
          connector as unknown as {
            signAuthorization: (
              parameters: PrepareAuthorizationParameters<Account>
            ) => Promise<SignAuthorizationReturnType>;
          }
        ).signAuthorization(preparedAuthorization);

        return {
          address: preparedAuthorization.address,
          chainId: preparedAuthorization.chainId,
          nonce: preparedAuthorization.nonce,
          r: signedAuthorization.r,
          s: signedAuthorization.s,
          v: signedAuthorization.v,
          yParity: signedAuthorization.yParity,
        } as SignAuthorizationReturnType;
      };

      const smartWalletClient = await createGelatoSmartWalletClient(client, {
        apiKey: process.env.NEXT_PUBLIC_GELATO_API_KEY!,
        scw: { type: "gelato" }, // use gelato, kernel, safe, or custom
      });

      const Ierc20 = new Interface(ERC20_ABI);
      const transferData = Ierc20.encodeFunctionData("transfer", [
        depositAddress,
        quote.quote.amountIn,
      ]);

      const result = await smartWalletClient?.execute({
        payment: sponsored(),
        calls: [
          {
            to: fromTokenData.contractAddress! as `0x${string}`,
            data: transferData as `0x${string}`,
            value: BigInt(0),
          },
        ],
      });

      const receipt = await result.wait();
      console.log(result, receipt);

      // const tokenContract = new Contract(fromTokenData.contractAddress!, ERC20_ABI, signer);
      // // Get the amount from the quote
      // const transferAmount = quote.quote.amountIn;

      // // Execute transfer
      // const tx = await tokenContract.transfer(depositAddress, transferAmount);
      // console.log("Transaction sent:", tx.hash);

      // // Wait for transaction confirmation
      // const receipt = await tx.wait();
      // console.log("Transaction confirmed:", receipt);

      const submitDeposit = await OneClickService.submitDepositTx({
        txHash: receipt,
        depositAddress: depositAddress,
      });

      fetchStatus(depositAddress);

      console.log("Submit deposit:", submitDeposit);

      alert(`Transfer successful! Transaction hash: ${receipt}`);
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
          disabled={isLoading || !fromToken || !toToken || !amount}
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
