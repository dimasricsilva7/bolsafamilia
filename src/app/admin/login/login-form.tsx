"use client";

import { useActionState } from "react";
import { loginAdmin } from "./actions";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, {});

  return (
    <form action={action} className="mt-7 space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-bold">E-mail administrativo</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 text-sm" />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-bold">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 text-sm" />
      </div>
      {state.error && <p role="alert" className="rounded-xl bg-[#fff4e9] px-4 py-3 text-sm font-semibold text-[#8b4a1b]">{state.error}</p>}
      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-full bg-[var(--forest)] px-6 text-sm font-extrabold text-white transition hover:bg-[var(--forest-dark)] disabled:opacity-60">
        {pending ? "Verificando…" : "Entrar no painel"}
      </button>
      <p className="text-xs leading-5 text-[var(--muted)]">Não existe cadastro público. O login é verificado no servidor e a senha não é armazenada no navegador.</p>
    </form>
  );
}
