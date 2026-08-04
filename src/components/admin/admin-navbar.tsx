"use client";

import { useEffect, useState } from "react";

import { PortalNav } from "@/components/shared/portal-nav";
import { readSessionUserClient } from "@/lib/auth/session";

const links = [
  { href: "/admin-dashboard", label: "Dashboard" },
  { href: "/services", label: "Services" },
  { href: "/manage-queue", label: "Queue" },
];

export default function AdminNavbar() {
  const [adminName, setAdminName] = useState("Administrator");

  useEffect(() => {
    const user = readSessionUserClient();
    if (user?.name) {
      setAdminName(user.name);
    }
  }, []);

  return (
    <PortalNav
      title="Lachesis"
      subtitle="Proprietary Trading Support"
      userPrimary={adminName}
      userSecondary="Staff portal"
      links={links}
    />
  );
}
