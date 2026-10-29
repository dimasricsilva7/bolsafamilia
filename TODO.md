# Entregas pendentes

A base restaurada contém uma home informativa, quiz de seis perguntas, resumo temporário, privacidade, termos, consentimento de métricas e Pixels desligados. Em 28/10/2026 o Preview respondeu HTTP 200 na home e em `/manus-routes.json`; as rotas administrativas sem sessão redirecionaram ao login. Após a decisão de não usar Supabase, build de produção, TypeScript, lint e 38 testes passaram. A confirmação do usuário foi: armazenamento somente no navegador do admin, com exportação; respostas de visitantes não são centralizadas.

## 1. Experiência pública independente e acessível

- [ ] Manter página inicial responsiva e prioritariamente móvel, com logotipo, título configurável, subtítulo e descrição, imagem opcional, lista informativa, CTA para o quiz e rodapé com responsável e aviso explícito de que o site é independente, não representa o Governo Federal e não substitui os canais oficiais do Bolsa Família. Não usar brasões, selos ou sinais visuais de portal governamental.
- [ ] Preservar privacidade e termos, incluindo identificação do fornecedor, finalidade do serviço, suporte e condições aplicáveis. Usar metadados por página pública, HTML inicial significativo e páginas administrativas não indexáveis; não expor dados pessoais.
- [ ] Garantir telas pequenas sem rolagem horizontal, contraste suficiente, foco visível, teclado, rótulos acessíveis, estado de carregamento/erro e respeito a `prefers-reduced-motion`.

## 2. Quiz e resultado exclusivamente informativos

- [ ] Manter quiz de etapas curtas com progresso, indicador da etapa, controles de resposta adequados, avançar/voltar, validação obrigatória, transições acessíveis, persistência temporária apenas no navegador do visitante, tela de conclusão e opção de reiniciar. Não solicitar CPF, dados bancários, senhas ou dados sensíveis.
- [ ] O painel poderá futuramente permitir criar, editar, duplicar, reordenar e desativar perguntas, opções, obrigatoriedade, tipo, mensagens, botões e ordem, com prévia e publicação explícita. Até esse editor existir, não alegar que as perguntas são editáveis.
- [ ] Após a última etapa, loader configurável com ícone, título, subtítulo, estado, progresso, animação e duração razoável. Ele representa apenas processamento local do questionário; não simula acesso a sistema do Governo, consulta CadÚnico, aprovação, dinheiro liberado ou validação oficial.
- [ ] Resultado exibe conclusão, resumo local das respostas, próximos passos e canais oficiais; avisa que não confirma elegibilidade, aprovação nem aumento do benefício. Não afirmar aprovação, dinheiro liberado ou reajuste. Qualquer serviço privado futuro precisa informar finalidade, responsável, preço total e condições antes da cobrança.

## 3. Login e segurança administrativa sem Supabase

- [ ] Acessar o painel somente por login. E-mail administrativo padrão `dimasricsilva@gmail.com`; senha e chave de assinatura vêm de `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` em segredo de ambiente, nunca do código, cliente, Git, log ou resposta. Sem cadastro público. A senha é alterada no provedor de ambiente e nunca é salva em `localStorage`.
- [ ] Validar a sessão assinada no servidor em toda rota/operação administrativa. Cookie `HttpOnly; Secure; SameSite=None`, expiração limitada, logout e mensagens genéricas de falha. Aplicar limitação de tentativas e documentar que um contador em processo não é global entre instâncias Vercel. Não alegar fluxo automático de recuperação de senha.
- [ ] Não coletar ou manter segredo/credencial no navegador administrativo. Exportação é deliberada pelo usuário e gera arquivo no navegador.

## 4. Registros locais, dashboard e exportação

- [x] Manter uma lista de registros não sensíveis no `localStorage` do navegador/dispositivo autenticado do administrador; permitir inserir, consultar, editar status e excluir, com identificador e data, filtros/contagens e feedback de erro. Não armazenar CPF, dados bancários, senhas ou informações sensíveis; exibir aviso para não inserir dados pessoais desnecessários.
- [x] Permitir exportar a lista local em CSV e JSON por ação do usuário, com escaping CSV para campos que poderiam virar fórmulas. Não enviar a lista ao servidor nem iniciar download automaticamente.
- [x] Explicar claramente em interface/documentação que estes dados existem somente neste navegador, não sincronizam entre dispositivos, podem ser apagados pelo browser e não incluem respostas de visitantes de outros dispositivos. O dashboard não pode apresentar métricas agregadas do público como se houvesse armazenamento central.
- [x] Respostas do quiz permanecem temporárias no navegador de cada visitante e não são copiadas automaticamente para o painel admin. Armazenamento central dos visitantes exige serviço persistente e aprovação/decisão futura do usuário.

## 5. Conteúdo, design e histórico de publicação

- [ ] Permitir futuramente editar, sem código, títulos, descrições, instruções, perguntas/opções, validações, botões, loader, resultado, serviço, suporte, rodapé, termos e políticas.
- [ ] Permitir futuramente editar logo/imagens, ícones permitidos, cores, fontes, cantos, espaçamentos, cartões, botões e largura mobile/desktop, com prévia, rascunho, publicação explícita e restauração de versões. Até esses editores existirem, rotas/links não devem sugerir recursos prontos.
- [ ] Conteúdo editável nunca remove avisos obrigatórios de independência e de que o resultado não é consulta/decisão oficial, nem permite retratar cobrança como taxa governamental. Renderizar texto como texto escapado.

## 6. Pagamentos/BravoPay permanecem desligados

- [ ] O checkout, quando habilitado futuramente, deverá explicar claramente o serviço privado, mostrar preço total, QR Pix e código copia-e-cola do gateway, copiar, instruções, status real, aviso contra segundo pagamento pendente, suporte, cancelamento e reembolso. Não pedir dados dispensáveis nem indicar taxa oficial/requisito de benefício ou garantir aumento.
- [ ] No servidor, gerar pedido único, validar preço e descrição pela configuração comercial do servidor, criar cobrança, validar resposta, exibir QR/status e confirmar apenas por webhook autenticado ou consulta oficial documentada; clique/retorno do navegador nunca confirma pagamento.
- [ ] Usar mapeamento explícito e documentado para status; processar webhooks autenticados e idempotentes, deduplicar evento, resistir a repetição/ordem inesperada e não expor segredo BravoPay. A implementação de gateway não faz chamadas reais durante testes.
- [ ] O checkout começa desativado e continua desativado até existirem serviço privado real, responsável, preço, moeda, descrição, suporte, regras comerciais, credenciais e armazenamento durável aprovado. Não inventar serviço ou preço. Sem persistência central, não emitir cobranças reais.

## 7. Configuração, documentação e entrega

- [ ] Manter `.env.example` apenas com nomes de variável e valores de demonstração não secretos. Incluir instrução para definir `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` como variáveis privadas no preview/hosting. Não configurar Supabase nesta fase.
- [ ] Documentar login, armazenamento local, limites, exportação CSV/JSON, ausência de sincronização/centralização e configuração Vercel. O usuário criará o projeto e fará deploy; não publicar em produção.
- [ ] Executar build, lint, TypeScript e testes após a mudança de arquitetura; testar o dashboard local, login/autorização, exportação e proteção contra conteúdo CSV executável. Registrar que respostas públicas não chegam ao admin e que gateway não foi testado nem usado.
- [ ] Entregar pendências honestamente. Mudanças externas GitHub permanecem em branch isolada e não em `main`; não assumir configuração Vercel nem deploy.
