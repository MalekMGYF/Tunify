"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/config/app";

export default function Navbar({ appName }: { appName: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-ink-950/85 backdrop-blur-md border-b border-white/5" : "bg-transparent"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Primary">
        <Link href="/#home" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="" className="h-8 w-8" />
          <span className="font-display text-lg font-semibold tracking-tight">{appName}</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm text-mist-300 hover:text-mist-100 transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <a
          href="/api/releases/latest/download"
          className="hidden md:inline-flex items-center rounded-full bg-tunify-gradient px-5 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Download {appName}
        </a>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-mist-100"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="container-page flex flex-col gap-1 pb-6 pt-2">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-mist-300 hover:bg-white/5 hover:text-mist-100 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <a
              href="/api/releases/latest/download"
              className="flex items-center justify-center rounded-full bg-tunify-gradient px-5 py-2.5 text-sm font-semibold text-white"
            >
              Download {appName}
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
