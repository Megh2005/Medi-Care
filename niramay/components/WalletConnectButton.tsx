/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useContext } from "react";
import { WalletContext } from "@/context/Wallet";
import { connectWallet } from "@/utils/connectWallet";

declare global {
  interface Window {
    ethereum: any;
  }
}

const WalletConnectButton = () => {
  const {
    setIsConnected,
    setUserAddress,
    setSigner,
    isConnected,
    userAddress,
  } = useContext(WalletContext);

  return (
    <div className="flex flex-col gap-6">
      <button
        disabled={isConnected}
        onClick={async () => {
          await connectWallet(setIsConnected, setUserAddress, setSigner);
        }}
        className="bg-black text-base text-white px-4 py-2 font-bold hover:bg-black/85"
      >
        {userAddress
          ? `${userAddress.slice(0, 5)}...${userAddress.slice(-6)}`
          : "Connect Wallet"}
      </button>
    </div>
  );
};

export default WalletConnectButton;
