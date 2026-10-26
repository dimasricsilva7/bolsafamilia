import Link from "next/link";

const infoItems = [
  { number: "01", title: "Responda no seu ritmo", copy: "Uma pergunta por vez. Você pode voltar e mudar qualquer resposta." },
  { number: "02", title: "Receba um resumo", copy: "Veja as escolhas feitas por você, sem cálculo de benefício ou avaliação de elegibilidade." },
  { number: "03", title: "Consulte fontes oficiais", copy: "Acesse os canais públicos do Ministério do Desenvolvimento e da CAIXA." },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-36 -top-44 h-[480px] w-[480px] rounded-full bg-[var(--mint)]/70 blur-2xl" />
        <div className="page-wrap relative grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.2fr_.8fr] lg:items-center lg:gap-14 lg:py-24">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#cde1d1] bg-white/80 px-3.5 py-2 text-xs font-extrabold text-[var(--forest-dark)]">
              <span className="h-2 w-2 rounded-full bg-[#63a876]" /> GUIA INDEPENDENTE
            </span>
            <p className="eyebrow mt-8">Informação pública, em linguagem simples</p>
            <h1 className="display-title mt-4">Você já recebe o <span className="text-[var(--forest)]">Bolsa Família?</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
              Responda ao quiz e organize suas dúvidas sobre as regras, os valores e os canais oficiais do programa.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[430px]:flex-row">
              <Link href="/quiz" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[var(--forest)] px-7 text-sm font-extrabold tracking-wide text-white transition hover:-translate-y-0.5 hover:bg-[var(--forest-dark)]">
                COMEÇAR MEU QUIZ <span aria-hidden="true">→</span>
              </Link>
              <a href="https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia" target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center rounded-full border border-[var(--line)] bg-white px-6 text-sm font-bold text-[var(--ink)] transition hover:border-[var(--forest)]">
                Ver site oficial ↗
              </a>
            </div>
            <p className="mt-5 flex max-w-xl gap-2 text-xs leading-5 text-[var(--muted)]">
              <span aria-hidden="true" className="mt-0.5 text-[var(--forest)]">●</span>
              Este site é independente e não representa o Governo Federal. O quiz não consulta CPF, não acessa sistemas oficiais e não confirma aprovação ou valores individuais.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[460px] animate-breathe lg:ml-auto">
            <div aria-hidden="true" className="absolute -left-5 top-10 h-20 w-20 rounded-[26px] bg-[var(--lime)]/70 rotate-[-12deg]" />
            <div className="soft-shadow relative rounded-[32px] border border-white bg-white p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.13em] text-[var(--muted)]">Seu ponto de partida</p>
                  <p className="mt-1 text-lg font-extrabold tracking-tight">Um resumo, não uma decisão</p>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--mint)] text-[var(--forest)]">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true"><path d="M7 12.5 10.1 16 17.5 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
                </span>
              </div>
              <div className="space-y-3 py-5">
                {[
                  ["Suas respostas", "Ficam nesta sessão do navegador"],
                  ["Dados pessoais", "Não solicitamos CPF ou senha"],
                  ["Próximo passo", "Consulte sempre canais oficiais"],
                ].map(([title, detail], index) => (
                  <div key={title} className="flex items-center gap-3 rounded-2xl bg-[var(--paper)] p-3.5">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-extrabold ${index === 0 ? "bg-[#e0efd5] text-[var(--forest)]" : "bg-white text-[var(--muted)]"}`}>{String(index + 1).padStart(2, "0")}</span>
                    <span><span className="block text-sm font-extrabold">{title}</span><span className="mt-0.5 block text-xs text-[var(--muted)]">{detail}</span></span>
                    <span className="ml-auto text-[var(--forest)]" aria-hidden="true">✓</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-[#f0f6ed] px-4 py-3.5 text-xs leading-5 text-[var(--forest-dark)]">
                <strong>Sem promessa de aprovação.</strong> Somente o Governo Federal pode analisar a concessão do benefício.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
          <div>
            <p className="eyebrow">Como funciona</p>
            <h2 className="mt-3 max-w-md text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Informação útil, sem complicação.</h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-[var(--muted)] lg:justify-self-end">
            São seis perguntas simples. Ao final, você verá as respostas que informou e links para buscar orientação diretamente nas fontes públicas.
          </p>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {infoItems.map((item) => (
            <article key={item.number} className="card-border rounded-[26px] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <span className="text-sm font-extrabold text-[var(--forest)]">{item.number}</span>
              <h3 className="mt-6 text-xl font-extrabold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-wrap pb-16 sm:pb-20">
        <div className="flex flex-col gap-5 rounded-[28px] bg-[var(--forest-dark)] px-6 py-8 text-white sm:flex-row sm:items-center sm:justify-between sm:px-9">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#c9e7d0]">Comece quando quiser</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Leva poucos minutos.</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">Você pode pular informações que não quiser compartilhar.</p>
          </div>
          <Link href="/quiz" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--lime)] px-6 text-sm font-extrabold text-[var(--forest-dark)] transition hover:brightness-105">COMEÇAR O QUIZ <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </>
  );
}
