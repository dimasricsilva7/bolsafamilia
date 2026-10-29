# Bolsa Família: informação clara

Quiz independente, mobile-first e informativo sobre o Bolsa Família. O site não representa o Governo Federal, não consulta sistemas oficiais, não avalia elegibilidade e não oferece cobrança nesta versão.

## Executar localmente

Requisitos: Node.js 22+ e pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Abra `http://localhost:3000`. Verificações disponíveis:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Painel administrativo e dados locais

O painel `/admin/login` exige `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` configurados como segredos privados no ambiente. A lista administrativa é salva somente no `localStorage` do navegador do admin e pode ser exportada em CSV ou JSON. Ela não sincroniza entre dispositivos nem recebe respostas de visitantes; limpe o armazenamento do navegador apenas depois de exportar o que precisa manter. Não registre CPF, dados bancários, senhas ou outras informações sensíveis. Veja [`docs/LOCAL_ADMIN_STORAGE.md`](docs/LOCAL_ADMIN_STORAGE.md).

## Estrutura

- `src/app/`: páginas públicas, `/admin/login`, `/admin`, `/admin/configuracoes` e `/admin/pagamentos`.
- `src/components/QuizFlow.tsx`: perguntas, progresso, navegação e processamento transparente.
- `src/components/admin/RecordsDashboard.tsx`: lista no navegador autenticado e exportação CSV/JSON.
- `src/lib/quiz.ts`: opções, validação e leitura segura das respostas.
- `src/lib/admin-auth.ts`: sessão administrativa assinada no servidor.
- `src/lib/admin-local-store.ts`: validação e exportação dos registros do navegador.
- `src/lib/meta-tracking.ts`: gerenciador central dos quatro Pixels, consentimento, allowlist de eventos e deduplicação do navegador.
- `.env.example`: nomes e valores públicos de exemplo; não contém credenciais.
- `docs/INTEGRACOES.md`: decisões, referência Bravo Pay, configuração de Pixels e pendências de ativação.

As respostas são guardadas somente no `sessionStorage` do navegador do visitante para exibir seu resumo. Não são transmitidas ao servidor nem aos Pixels. Os registros inseridos no painel são separados e existem somente no navegador administrativo. Não há banco de dados nem persistência central.

## Pixels e consentimento

Os quatro IDs informados estão separados no `.env.example`, cada um com seu próprio interruptor e lista de eventos. Todos vêm desativados. A biblioteca Meta só é carregada depois que a pessoa aceita medição opcional e quando pelo menos um Pixel autorizado está habilitado. A recusa é padrão até a escolha do visitante. O gerenciador envia somente `PageView` e `ViewContent` nesta versão; ele não envia respostas do quiz, identificadores pessoais ou valores de benefício.

`InitiateCheckout` não é emitido porque não existe checkout ativo. `Purchase` é bloqueado no cliente e não é emitido: só deve ser adicionado quando houver um serviço real, cobrança autorizada, armazenamento persistente e confirmação de pagamento no servidor. Não há Meta Conversions API ativa nesta versão; tokens são exclusivamente privados e precisam ser fornecidos e autorizados antes de qualquer integração server-side.

## Bravo Pay e checkout

O projeto não contém endpoint de cobrança ou webhook ativo. Não há produto, descrição comercial, preço, chave da Bravo Pay, segredo de webhook ou armazenamento de eventos configurados. Por isso, o checkout permanece ausente e nenhuma cobrança pode ser iniciada. Não altere `CHECKOUT_ENABLED` para ativá-lo: esse sinal é apenas documental até que um fluxo completo de servidor, banco, webhook validado e idempotência esteja implementado e testado.

## Publicação no Vercel

O código será entregue em uma branch isolada `manus/admin-local-storage` do repositório original; importe essa branch no seu projeto Vercel depois que ela estiver disponível no GitHub. Defina `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` como segredos privados da Vercel (segredo de sessão com pelo menos 32 caracteres). Os quatro Pixels devem permanecer desligados até confirmar, para cada conta, autorização de uso no domínio e consentimento correspondente. Não configure credenciais de pagamento/CAPI. Nenhum deploy será feito por esta tarefa.

## Fontes

- [Regras oficiais do Bolsa Família](https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia/conheca-as-regras)
- [Disque Social 121](https://www.gov.br/mds/pt-br/canais_atendimento/disque-social-121)
- [Documentação oficial da Bravo Pay](https://bravopay.club/docs)
- [Deduplicação oficial do Meta Pixel e CAPI](https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events)
