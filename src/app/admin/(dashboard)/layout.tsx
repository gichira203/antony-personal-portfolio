import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminShell from "./AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell
      user={{
        username: session.username,
        displayName: session.displayName,
        role: session.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
