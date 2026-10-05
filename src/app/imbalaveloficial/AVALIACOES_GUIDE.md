# 🎯 Sistema de Avaliações - Guia de Implementação

## ✅ Implementação Concluída

O sistema de avaliações de produtos foi implementado completamente com Supabase.

### 📁 Arquivos Criados/Modificados

1. **`services/produtoAvaliacoes.ts`** (novo)
   - Service com funções CRUD
   - Cálculo de estatísticas
   - Normalização de erros

2. **`hooks/useAvaliacoes.ts`** (novo)
   - Hook customizado para gerenciar avaliações
   - Carrega avaliações e validações
   - Integração com o banco automaticamente

3. **`src/app/produto/componentes/produto/ProductRviews.tsx`** (modificado)
   - Integrado com o hook
   - Formulário com validações
   - Lista de avaliações com dados do usuário
   - Edição e deleção de avaliações

4. **`SETUP_AVALIACOES.sql`** (novo)
   - Script SQL completo para criar tabela
   - Índices para performance
   - Políticas RLS para segurança

### 🚀 Próximas Etapas - IMPORTANTE

#### 1. Criar a Tabela no Supabase

Acesse o **SQL Editor** do seu projeto Supabase e execute o arquivo `SETUP_AVALIACOES.sql`:

```bash
# Opção 1: Copiar e colar o arquivo manualmente
# Abra https://app.supabase.com > seu-projeto > SQL Editor
# Cole o conteúdo de SETUP_AVALIACOES.sql
# Clique em "Run"

# Opção 2: Usar CLI (se disponível)
# supabase db push
```

#### 2. Testar o Sistema

```bash
npm run dev
# Acesse qualquer página de produto
# Faça login
# Tente avaliar um produto
```

### 🔍 Checklist de Funcionamento

Após criar a tabela, verifique:

- [ ] Consegue selecionar estrelas
- [ ] Consegue escrever comentário
- [ ] Botão "Enviar avaliação" funciona
- [ ] Avaliação aparece na lista
- [ ] Pode editar sua própria avaliação
- [ ] Pode deletar sua própria avaliação
- [ ] Rating/reviews do produto atualizam
- [ ] Não permite avaliar 2x o mesmo produto
- [ ] Mensagens de sucesso/erro aparecem

### 📊 Dados Salvos

Quando uma avaliação é criada:

```json
{
  "id": 1,
  "id_produto": 123,
  "id_usuario": "uuid-do-auth",
  "nota": 5,
  "comentario": "Produto excelente!",
  "criado_em": "2026-07-15T10:30:00Z",
  "atualizado_em": "2026-07-15T10:30:00Z",
  "usuario": {
    "nome": "João Silva",
    "email": "joao@example.com"
  }
}
```

### 🔐 Segurança

- Apenas usuários autenticados podem avaliar
- Cada usuário pode ter apenas 1 avaliação por produto
- Apenas o proprietário pode editar/deletar sua avaliação
- RLS garante que ninguém acessa dados alheios

### 📝 API Reference

#### Service (`services/produtoAvaliacoes.ts`)

```typescript
// Listar avaliações de um produto
const { data, error } = await listarAvaliacoesProduto(productId);

// Buscar avaliação do usuário
const { data, error } = await buscarAvaliacaoUsuario(productId, userId);

// Criar avaliação
const { data, error } = await cadastrarAvaliacao({
  id_produto: 123,
  id_usuario: "uuid",
  nota: 5,
  comentario: "Ótimo!"
});

// Atualizar avaliação
const { data, error } = await atualizarAvaliacao(avaliacaoId, {
  nota: 4,
  comentario: "Texto atualizado"
});

// Deletar avaliação
const { error } = await excluirAvaliacao(avaliacaoId);

// Calcular estatísticas
const { rating, reviews } = await calcularEstatisticasAvaliacoes(productId);
```

#### Hook (`hooks/useAvaliacoes.ts`)

```typescript
const {
  avaliacoes,           // Array de avaliações
  avaliacaoUsuario,     // Avaliação do usuário logado (ou null)
  loading,              // Carregando?
  error,                // Mensagem de erro
  sucesso,              // Mensagem de sucesso
  submitting,           // Enviando?
  
  // Funções
  enviarAvaliacao,      // Enviar/atualizar avaliação
  deletarAvaliacao,     // Deletar avaliação
  recarregarAvaliacoes, // Recarregar lista
  limparMensagens,      // Limpar mensagens
} = useAvaliacoes(productId);
```

### 🎨 Layout Preservado

✅ Nenhuma alteração visual
✅ CSS/Tailwind mantido intacto
✅ Componentes estruturais preservados
✅ Grid e espaçamentos iguais

### 📱 Responsividade

O componente mantém a responsividade original:
- Mobile: Stack vertical
- Tablet/Desktop: Layout grid original

### 🐛 Troubleshooting

**Erro: "Supabase client not initialized"**
- Verifique variáveis de ambiente em `.env.local`
- Confirme se `supabaseClient.js` existe

**Erro: "Usuário precisa estar logado"**
- Redirecionador para login está funcionando
- Clique no link "logado" no formulário

**Avaliações não aparecem**
- Verifique se a tabela foi criada: `SELECT * FROM produto_avaliacao;`
- Confirme RLS nas políticas

**Rating não atualiza**
- Verifique se `editarProduto()` está funcionando
- Console mostra erros?

### 📞 Suporte

Caso tenha problemas:

1. Verifique Console do Navegador (F12)
2. Verifique Network tab para erros Supabase
3. Confirme se tabela existe no Supabase
4. Verifique RLS policies

---

**Status**: ✅ Pronto para usar

**Próximo**: Execute `SETUP_AVALIACOES.sql` no Supabase
