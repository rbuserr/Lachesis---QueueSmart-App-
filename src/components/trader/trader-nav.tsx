"use client";

import { PortalNav } from "@/components/shared/portal-nav";

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
  return (
    <PortalNav
      title="Lachesis"
      subtitle="Proprietary Trading Support"
      userPrimary={traderName}
      userSecondary="Trader account"
      links={navItems}
    />
  );
}
