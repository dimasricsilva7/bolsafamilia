"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { answerLabel, quizQuestions, QUIZ_STORAGE_KEY, safeQuizAnswers } from "@/lib/quiz";

function subscribeToQuiz(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("bf:quiz-updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("bf:quiz-updated", callback);
    window.removeEventListener("storage", callback);
  };
}

function getStoredAnswers(): string | null {
  try {
    return window.sessionStorage.getItem(QUIZ_STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseStoredAnswers(raw: string | null) {
  try {
    return raw ? safeQuizAnswers(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function ResultSummary() {
  const raw = useSyncExternalStore(subscribeToQuiz, getStoredAnswers, () => undefined);
  const answers = parseStoredAnswers(raw ?? null);

  if (raw === undefined) return <section className="page-wrap min-h-[60vh] py-16" aria-label="Carregando resumo"><div className="mx-auto h-8 max-w-3xl animate-pulse rounded bg-[#e7ede5]" /></section>;

  return (
    <section className="page-wrap py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <p className="eyebrow">Seu resultado informativo</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">Um resumo das informações que você compartilhou.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">Este site não avalia renda, não consulta cadastros e não informa se alguém será aprovado. Só o órgão responsável pode analisar uma situação individual.</p>

        {answers ? (
          <div className="mt-8 rounded-[28px] border border-[var(--line)] bg-white p-5 soft-shadow sm:p-8">
            <div className="flex items-start gap-3 border-b border-[var(--line)] pb-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--mint)] font-extrabold text-[var(--forest)]">✓</span>
              <div><h2 className="text-lg font-extrabold">Suas respostas</h2><p className="mt-1 text-sm text-[var(--muted)]">Armazenadas somente nesta sessão do navegador.</p></div>
            </div>
            <dl className="divide-y divide-[var(--line)]">
              {quizQuestions.map((question) => (
                <div key={question.id} className="grid gap-1 py-4 sm:grid-cols-[.9fr_1.1fr] sm:gap-5">
                  <dt className="text-sm font-bold text-[var(--muted)]">{question.title}</dt>
                  <dd className="text-sm font-semibold leading-6">{answerLabel(question, answers[question.id])}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-[var(--line)] bg-white p-6">
            <h2 className="text-lg font-extrabold">Seu resumo não está disponível nesta aba.</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Você ainda pode consultar as fontes oficiais abaixo. Se quiser, faça o quiz novamente.</p>
            <Link href="/quiz" className="mt-4 inline-flex rounded-full bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white">Refazer o quiz</Link>
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <a href="https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia/conheca-as-regras" target="_blank" rel="noreferrer" className="group rounded-[24px] border border-[#cddfce] bg-[#f0f6ed] p-6 transition hover:-translate-y-0.5">
            <span className="text-xs font-extrabold uppercase tracking-[.12em] text-[var(--forest)]">Ministério do Desenvolvimento Social</span>
            <h2 className="mt-3 text-xl font-extrabold">Conheça as regras ↗</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Consulte as regras vigentes, a inscrição no Cadastro Único e orientações oficiais.</p>
          </a>
          <a href="https://www.gov.br/mds/pt-br/canais_atendimento/disque-social-121" target="_blank" rel="noreferrer" className="group rounded-[24px] border border-[var(--line)] bg-white p-6 transition hover:-translate-y-0.5">
            <span className="text-xs font-extrabold uppercase tracking-[.12em] text-[var(--forest)]">Atendimento oficial</span>
            <h2 className="mt-3 text-xl font-extrabold">Disque Social 121 ↗</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Canal do MDS para esclarecer dúvidas sobre programas e serviços sociais.</p>
          </a>
        </div>

        <p className="mt-6 rounded-2xl bg-[var(--amber)] px-5 py-4 text-sm leading-6 text-[#665018]">
          <strong>Importante:</strong> o recebimento do benefício não depende de taxa cobrada por este site. Consulte valores, pagamentos e atualizações apenas nos canais oficiais. As respostas do quiz não são enviadas para esses órgãos.
        </p>
      </div>
    </section>
  );
}
