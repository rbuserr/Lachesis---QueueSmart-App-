"use client";

import { PortalNav } from "@/components/shared/portal-nav";

const links = [
  { href: "/admin-dashboard", label: "Dashboard" },
  { href: "/services", label: "Services" },
  { href: "/manage-queue", label: "Queue" },
];

export default function AdminNavbar() {
  return (
    <PortalNav
      title="Lachesis"
      subtitle="Proprietary Trading Support"
      userPrimary="Administrator"
      userSecondary="Staff portal"
      links={links}
    />
  );
}
