"use client";

import WalletConnectButton from "@/components/WalletConnectButton";
import { WalletContextProvider } from "@/context/Wallet";
import React, { ReactNode } from "react";

const PrescriptionLayout = ({ children }: { children: ReactNode }) => {
  return (
    <WalletContextProvider>
      <div className="flex justify-end p-4 bg-white">
        <WalletConnectButton />
      </div>
      {children}
    </WalletContextProvider>
  );
};

export default PrescriptionLayout;
