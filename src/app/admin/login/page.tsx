import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Acesso administrativo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const configured = Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);

  return (
    <section className="page-wrap flex min-h-[72vh] items-center justify-center py-12">
      <div className="soft-shadow w-full max-w-lg rounded-[28px] border border-[var(--line)] bg-white p-6 sm:p-9">
        <Link href="/" className="text-sm font-bold text-[var(--forest)] hover:underline">← Voltar ao site</Link>
        <p className="eyebrow mt-8">Área restrita</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Painel administrativo</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Acesso privado configurado pelo responsável. Não há criação pública de contas.</p>
        {!configured && (
          <p role="status" className="mt-5 rounded-2xl border border-[#ead7a8] bg-[#fff8e8] px-4 py-3 text-sm leading-6 text-[#755514]">
            O acesso ainda não foi configurado. Defina `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` como variáveis privadas no ambiente de desenvolvimento e na Vercel. Use um segredo de sessão com pelo menos 32 caracteres.
          </p>
        )}
        <AdminLoginForm />
      </div>
    </section>
  );
}
