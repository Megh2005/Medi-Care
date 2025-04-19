"use client";

import { WalletContextProvider } from "@/context/Wallet";
import Navbar from "./navbar";
import { SessionProvider } from "next-auth/react";

const SessionWrapper = () => {
  return (
    <SessionProvider>
      <WalletContextProvider>
        <Navbar />
      </WalletContextProvider>
    </SessionProvider>
  );
};

export default SessionWrapper;
