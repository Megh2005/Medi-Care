"use client";

import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import WalletConnectButton from "./WalletConnectButton";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-white border-b-4 border-black p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-black text-2xl flex items-center gap-2">
          <span className="text-primary">MEDI</span>CARE
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLinks />
          <div className="flex space-x-2 ml-4">
            {session?.user ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 font-bold bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                Log Out
              </button>
            ) : (
              <Link
                href="/register"
                className="px-4 py-2 font-bold bg-primary text-white border-2 border-black hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 border-2 border-black"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white border-t-2 border-black"
        >
          <div className="flex flex-col space-y-4 p-4">
            <NavLinks mobile />
            <div className="flex flex-col space-y-2 pt-4 border-t-2 border-black">
              {session?.user ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 font-bold bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              ) : (
                <Link
                  href="/register"
                  className="px-4 py-2 font-bold bg-primary text-white border-2 border-black hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const links = [
    { href: "/", label: "Home" },
    { href: "/doctor-search", label: "Find Doctor" },
    // { href: "/diet-coach", label: "Diet Coach" },
    { href: "/prescription", label: "Scan Prescription" },
    { href: "/doctors", label: "Doctors" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <>
      {links.map((link) => (
        <>
          <Link
            key={link.href}
            href={link.href}
            className={`font-bold hover:text-primary transition-colors ${
              mobile
                ? "py-2 border-b border-gray-200 last:border-0 block w-full"
                : ""
            }`}
          >
            {link.label}
          </Link>
        </>
      ))}
      <WalletConnectButton />
    </>
  );
}
