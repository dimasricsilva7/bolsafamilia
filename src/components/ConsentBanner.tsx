"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getConsentChoice, setConsentChoice, type ConsentChoice } from "@/lib/meta-tracking";

function subscribeConsent(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("bf:consent-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("bf:consent-change", callback);
    window.removeEventListener("storage", callback);
  };
}

export function ConsentBanner() {
  const choice = useSyncExternalStore<ConsentChoice>(subscribeConsent, getConsentChoice, () => null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener("bf:open-consent", reopen);
    return () => window.removeEventListener("bf:open-consent", reopen);
  }, []);

  if (choice !== null && !open) return null;

  function choose(next: Exclude<ConsentChoice, null>) {
    setConsentChoice(next);
    setOpen(false);
  }

  return (
    <section role="dialog" aria-label="Preferências de privacidade" aria-live="polite" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[0_18px_60px_rgba(15,45,32,.22)] sm:inset-x-6 sm:bottom-6 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-extrabold text-[var(--ink)]">Você escolhe o que compartilhar</p>
          <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
            O armazenamento de sessão necessário mantém o quiz funcionando. Pixels de medição opcionais só são carregados após sua autorização e nunca recebem suas respostas.
            {" "}<Link href="/privacidade" className="font-bold text-[var(--forest)] underline underline-offset-2">Leia a política de privacidade</Link>.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 min-[400px]:flex-row">
          <button type="button" onClick={() => choose("rejected")} className="rounded-full border border-[var(--line)] px-4 py-3 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--paper)]">
            Recusar opcionais
          </button>
          <button type="button" onClick={() => choose("accepted")} className="rounded-full bg-[var(--forest)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--forest-dark)]">
            Aceitar medição opcional
          </button>
        </div>
      </div>
    </section>
  );
}
