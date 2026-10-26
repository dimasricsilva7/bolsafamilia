import Link from "next/link";
import { ConsentPreferencesButton } from "@/components/ConsentPreferencesButton";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-[#eef2ec]">
      <div className="page-wrap grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-sm font-extrabold">Bolsa Família: informação clara</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Serviço independente e informativo. Não somos um canal do Governo Federal e não fazemos cadastro, consulta individual ou análise de benefício.
          </p>
          <p className="mt-3 text-xs text-[var(--muted)]">© {new Date().getFullYear()} · Conteúdo para orientação geral.</p>
        </div>
        <nav aria-label="Links do rodapé" className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-[var(--forest-dark)]">
          <Link href="/privacidade" className="underline-offset-4 hover:underline">Privacidade</Link>
          <Link href="/termos" className="underline-offset-4 hover:underline">Termos de uso</Link>
          <ConsentPreferencesButton className="text-left underline-offset-4 hover:underline" />
        </nav>
      </div>
    </footer>
  );
}
