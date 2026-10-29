# Login, registros locais e exportação

Esta versão não usa Supabase nem outro banco. O painel administrativo tem login baseado em segredos privados do servidor e uma lista operacional armazenada no `localStorage` do navegador do administrador.

Configure estas variáveis no ambiente privado de Preview e na Vercel:

```dotenv
ADMIN_EMAIL=dimasricsilva@gmail.com
ADMIN_PASSWORD=<senha aleatória forte, somente no gerenciador de segredos>
ADMIN_SESSION_SECRET=<segredo aleatório com pelo menos 32 caracteres>
CHECKOUT_ENABLED=false
```

Gere um segredo de sessão com um gerador criptográfico (por exemplo, `openssl rand -hex 32`). Nunca salve senha/chave neste arquivo, em `.env.example`, no Git, no frontend ou em mensagens. O cookie de sessão é assinado, `HttpOnly`, `Secure`, `SameSite=None`, expira em oito horas e é validado no servidor. O contador de tentativas de login é por processo; em implantação serverless ele não substitui rate limiting central. Não há cadastro nem recuperação automática de senha: altere `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` no gerenciador de segredos e implante novamente para revogar sessões anteriores.

Os registros são inseridos manualmente na lista administrativa e persistem somente no navegador/dispositivo onde foram criados. O painel permite pesquisar, filtrar status, atualizar status, excluir e exportar CSV/JSON. Exportar cria um arquivo no navegador após ação explícita. Não há envio ao servidor, sincronização entre navegadores ou restauração automática. Os dados podem ser apagados pelo próprio navegador; mantenha exportações em local protegido.

As respostas do quiz continuam temporárias no navegador de cada visitante. Elas não aparecem no painel do admin, porque diferentes navegadores não compartilham `localStorage`. Não use este painel local para coletar CPF, dados financeiros, senhas ou detalhes pessoais. Para centralizar respostas de vários visitantes, será necessária uma decisão posterior sobre serviço persistente e privacidade.

O checkout BravoPay permanece desativado. `localStorage` não é um livro-razão durável e não pode confirmar pagamentos. O adaptador BravoPay e seus testes usam mocks, mas não foram usados para solicitar transações reais.
