import type { Metadata } from "next";
import { ConsentPreferencesButton } from "@/components/ConsentPreferencesButton";

export const metadata: Metadata = { title: "Política de privacidade" };

export default function PrivacyPage() {
  return (
    <article className="page-wrap py-12 sm:py-16">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-[var(--line)] bg-white p-6 sm:p-10">
        <p className="eyebrow">Transparência</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Política de privacidade</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Última atualização: 26 de outubro de 2026</p>
        <div className="mt-8 space-y-7 text-sm leading-7 text-[var(--muted)]">
          <section><h2 className="text-lg font-extrabold text-[var(--ink)]">Quem somos</h2><p>Este é um site independente de caráter informativo. Não é um canal do Governo Federal, do Ministério do Desenvolvimento e Assistência Social ou da CAIXA. Não prestamos serviços de cadastro, consulta ou concessão de benefícios.</p></section>
          <section><h2 className="text-lg font-extrabold text-[var(--ink)]">Respostas do quiz</h2><p>As respostas são usadas apenas para exibir seu resumo neste navegador. Elas são guardadas em armazenamento temporário da sessão (<code>sessionStorage</code>) e não são enviadas ao nosso servidor, ao Governo Federal ou a plataformas de publicidade. Ao fechar a aba/sessão, o navegador normalmente descarta esse armazenamento. Você pode apagar os dados do site nas configurações do navegador.</p></section>
          <section><h2 className="text-lg font-extrabold text-[var(--ink)]">Dados que não pedimos</h2><p>Não solicitamos CPF, senha gov.br, documentos, dados bancários ou informações de login. Não digite esse tipo de dado nos campos de resposta livre porque o quiz não precisa dele.</p></section>
          <section><h2 className="text-lg font-extrabold text-[var(--ink)]">Medição opcional</h2><p>Pixels de medição podem ser carregados somente depois que você escolher “Aceitar medição opcional”. Eles estão desligados por padrão na configuração do projeto e cada Pixel possui uma chave independente. As respostas do quiz não são usadas nos eventos. Você pode rever ou alterar a escolha abaixo. Se recusar, nenhum Pixel é inicializado.</p><ConsentPreferencesButton className="mt-3 rounded-full border border-[var(--line)] px-4 py-2 font-bold text-[var(--forest)] hover:bg-[var(--paper)]" /></section>
          <section><h2 className="text-lg font-extrabold text-[var(--ink)]">Fontes oficiais</h2><p>Para regras e acompanhamento do benefício, consulte diretamente o <a className="font-bold text-[var(--forest)] underline" href="https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia" target="_blank" rel="noreferrer">portal do Ministério do Desenvolvimento e Assistência Social</a> e os canais nele indicados. Este site não se conecta aos sistemas do governo.</p></section>
          <section><h2 className="text-lg font-extrabold text-[var(--ink)]">Contato e alterações</h2><p>Esta política poderá ser atualizada se o funcionamento do site mudar. A versão mais recente ficará disponível nesta página.</p></section>
        </div>
      </div>
    </article>
  );
}
