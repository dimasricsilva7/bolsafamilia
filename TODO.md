# Pendências antes de produção comercial ou tracking

- [ ] Confirmar que cada um dos quatro Pixels está autorizado para este domínio e funil; somente então ativar o respectivo `NEXT_PUBLIC_META_PIXEL_*_ENABLED` e selecionar eventos.
- [ ] Decidir se a Conversions API será usada; obter tokens autorizados individualmente e armazená-los somente como segredos privados na Vercel. Não habilitar enquanto não existir evento server-side elegível.
- [ ] Definir um serviço privado real, seu responsável, descrição e preço. Não cobrar taxa apresentada como governamental e não prometer benefício.
- [ ] Se um checkout legítimo for aprovado, implementar persistência durável, geração de cobrança Pix, cópia do código, atualização de status, webhook HMAC, idempotência, confirmação backend e página de sucesso consultada pelo servidor.
- [ ] Testar a integração Bravo Pay em sandbox com credenciais autorizadas; não considerar testes de código ou mocks como prova de operação em produção.
- [ ] Implementar Purchase no navegador e/ou CAPI somente após confirmação real, com valor da transação, BRL, identificador único e deduplicação; bloquear recarga/duplicidade e pagamentos pendentes.
- [ ] Rotacionar tokens privados compartilhados anteriormente antes de qualquer publicação, conforme aplicável.
- [ ] Importar o repositório no Vercel e verificar a publicação real; nenhum deploy está confirmado nesta versão.
