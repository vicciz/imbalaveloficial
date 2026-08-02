import type { CjProdutoNormalizado } from "./types";

function tentarJson(valor?: string) {
  if (!valor) return [];

  try {
    const json = JSON.parse(valor);
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

function mapearOpcoes(variant: any) {
  const propriedades = tentarJson(
    variant.variantProperty
  );

  if (propriedades.length > 0) {
    return propriedades.map((item: any) => ({
      tipo:
        item.key ??
        item.name ??
        "Modelo",

      valor:
        item.value ??
        item.option ??
        "",
    }));
  }

  return [
    {
      tipo: "Modelo",
      valor:
        variant.variantKey ??
        "Padrão",
    },
  ];
}

function criarEspecificacoes(
  produto: any,
  material: string[],
  embalagem: string[],
  propriedades: string[]
) {
  const especificacoes: {
    grupo: string;
    nome: string;
    valor: string;
    ordem: number;
  }[] = [];

  let ordem = 0;

  function adicionar(
    grupo: string,
    nome: string,
    valor?: string | number | null
  ) {
    if (
      valor === undefined ||
      valor === null ||
      valor === ""
    ) {
      return;
    }

    especificacoes.push({
      grupo,
      nome,
      valor: String(valor),
      ordem: ordem++,
    });
  }

  adicionar(
    "Categoria",
    "Categoria CJ",
    produto.categoryName
  );

  adicionar(
    "Logística",
    "HS Code",
    produto.entryCode
  );

  adicionar(
    "Logística",
    "Descrição Aduaneira",
    produto.entryNameEn
  );

  adicionar(
    "Dimensões",
    "Peso",
    produto.productWeight
  );

  adicionar(
    "Dimensões",
    "Peso Embalado",
    produto.packingWeight
  );

  for (const item of material) {
    adicionar(
      "Material",
      "Material",
      item
    );
  }

  for (const item of embalagem) {
    adicionar(
      "Embalagem",
      "Tipo",
      item
    );
  }

  for (const item of propriedades) {
    adicionar(
      "Produto",
      "Tipo",
      item
    );
  }

  adicionar(
    "Produto",
    "Preço sugerido",
    produto.suggestSellPrice
  );

  adicionar(
    "Produto",
    "Criado em",
    produto.createrTime
  );

  return especificacoes;
}

export function mapearProdutoCJ(
  produto: any
): CjProdutoNormalizado {

  const imagens: string[] =
    produto.productImageSet ??
    tentarJson(produto.productImage);

  const material: string[] =
    produto.materialNameEnSet ??
    tentarJson(produto.materialNameEn);

  const embalagem: string[] =
    produto.packingNameEnSet ??
    tentarJson(produto.packingNameEn);

  const propriedades: string[] =
    produto.productProEnSet ??
    tentarJson(produto.productProEn);

  return {
    idExterno: produto.pid,

    nome:
      produto.productNameEn ??
      produto.productName,

    descricao:
      produto.description ?? "",

    link: "",

    rating: 0,

    reviews:
      produto.listedNum ?? 0,

    marca:
      produto.brandName ??
      "Sem marca",

    fornecedor:
      produto.supplierName ??
      "CJ Dropshipping",

    categoria:
      produto.categoryName ??
      "Sem categoria",

    imagens: imagens.map(
      (img, index) => ({
        caminho: img,
        ordem: index,
        principal: index === 0,
      })
    ),

    variacoes:
      (produto.variants ?? []).map(
        (variant: any) => ({
          sku:
            variant.variantSku,

          fornecedorSku:
            variant.vid,

          preco: Number(
            variant.variantSellPrice ?? 0
          ),

          estoque: Number(
            variant.inventoryNum ?? 0
          ),

          ativo: true,

          imagemPrincipal:
            variant.variantImage,

          opcoes:
            mapearOpcoes(variant),
        })
      ),

    especificacoes:
      criarEspecificacoes(
        produto,
        material,
        embalagem,
        propriedades
      ),
  };
}