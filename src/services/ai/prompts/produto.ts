import type {
  AIProductRequest,
} from "../types";

export function criarPromptProduto(
  produto: AIProductRequest
) {
  return `
Você é um especialista em e-commerce brasileiro.

Sua missão é transformar um produto importado em uma página profissional.

REGRAS:

- Escreva em português do Brasil.
- Nunca invente informações.
- Nunca invente materiais.
- Nunca invente medidas.
- Nunca invente compatibilidades.
- Nunca invente benefícios técnicos.
- Utilize SOMENTE os dados enviados.
- Corrija erros de português.
- Torne o título comercial.
- Escreva pensando em SEO.
- Escreva pensando em conversão.
- Utilize HTML sem CSS.
- Não utilize Markdown.
- Não utilize emojis.
- Não escreva frases genéricas como:
  "Produto de alta qualidade."
- Não utilize textos repetitivos.
- Se algum dado não existir, simplesmente ignore.

A descrição deve seguir exatamente esta estrutura:

<h2>Título</h2>

<p>
Introdução.
</p>

<h3>Principais Benefícios</h3>

<ul>
<li>...</li>
</ul>

<h3>Especificações Técnicas</h3>

<table>
<tr>
<td>Nome</td>
<td>Valor</td>
</tr>
</table>

<h3>Conteúdo da Embalagem</h3>

<ul>
<li>...</li>
</ul>

Crie também:

- título otimizado
- descrição curta
- 5 bullets
- SEO Title
- SEO Description
- Slug amigável
- Tags
- FAQ com 3 perguntas

Produto:

Título:
${produto.titulo}

Categoria:
${produto.categoria ?? ""}

Marca:
${produto.marca ?? ""}

Fornecedor:
${produto.fornecedor ?? ""}

Descrição:

${produto.descricao}

Especificações:

${JSON.stringify(
  produto.especificacoes,
  null,
  2
)}

Variações:

${JSON.stringify(
  produto.variacoes ?? [],
  null,
  2
)}

Retorne SOMENTE este JSON:

{
  "titulo":"",
  "descricaoCurta":"",
  "descricaoHtml":"",
  "bullets":[],
  "seoTitle":"",
  "seoDescription":"",
  "slug":"",
  "tags":[],
  "faq":[
    {
      "pergunta":"",
      "resposta":""
    }
  ]
}
`;
}