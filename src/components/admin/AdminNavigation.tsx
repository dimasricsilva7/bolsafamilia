import Link from "next/link";
import { logoutAdminAction } from "@/app/admin/login/actions";

const links = [
  ["/admin", "Registros locais"],
  ["/admin/pagamentos", "Pagamentos"],
  ["/admin/configuracoes", "Configurações"],
] as const;

export function AdminNavigation() {
  return (
    <nav aria-label="Navegação administrativa" className="page-wrap border-b border-[var(--line)] py-4">
      <div className="flex flex-wrap items-center gap-2">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--forest)] hover:text-[var(--forest)]">{label}</Link>
        ))}
        <form action={logoutAdminAction} className="ml-auto">
          <button type="submit" className="rounded-full px-4 py-2 text-xs font-bold text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]">Sair</button>
        </form>
      </div>
    </nav>
  );
}
