import type { Metadata } from "next";
import { RecordsDashboard } from "@/components/admin/RecordsDashboard";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Painel administrativo", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  return <RecordsDashboard />;
}
