/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserProvider } from "ethers";
import toast from "react-hot-toast";

declare global {
  interface Window {
    ethereum: any;
  }
}

const EDU_TESTNET_PARAMS = {
  chainId: "0xa045c", // Hexadecimal of 656476 (verified from ChainList)
  chainName: "Edu Chain Testnet",
  nativeCurrency: {
    name: "EduCoin",
    symbol: "EDU",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.open-campus-codex.gelato.digital"], // Verified RPC URL
  blockExplorerUrls: ["https://edu-chain-testnet.blockscout.com"], // Verified Explorer URL
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
    const eduTestnetId = "656476";

    if (parseInt(chainId.toString(), 16) !== parseInt(eduTestnetId)) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: EDU_TESTNET_PARAMS.chainId }],
        });
        toast.success("Switched To Edu Chain Testnet");
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [EDU_TESTNET_PARAMS],
            });
            toast.success("Edu Chain Testnet Added and Switched");
          } catch (addError) {
            toast.error("Failed to Add Edu Chain Testnet");
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
