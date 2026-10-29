import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import CashierShell from "./CashierShell";

export default async function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <CashierShell
      user={{
        username: session.username,
        displayName: session.displayName,
        role: session.role,
      }}
    >
      {children}
    </CashierShell>
  );
}
