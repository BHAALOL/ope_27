import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already handles redirecting unauthenticated users to /admin/login
  // for all /admin/* routes except /admin/login itself.
  // Here we only check session to decide whether to show the admin sidebar.
  const session = await getServerSession(authOptions);

  if (!session) {
    // User is on /admin/login (the only unprotected admin route)
    // Render without admin chrome
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
