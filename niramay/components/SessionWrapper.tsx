"use client";

import Navbar from "./navbar";
import { SessionProvider } from "next-auth/react";

const SessionWrapper = () => {
  return (
    <SessionProvider>
      <Navbar />
    </SessionProvider>
  );
};

export default SessionWrapper;
