import { TraderNav } from "@/components/trader/trader-nav";
import { getCurrentTraderName } from "@/lib/trader/current-trader";

export default async function TraderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const traderName = (await getCurrentTraderName()) ?? "Trader";

  return (
    <div className="min-h-screen">
      <TraderNav traderName={traderName} />
      <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
    </div>
  );
}
