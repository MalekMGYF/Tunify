"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Music, UploadCloud, BarChart3, Settings, LogOut, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/releases", label: "Releases", icon: Music },
  { href: "/admin/releases/new", label: "Upload Release", icon: UploadCloud },
  { href: "/admin", label: "Statistics", icon: BarChart3, hash: "#stats" },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <img src="/logo.png" alt="" className="h-7 w-7" />
        <span className="font-display text-base font-semibold text-mist-100">Tunify Admin</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact) && !item.hash;
          return (
            <Link
              key={item.label}
              href={item.hash ? `${item.href}${item.hash}` : item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active ? "bg-white/10 text-mist-100" : "text-mist-400 hover:bg-white/5 hover:text-mist-100"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/8 px-3 py-4">
        <p className="truncate px-3 pb-3 text-xs text-mist-400">{email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-mist-400 transition-colors hover:bg-white/5 hover:text-mist-100"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-white/8 bg-ink-950 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="h-6 w-6" />
          <span className="font-display text-sm font-semibold text-mist-100">Tunify Admin</span>
        </div>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-mist-100"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 border-r border-white/8 bg-ink-900">{content}</div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-white/8 bg-ink-900 md:block">{content}</aside>
    </>
  );
}
