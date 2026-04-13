"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, FolderOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",    label: "Dashboard",     icon: LayoutDashboard },
  { href: "/projects/new", label: "New Brand Kit",  icon: Plus },
  { href: "/projects",     label: "All Projects",   icon: FolderOpen },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-14 lg:w-60 border-r border-border/50 bg-background flex flex-col py-5 shrink-0">

      {/* Logo */}
      <div className="px-3 lg:px-4 mb-7">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 btn-gradient rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="hidden lg:inline font-bold text-sm tracking-tight">
            AI Brand Architect
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2 flex-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "nav-active text-violet-300"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  active ? "text-violet-400" : "text-current"
                )}
              />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom badge */}
      <div className="hidden lg:block px-3 mt-4">
        <div className="glass-card rounded-xl px-3 py-2.5">
          <p className="text-xs text-muted-foreground/70 leading-snug">
            6 AI agents · 18 deliverables
          </p>
          <p className="text-xs font-semibold gradient-text-purple mt-0.5">
            Full brand in &lt; 4 min
          </p>
        </div>
      </div>
    </aside>
  );
}
