"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LayoutDashboard, ClipboardList, ListOrdered } from "lucide-react";

import { Button } from "@/components/ui/button";
export default function AdminNavbar() {
  const pathname = usePathname();

  const links = [
    {
      href: "/admin-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/services",
      label: "Services",
      icon: ClipboardList,
    },
    {
      href: "/manage-queue",
      label: "Queue",
      icon: ListOrdered,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">

        <div>

          <h1 className="text-xl font-bold">
            QueueSmart Admin
          </h1>

          <p className="text-xs text-muted-foreground">
            Proprietary Trading Support
          </p>

        </div>

        <div className="flex gap-2">

          {links.map((link) => {

            const Icon = link.icon;

            const active = pathname === link.href;

            return (

              <Link
                key={link.href}
                href={link.href}
              >

                <Button
                  variant={active ? "default" : "ghost"}
                >

                  <Icon className="mr-2 h-4 w-4" />

                  {link.label}

                </Button>

              </Link>

            );

          })}

        </div>

      </div>

    </nav>
  );
}