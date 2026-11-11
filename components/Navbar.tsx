"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, HeartHandshake } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "The 3 Trees", href: "/trees" },
    { name: "Production", href: "/production" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* OFFICIAL BRAND LOGO & TITLE */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-purple-50 border border-purple-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition duration-300">
              <Image 
                src="/logo.png" 
                alt="Christ The Entirety Foundation Logo" 
                fill 
                className="object-contain p-1"
                priority 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight leading-tight group-hover:text-cefPurple transition">
                Christ The Entirety Foundation
              </span>
              <span className="text-[10px] sm:text-xs text-cefBlue font-bold tracking-wider uppercase">
                Jesus is Lord
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center space-x-1 font-semibold text-sm text-gray-600">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl transition duration-200 relative ${
                    isActive
                      ? "text-cefPurple bg-purple-50/80 shadow-xs"
                      : "hover:text-cefPurple hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* DESKTOP DONATE BUTTON */}
          <div className="hidden lg:block">
            <Link 
              href="/give-partner" 
              className="bg-gradient-to-r from-cefPurple to-purple-800 hover:from-purple-800 hover:to-cefPurple text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-cefBlue" /> Give & Partner
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 rounded-xl text-gray-700 hover:text-cefPurple hover:bg-purple-50 transition focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-lg border-b border-gray-200 px-4 pt-3 pb-6 space-y-2 shadow-xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name}
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? "bg-purple-50 text-cefPurple font-bold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-cefPurple"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-gray-100">
            <Link 
              href="/give-partner" 
              onClick={() => setIsOpen(false)}
              className="w-full bg-gradient-to-r from-cefPurple to-purple-800 text-white font-bold text-sm px-5 py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-cefBlue" /> Give & Partner
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}