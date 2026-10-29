import type { Metadata } from "next";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Pagamentos", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const enabled = process.env.CHECKOUT_ENABLED === "true";
  const configured = Boolean(process.env.BRAVOPAY_API_KEY && process.env.BRAVOPAY_WEBHOOK_SECRET && process.env.PAYMENT_SERVICE_NAME && process.env.PAYMENT_SERVICE_DESCRIPTION && process.env.PAYMENT_SERVICE_PRICE_CENTS);
  const active = false;

  return (
    <>
      <AdminNavigation />
      <section className="page-wrap py-8 sm:py-12">
        <p className="eyebrow">Área restrita</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Pagamentos</h1>
        <div className="mt-6 max-w-3xl rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-7">
          <p className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${active ? "bg-[#edf7e8] text-[#315d2a]" : "bg-[#fff8e8] text-[#755514]"}`}>Checkout desativado nesta versão</p>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Mesmo que existam variáveis do gateway, este projeto não disponibiliza rota de cobrança e não tem armazenamento financeiro durável. Nenhuma cobrança será criada. Não ative este fluxo sem serviço/preço aprovados, persistência e reconciliação completas.</p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Checkout habilitado por configuração: {enabled ? "sim" : "não"}. Variáveis presentes: {configured ? "sim" : "não"}.</p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Os registros desta versão ficam no navegador e não podem servir como histórico financeiro nem como fonte de confirmação de pagamento.</p>
        </div>
      </section>
    </>
  );
}
