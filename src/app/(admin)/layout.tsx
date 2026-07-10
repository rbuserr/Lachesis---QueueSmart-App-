import AdminNavbar from "@/components/admin/admin-navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AdminNavbar />
      <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
    </div>
  );
}
