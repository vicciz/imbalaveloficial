# Importador universal

A importação passa por um contrato interno (`Product`) independente da plataforma. Cada provider transforma a resposta externa em um produto normalizado antes de executar o pipeline de limpeza, normalização, tradução, IA, SEO e validação.

## Preview CJ

`POST /api/products/import/preview`

Body:

```json
{
  "provider": "cj",
  "externalId": "PID_DA_CJ"
}
```

O endpoint não grava no Supabase. Ele retorna:

- `raw`: resposta bruta da API da CJ;
- `normalized`: contrato `Product` do Imbalável;
- `diagnostics.warnings`: campos ausentes ou inconsistentes detectados;
- `diagnostics.counts`: quantidade de imagens, variações e especificações.

A interface de diagnóstico fica em `/admin/fornecedores/cjdropshipping/teste`.

## Preço

`ProductVariant.supplierCost` representa somente o custo informado pelo fornecedor. O preço de venda é calculado no repositório usando o markup do produto (50% por padrão), com possibilidade de override por variação.

## Próximos providers

O provider CJ já está conectado ao contrato. O diretório `src/services/products/providers/aliexpress/` permanece reservado para a integração DSers/AliExpress quando as credenciais e a aprovação da aplicação estiverem disponíveis.
