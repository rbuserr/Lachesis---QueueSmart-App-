"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/queue/join", label: "Join Queue" },
  { href: "/queue/status", label: "Queue Status" },
  { href: "/history", label: "History" },
];

interface TraderNavProps {
  traderName: string;
}

export function TraderNav({ traderName }: TraderNavProps) {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 md:px-8">
        <span className="text-lg font-semibold tracking-tight">QueueSmart</span>
        <span className="text-sm text-muted-foreground">
          Trader · {traderName}
        </span>
      </div>
      <nav className="mx-auto flex max-w-5xl gap-6 overflow-x-auto px-6 md:px-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "border-b-2 pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-brand text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
