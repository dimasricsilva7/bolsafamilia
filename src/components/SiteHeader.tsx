import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--paper)]/95">
      <div className="page-wrap flex min-h-[76px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 no-underline" aria-label="Bolsa Família: informação clara — início">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--forest)] text-white shadow-sm">
            <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6" fill="none">
              <path d="M6 22C6 12.5 13.2 6 26 6c0 12.7-6.4 20-16 20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 24c4-5.7 8.7-9.4 14.2-12" stroke="#C3DF74" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold tracking-tight">Bolsa Família</span>
            <span className="block text-xs font-medium text-[var(--muted)]">informação clara</span>
          </span>
        </Link>
        <nav aria-label="Navegação principal" className="hidden items-center gap-7 text-sm font-semibold text-[var(--muted)] sm:flex">
          <Link href="/quiz" className="transition hover:text-[var(--forest)]">Fazer o quiz</Link>
          <a href="https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia" target="_blank" rel="noreferrer" className="transition hover:text-[var(--forest)]">Fonte oficial ↗</a>
        </nav>
        <Link href="/quiz" className="rounded-full bg-[var(--forest)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--forest-dark)] focus-visible:outline">
          Começar
        </Link>
      </div>
      <div className="border-t border-[var(--line)] bg-[#eef5e9] py-2 text-center text-[11px] font-bold tracking-wide text-[var(--forest-dark)] sm:hidden">
        SITE INDEPENDENTE · NÃO REPRESENTA O GOVERNO FEDERAL
      </div>
    </header>
  );
}
