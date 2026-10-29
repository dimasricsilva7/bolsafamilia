# Plano de implementação

## Objetivo, fonte e limites

Evoluir o código auditado `dimasricsilva7/bolsafamilia` sem alterar a branch original `main` nem fazer deploy. O usuário criará o projeto Vercel e fará a publicação. A fonte restaurada usa Next.js 16.4.3, React 19.3, TypeScript, Tailwind 4, pnpm 11.25 e Vitest; já inclui home informativa, quiz de seis etapas, resultado, privacidade, termos, consentimento Meta e visual mobile-first verde-floresta/lima. Preservar os avisos de independência e não usar sinais de afiliação governamental. Os quatro Pixel IDs existentes permanecem desligados por padrão e condicionados a consentimento; não ativar CAPI ou eventos de compra sem autorização e confirmação financeira real.

Decisão atual do usuário: **não usar Supabase por enquanto**. Os registros do painel serão mantidos apenas em `localStorage` no navegador do administrador e poderão ser exportados em CSV/JSON. Não haverá sincronização entre dispositivos, armazenamento confiável no servidor, nem coleta central das respostas feitas por visitantes; dados do quiz continuam temporários no navegador do próprio visitante. Informar essas limitações claramente e não sugerir que os registros locais sejam um cadastro central. Não guardar CPF, dados bancários, credenciais ou outras informações sensíveis.

## Arquitetura e comportamento

- Aplicação em Next.js App Router/TypeScript, com rotas públicas e área administrativa autenticada no servidor. Operações administrativas não dependem de um banco.
- Login único de administrador, restrito a `ADMIN_EMAIL` (padrão `dimasricsilva@gmail.com`) e `ADMIN_PASSWORD`, fornecidos apenas por variável de ambiente privada. Assinar cookie de sessão `HttpOnly; Secure; SameSite=None` usando `ADMIN_SESSION_SECRET` e expiração curta; sem cadastro público. Nunca incluir senha ou segredo no bundle, repositório, resposta ou log. Rotação da senha é feita no ambiente de deploy. Limitação de tentativas documentada como local ao processo, sem garantia distribuída em serverless.
- Painel apresenta registros locais não sensíveis, permite criar/atualizar/excluir entradas, filtrar/contar por status e exportar CSV e JSON. Dados persistem somente no navegador/dispositivo administrativo que os criou. Exportação é local e acionada pelo usuário.
- A página de checkout e a integração BravoPay continuam indisponíveis. O adaptador server-side existente é mantido desligado por `CHECKOUT_ENABLED=false`; sem armazenamento durável e sem serviço/preço reais, não criar cobranças nem declarar pagamentos reais. Manter testes isolados usando fetch simulado.
- Quiz e resultado permanecem informativos, sem CPF ou dados financeiros e sem armazenar respostas de visitantes no servidor ou no painel local do admin. Textos não podem sugerir consulta oficial, elegibilidade, aprovação, dinheiro liberado ou aumento do benefício.
- O painel mantém configurações futuras e limitações visíveis. Edição completa de conteúdo/quiz/design e armazenamento central permanecem pendências, não aparentam funcionar antes de implementados.
- O usuário configura segredos privados e faz o deploy na Vercel; não publicar nem alterar `main`.

## Estrutura principal

- `src/app/`: páginas públicas e páginas administrativas/login.
- `src/components/`: componentes de layout, quiz e dashboard local/exportação.
- `src/lib/`: validação do quiz, autenticação e sessão assinada, armazenamento local administrativo, tracking e adaptador BravoPay.
- `public/`: marca existente e `manus-routes.json` completo.
- `docs/`: instruções de ambiente, login, uso e exportação local, Vercel e limites conhecidos.
- `tests`/arquivos `*.test.ts`: testes unitários e simulações; nenhum teste envia cobranças.

## Direção visual

Reutilizar a aparência existente: editorial, independente e acolhedora, sem aspecto de portal governamental. Manter fundo claro, verde-floresta `#176b50`, verde-escuro `#0f4e3a`, menta e lima `#c3df74`, bordas suaves e o símbolo SVG atual. Priorizar transparência, legibilidade móvel, avisos de privacidade e uma lista administrativa simples. Usar Arial/Helvetica já adotada, títulos pesados, corpo confortável e animações curtas que respeitem `prefers-reduced-motion`. Voz direta e sem promessas: “Informação pública, em linguagem simples.” e “Este site é independente e não representa o Governo Federal.” Cor proprietária: verde-floresta.

## Dependências e restrições

Preservar toolchain e scripts, retirando dependências Supabase que não serão usadas. Variáveis privadas esperadas: `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET`; `ADMIN_EMAIL` é identificador sem segredo. O armazenamento local pode ser apagado pelo navegador, não sincroniza e não substitui base durável. Em Vercel, não gravar dados operacionais em arquivo local do servidor, porque não é uma forma confiável de persistência. Sem preço/serviço reais e sem armazenamento durável, checkout fica desligado. Compilar, testar e revisar o app; o usuário controla criação do projeto e deploy.
