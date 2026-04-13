"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, LogOut, ChevronDown } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleBillingPortal = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const { url } = await res.json();
      window.location.href = url;
    } finally {
      setLoadingPortal(false);
    }
  };

  const initial = user.email?.[0]?.toUpperCase() ?? "U";
  const displayEmail = user.email ?? "";

  return (
    <header className="border-b border-border/50 px-5 py-3 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-40">

      {/* Left — breadcrumb / title placeholder */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground/50 hidden sm:inline">
          AI Brand Architect
        </span>
      </div>

      {/* Right — user menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-white/5 transition-colors"
        >
          {/* Avatar */}
          <div className="w-7 h-7 btn-gradient rounded-lg flex items-center justify-center text-xs font-bold text-white">
            {initial}
          </div>
          <span className="hidden sm:inline text-sm text-muted-foreground max-w-[180px] truncate">
            {displayEmail}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-xl shadow-black/40 py-1.5 z-50 border border-white/8">

            {/* User info */}
            <div className="px-4 py-2.5 border-b border-white/8">
              <p className="text-xs font-semibold text-foreground truncate">{displayEmail}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Free Trial</p>
            </div>

            <div className="py-1">
              <button
                onClick={handleBillingPortal}
                disabled={loadingPortal}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                {loadingPortal ? "Opening…" : "Manage Billing"}
              </button>
            </div>

            <div className="border-t border-white/8 pt-1">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
