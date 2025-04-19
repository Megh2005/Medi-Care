import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import ColorBlindToggle from "@/components/color-blind-toggle";
import { Toaster } from "react-hot-toast";
import SessionWrapper from "@/components/SessionWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Medi Care",
  description: "Your trusted healthcare partner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster />
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50">
            <SessionWrapper />
          </header>
          <main className="flex-grow">{children}</main>
          <Footer />
          <div className="fixed bottom-6 left-6 z-50">
            {/*<DoctorAgent />*/}
          </div>
          <div className="fixed bottom-6 right-6 z-50">
            <ColorBlindToggle />
          </div>
        </div>
      </body>
    </html>
  );
}
