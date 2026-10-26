"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isAnswerComplete, QUIZ_STORAGE_KEY, quizQuestions, type QuizAnswers } from "@/lib/quiz";

const processingSteps = [
  "Organizando suas respostas",
  "Preparando seu resumo",
  "Reunindo links oficiais publicados",
  "Finalizando o resultado",
];

export function QuizFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const question = quizQuestions[step];
  const current = answers[question.id];
  const progress = Math.round(((step + 1) / quizQuestions.length) * 100);

  function updateSingle(value: string) {
    setAnswers((previous) => ({ ...previous, [question.id]: value }));
    setError("");
  }

  function updateMultiple(value: string) {
    const existing = Array.isArray(current) ? current : [];
    const next = value === "prefer_not"
      ? ["prefer_not"]
      : existing.includes(value)
        ? existing.filter((item) => item !== value && item !== "prefer_not")
        : [...existing.filter((item) => item !== "prefer_not"), value];
    setAnswers((previous) => ({ ...previous, [question.id]: next }));
    setError("");
  }

  async function goForward() {
    if (!isAnswerComplete(question, current)) {
      setError("Escolha uma opção para continuar. Se preferir, selecione “Prefiro não informar”.");
      return;
    }
    if (step < quizQuestions.length - 1) {
      setStep((value) => value + 1);
      setError("");
      return;
    }
    setProcessing(true);
    setError("");
    for (let index = 0; index < processingSteps.length; index += 1) {
      setActiveProcessingStep(index);
      await new Promise((resolve) => window.setTimeout(resolve, 520));
    }
    try {
      sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(answers));
      window.dispatchEvent(new Event("bf:quiz-updated"));
    } catch {
      // Se o navegador bloquear armazenamento, o usuário ainda recebe as fontes oficiais.
    }
    router.push("/resultado");
  }

  const [activeProcessingStep, setActiveProcessingStep] = useState(0);

  if (processing) {
    return (
      <section className="page-wrap flex min-h-[70vh] items-center justify-center py-12" aria-live="polite">
        <div className="soft-shadow w-full max-w-xl rounded-[30px] border border-[var(--line)] bg-white p-7 sm:p-10">
          <span className="eyebrow">Seu resumo está sendo preparado</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Só mais um instante.</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Não estamos consultando CPF, sistemas do governo ou cadastros oficiais.</p>
          <ol className="mt-8 space-y-4">
            {processingSteps.map((label, index) => (
              <li key={label} className={`flex items-center gap-3 text-sm ${index <= activeProcessingStep ? "font-bold text-[var(--ink)]" : "text-[var(--muted)]"}`}>
                <span className={`grid h-8 w-8 place-items-center rounded-full ${index < activeProcessingStep ? "bg-[var(--mint)] text-[var(--forest)]" : index === activeProcessingStep ? "bg-[var(--forest)] text-white" : "bg-[var(--paper)] text-[var(--muted)]"}`}>
                  {index < activeProcessingStep ? "✓" : <span className={index === activeProcessingStep ? "animate-pulse-dot" : ""}>●</span>}
                </span>
                {label}
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section className="page-wrap py-9 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7 flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-bold text-[var(--muted)] hover:text-[var(--forest)]">← Sair do quiz</Link>
          <span className="text-xs font-bold text-[var(--muted)]">PERGUNTA {step + 1} DE {quizQuestions.length}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#e5ebe4]" role="progressbar" aria-label="Progresso do quiz" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="h-full rounded-full bg-[var(--forest)] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="soft-shadow mt-5 rounded-[30px] border border-[var(--line)] bg-white p-5 sm:mt-7 sm:p-9">
          <div key={question.id} className="animate-rise">
            <p className="eyebrow">Quiz informativo</p>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{question.title}</h1>
            <p id="question-hint" className="mt-3 text-sm leading-6 text-[var(--muted)]">{question.hint}</p>
            <fieldset aria-describedby="question-hint" className="mt-7 grid gap-3">
              <legend className="sr-only">{question.title}</legend>
              {question.options.map((option) => {
                const checked = question.type === "multiple"
                  ? Array.isArray(current) && current.includes(option.value)
                  : current === option.value;
                return (
                  <label key={option.value} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${checked ? "border-[var(--forest)] bg-[#f1f7ed]" : "border-[var(--line)] hover:border-[#9dbca7] hover:bg-[#fbfcf9]"}`}>
                    <input
                      type={question.type === "multiple" ? "checkbox" : "radio"}
                      name={question.id}
                      value={option.value}
                      checked={checked}
                      onChange={() => question.type === "multiple" ? updateMultiple(option.value) : updateSingle(option.value)}
                      className="peer sr-only"
                    />
                    <span aria-hidden="true" className={`grid h-5 w-5 shrink-0 place-items-center border ${question.type === "multiple" ? "rounded-md" : "rounded-full"} ${checked ? "border-[var(--forest)] bg-[var(--forest)] text-white" : "border-[#b8c7bb] bg-white"}`}>
                      {checked ? <span className="text-xs font-black">✓</span> : null}
                    </span>
                    <span className="text-sm font-semibold leading-5">{option.label}</span>
                  </label>
                );
              })}
            </fieldset>
            {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff4e9] px-4 py-3 text-sm font-semibold text-[#8b4a1b]">{error}</p>}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--line)] pt-5 min-[430px]:flex-row min-[430px]:justify-between">
            <button type="button" disabled={step === 0} onClick={() => { setStep((value) => Math.max(0, value - 1)); setError(""); }} className="min-h-12 rounded-full border border-[var(--line)] px-6 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-40">← Voltar</button>
            <button type="button" onClick={goForward} className="min-h-12 rounded-full bg-[var(--forest)] px-6 text-sm font-extrabold text-white transition hover:bg-[var(--forest-dark)]">
              {step === quizQuestions.length - 1 ? "VER MEU RESULTADO" : "CONTINUAR →"}
            </button>
          </div>
        </div>
        <p className="mx-auto mt-5 max-w-xl text-center text-xs leading-5 text-[var(--muted)]">Não informe CPF, senha gov.br, dados bancários ou documentos. Suas respostas ficam apenas nesta sessão e não são enviadas para a Meta.</p>
      </div>
    </section>
  );
}
