// Network RPC Configuration
export const SCROLL_SEPOLIA_RPC = "https://sepolia-rpc.scroll.io/";

export const supportedNetworks = [
  {
    blockExplorerUrls: ["https://arbiscan.io"],
    chainId: 42161,
    chainName: "Arbitrum One",
    iconUrls: ["https://cryptologos.cc/logos/arbitrum-arb-logo.png"],
    name: "Arbitrum",
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
      iconUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    },
    networkId: 42161,
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    vanityName: "Arbitrum One",
  },
];
