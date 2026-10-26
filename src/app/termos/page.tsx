import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermsPage() {
  return (
    <article className="page-wrap py-12 sm:py-16">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-[var(--line)] bg-white p-6 sm:p-10">
        <p className="eyebrow">Uso responsável</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Termos de uso</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Última atualização: 26 de outubro de 2026</p>
        <div className="mt-8 space-y-7 text-sm leading-7 text-[var(--muted)]">
          <section><h2 className="text-lg font-extrabold text-[var(--ink)]">Natureza do serviço</h2><p>Este site oferece conteúdo educativo e um questionário de organização pessoal. É independente e não representa o Governo Federal, o Ministério do Desenvolvimento e Assistência Social, a CAIXA ou qualquer órgão público.</p></section>
          <section><h2 className="text-lg font-extrabold text-[var(--ink)]">Sem análise ou garantia</h2><p>O quiz não consulta CPF, CadÚnico, sistemas oficiais ou processos de concessão. O resumo não determina inscrição, elegibilidade, aprovação, valor, reajuste, liberação ou continuidade de benefício. Apenas os canais oficiais podem fornecer orientação sobre casos individuais.</p></section>
          <section><h2 className="text-lg font-extrabold text-[var(--ink)]">Sem cobrança por benefício</h2><p>Nesta versão não há produto pago, checkout ou cobrança Pix. Nenhum pagamento a este site desbloqueia o Bolsa Família ou garante um benefício. Desconfie de cobranças apresentadas como taxa governamental e confirme informações no portal oficial.</p></section>
          <section><h2 className="text-lg font-extrabold text-[var(--ink)]">Fontes e atualizações</h2><p>As informações são gerais e podem ficar desatualizadas. Regras e valores devem ser confirmados na página oficial do programa. O uso dos links externos segue os termos dos respectivos sites.</p></section>
          <section><h2 className="text-lg font-extrabold text-[var(--ink)]">Uso do quiz</h2><p>Não informe dados pessoais ou credenciais. As respostas ficam nesta sessão do navegador para compor o resumo local e não são enviadas ao servidor.</p></section>
        </div>
      </div>
    </article>
  );
}
