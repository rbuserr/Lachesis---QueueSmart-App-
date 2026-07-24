import { TraderNav } from "@/components/trader/trader-nav";
import { CURRENT_TRADER_NAME } from "@/lib/trader/current-trader";

export default function TraderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <TraderNav traderName={CURRENT_TRADER_NAME} />
      <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
    </div>
  );
}
