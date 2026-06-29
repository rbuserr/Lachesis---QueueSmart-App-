import { TraderNav } from "@/components/trader/trader-nav";
import { MOCK_TRADER_NAME } from "@/lib/mock-data";

export default function TraderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <TraderNav traderName={MOCK_TRADER_NAME} />
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-8">{children}</div>
    </div>
  );
}
