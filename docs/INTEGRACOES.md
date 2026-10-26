# Integrações e limites desta versão

## Auditoria dos projetos existentes

Foram lidos os repositórios acessíveis relacionados no pedido que estavam disponíveis nesta conta: `CLEARFINGER`, `somostodospt`, `EBOOK-RECEITAS-DIABETES` e `crochesantinho`. Os dois nomes `Rama Beats` e `Projeto Projeção` não apareceram na lista de repositórios autorizados desta sessão. A pesquisa por referências diretas a Bravo Pay, Pix, `fbq`, Graph API e Meta Conversions API encontrou uma implementação extensa no `crochesantinho`; não foram copiados seus dados comerciais ou código de checkout específico.

No projeto de referência, os padrões relevantes estão em `src/lib/payments/bravopay.ts`, `src/server/webhooks.ts`, `src/app/api/webhooks/bravopay/route.ts`, `src/lib/meta/capi.ts`, `src/lib/client/tracking.ts` e `tests/core.test.ts`. A documentação associada é `docs/BRAVOPAY.md` e `docs/ANALYTICS.md`.

A implementação usa chave de idempotência na criação da cobrança, valida assinatura HMAC-SHA256 sobre o corpo bruto com tolerância temporal, bloqueia processamento sem assinatura válida, registra IDs de webhook para evitar reprocessamento e aplica status em um ponto único do servidor. A documentação também explica que a confirmação de compra depende do status real consultado ou recebido no backend. Os testes presentes cobrem assinatura válida/inválida/antiga, payload Pix e mapeamento de status. Não executamos esses testes nem verificamos uma transação real em produção; logo, isso não comprova operação atual do gateway.

Referências: [implementação Crochet Santinho](https://github.com/dimasricsilva7/crochesantinho), [documentação Bravo Pay](https://bravopay.club/docs).

## Decisão sobre a Bravo Pay

A documentação consultada descreve `POST /api/v1/transactions`, `Idempotency-Key`, autenticação Bearer, Pix copia-e-cola e webhooks assinados com HMAC. O QR pode ser gerado a partir do código Pix. Nenhuma credencial foi fornecida e não há produto, preço, serviço real ou persistência definidos para este projeto.

Por segurança, este aplicativo não cria cobrança, não apresenta um serviço ou valor fictício, não disponibiliza endpoint de webhook e não tem página de pagamento. Os nomes de variáveis estão listados em `.env.example` como preparação documental, sem valores secretos. Antes de implementar o fluxo, será necessário definir o serviço, seu responsável e preço real; provisionar persistência durável; implementar idempotência de transações/eventos; confirmar o formato e a validação de webhooks com a Bravo Pay; testar em ambiente autorizado; e só então habilitar o checkout.

## Pixels e consentimento

Os Pixels abaixo são variáveis independentes e vêm desligados por padrão:

- `VENDAS02_A`: `2298008410985632`
- `VENDAS01`: `2545677495939252`
- `VENDAS02_B`: `1453520040067694`
- `VENDAS03`: `1086394057363146`

Os dois identificadores `VENDAS02` foram preservados com chaves internas distintas. IDs são públicos; cada Pixel tem interruptor próprio e allowlist de eventos. Nenhum evento é encaminhado até haver consentimento explícito do visitante e o Pixel correspondente estar habilitado. A autorização do responsável para usar cada conta neste domínio não foi verificada, então todos devem permanecer desativados até essa validação.

A aplicação permite `PageView` e `ViewContent` em páginas de conteúdo. A lógica central usa `trackSingle` para selecionar cada Pixel e IDs de evento para evitar repetição no navegador. Eventos não recebem respostas, CPF, dados bancários, renda individual ou valor de benefício. `InitiateCheckout` não ocorre porque não há checkout. `Purchase` é bloqueado nesta versão porque não existe confirmação de pagamento no backend.

A Meta documenta deduplicação de evento browser/server por correspondência entre `eventID`/`event_id` e nome do evento. A Conversions API não foi ativada: tokens e permissões por conta não foram fornecidos, e o fluxo de pagamento confirmado necessário a um evento `Purchase` não existe. Cada token futuro deverá ser armazenado exclusivamente como variável privada na Vercel, separado por Pixel.

Fonte: [documentação da Meta sobre deduplicação](https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events).

## Variáveis para Vercel

Para a versão informativa, não são necessárias variáveis privadas e não há banco de dados. Ao importar para Vercel, mantenha todos os `NEXT_PUBLIC_META_PIXEL_*_ENABLED=false` até validar autorização e consentimento. As listas de eventos sugeridas são `PageView,ViewContent`.

As variáveis `BRAVOPAY_*`, `META_CAPI_*` e `CHECKOUT_ENABLED` em `.env.example` são apenas documentação para uma etapa futura; não ativam funcionalidade por si só. Nunca coloque tokens no GitHub, em variáveis `NEXT_PUBLIC_*` ou no navegador. Se tokens privados foram enviados em conversas anteriores, rotacione-os antes de qualquer publicação.
