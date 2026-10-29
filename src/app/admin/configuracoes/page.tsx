import type { Metadata } from "next";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Configurações administrativas", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const passwordConfigured = Boolean(process.env.ADMIN_PASSWORD);
  const sessionConfigured = Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
  const email = process.env.ADMIN_EMAIL ?? "dimasricsilva@gmail.com";

  return (
    <>
      <AdminNavigation />
      <section className="page-wrap py-8 sm:py-12">
        <p className="eyebrow">Área restrita</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Configurações</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">O login usa segredos privados do servidor. Os valores nunca são exibidos nesta tela.</p>
        <div className="mt-6 max-w-3xl divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-white px-5">
          <div className="flex flex-wrap justify-between gap-2 py-4"><span className="text-sm font-bold">E-mail administrativo permitido</span><span className="text-sm text-[var(--muted)]">{email}</span></div>
          <div className="flex flex-wrap justify-between gap-2 py-4"><span className="text-sm font-bold">ADMIN_PASSWORD</span><span className="text-sm">{passwordConfigured ? "Configurada" : "Pendente"}</span></div>
          <div className="flex flex-wrap justify-between gap-2 py-4"><span className="text-sm font-bold">ADMIN_SESSION_SECRET (mínimo 32 caracteres)</span><span className="text-sm">{sessionConfigured ? "Configurada" : "Pendente"}</span></div>
        </div>
        <div className="mt-6 max-w-3xl rounded-2xl border border-[#ead7a8] bg-[#fff8e8] p-5 text-sm leading-6 text-[#755514]">
          <h2 className="font-extrabold">Dados locais e exportação</h2>
          <p className="mt-2">A lista fica no `localStorage` deste navegador. Ela não sincroniza nem recebe respostas do quiz de visitantes. Exporte CSV ou JSON regularmente e guarde o arquivo em local seguro; limpar dados do navegador pode apagar a lista.</p>
          <p className="mt-2">Para alterar a senha, atualize `ADMIN_PASSWORD` no ambiente privado de desenvolvimento ou hospedagem e faça uma nova implantação. Nunca envie a senha pelo chat ou coloque-a no `.env.example`.</p>
        </div>
      </section>
    </>
  );
}
