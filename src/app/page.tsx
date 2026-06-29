import Link from "next/link";

const routes = [
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
  { href: "/dashboard", label: "Trader Dashboard" },
  { href: "/queue/join", label: "Join Queue" },
  { href: "/queue/status", label: "Queue Status" },
  { href: "/history", label: "History" },
  { href: "/admin-dashboard", label: "Admin Dashboard" },
  { href: "/manage-queue", label: "Manage Queue" },
  { href: "/services", label: "Services" },
];

export default function Home() {
  return (
    <div className="grid min-h-screen grid-rows-[1fr_auto] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
      <main className="row-start-1 flex w-full max-w-2xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">QueueSmart</h1>
          <p className="text-lg text-muted-foreground">
            Route scaffolding is in place — build out pages from here.
          </p>
        </div>

        <section className="flex flex-col gap-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Scaffolded routes
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {routes.map((route) => (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className="text-sm text-foreground underline-offset-4 transition-colors hover:text-brand hover:underline"
                >
                  {route.label}
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {route.href}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="row-start-2 text-sm text-muted-foreground">
        Lachesis · Software Design
      </footer>
    </div>
  );
}
