/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserProvider } from "ethers";
import toast from "react-hot-toast";

declare global {
  interface Window {
    ethereum: any;
  }
}

const AVA_TESTNET_PARAMS = {
  chainId: "0xa869",
  chainName: "Avalanche Fuji Testnet",
  nativeCurrency: {
    name: "Avalanche Fuji",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: ["https://api.zan.top/avax-fuji/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io"],
};

export const connectWallet = async (
  setIsConnected: any,
  setUserAddress: any,
  setSigner: any
) => {
  if (!window.ethereum) {
    toast.error("Wallet Not Found");
    return;
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    setSigner(signer);

    const accounts = await provider.send("eth_requestAccounts", []);
    setUserAddress(accounts[0]);
    setIsConnected(true);

    const { chainId } = await provider.getNetwork();
    const fujiTestnetId = "43113";

    if (parseInt(chainId.toString(), 16) !== parseInt(fujiTestnetId)) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: AVA_TESTNET_PARAMS.chainId }],
        });
        toast.success("Switched To Avalanche Fuji Testnet");
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [AVA_TESTNET_PARAMS],
            });
            toast.success("Avalanche Fuji Testnet Added and Switched");
          } catch (addError) {
            toast.error("Failed to Add Avalanche Fuji Testnet");
            console.error("Error adding network:", addError);
          }
        } else {
          toast.error("Failed to Switch Network");
          console.error("Network switch error:", switchError);
        }
      }
    } else {
      toast.success("Wallet Connected");
    }
  } catch (error) {
    toast.error("Error In Connecting Wallet");
    console.error("Connection error:", error);
  }
};
