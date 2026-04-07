"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, CreditCard, ChevronDown } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

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

  return (
    <header className="border-b px-6 py-3 flex items-center justify-between bg-background">
      <div className="flex items-center gap-2 font-semibold">
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="hidden sm:inline">AI Brand Architect</span>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm hover:bg-muted rounded-lg px-2 py-1.5 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center">
            {initial}
          </div>
          <span className="hidden sm:inline max-w-[160px] truncate text-muted-foreground">
            {user.email}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>

        {open && (
          <div className="absolute right-0 mt-1 w-52 bg-background border rounded-xl shadow-lg py-1 z-50">
            <button
              onClick={handleBillingPortal}
              disabled={loadingPortal}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              {loadingPortal ? "Opening..." : "Manage Billing"}
            </button>
            <div className="border-t my-1" />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
