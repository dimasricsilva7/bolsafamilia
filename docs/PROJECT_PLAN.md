# Plano de implementação

## Objetivo e limites

Aplicação Next.js App Router, TypeScript e Tailwind para informar sobre o Bolsa Família sem se apresentar como serviço governamental. O fluxo inclui página inicial, quiz de seis perguntas com uma tela por etapa, processamento transparente, resumo local, links oficiais, política de privacidade e termos. Não pede CPF, senha gov.br ou documentos; não afirma aprovação, elegibilidade, reajuste ou valores individuais.

## Arquitetura

`src/app` contém páginas estáticas em português. `QuizFlow` controla navegação e progresso no cliente, guarda respostas apenas em `sessionStorage` e não as inclui em URL, API ou eventos. `ResultSummary` exibe as escolhas locais e links do MDS/Disque Social 121. O layout global reúne cabeçalho, rodapé, consentimento e o rastreador de navegação.

`meta-tracking.ts` concentra os quatro Pixels independentes. Cada um exige ID válido, variável individual de ativação, allowlist de eventos e consentimento opcional aceito. A versão atual envia somente `PageView` e `ViewContent`; não ativa CAPI e bloqueia `Purchase` porque não existe backend de pagamento.

A auditoria encontrou uma implementação Bravo Pay no projeto `crochesantinho`, que informa cobrança Pix, assinatura HMAC e idempotência. Como o novo projeto não tem serviço real, preço, credenciais ou persistência, checkout, webhook e banco foram deixados fora. Isso evita cobrança fictícia e eventos `Purchase` não confirmados.

## Direção visual

- Estilo editorial de serviço público independente, sem brasões ou sinais visuais de afiliação governamental.
- Fundo claro, verde floresta e acentos de lima para comunicar calma e legibilidade.
- Layout mobile-first com uma pergunta por tela, textos curtos e áreas de toque generosas.
- Interações previsíveis, estados visíveis e respeito a `prefers-reduced-motion`.
- Marca própria simples de folha/linha, acompanhada de aviso explícito de independência.
