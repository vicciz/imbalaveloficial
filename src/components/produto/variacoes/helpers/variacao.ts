import { supabase } from "@/supabaseClient";

export function obterAtributo(
  variacao: any,
  nome: string
) {
  return (
    variacao?.produto_variacao_item
      ?.find(
        (item: any) =>
          item.variacao_valor?.variacao_tipo?.nome
            ?.trim()
            .toLowerCase() ===
          nome.trim().toLowerCase()
      )
      ?.variacao_valor?.valor ?? ""
  );
}

export function obterAtributos(
  variacao: any
) {
  return (
    variacao?.produto_variacao_item
      ?.map((item: any) => ({
        tipo:
          item.variacao_valor?.variacao_tipo?.nome ?? "",
        valor:
          item.variacao_valor?.valor ?? "",
      }))
      .filter(
        (item: any) => item.valor
      ) ?? []
  );
}

export function obterDescricaoVariacao(
  produtoNome: string,
  variacao: any
) {
  const atributos =
    obterAtributos(variacao);

  return atributos.length
    ? `${produtoNome} • ${atributos
        .map((a) => a.valor)
        .join(" • ")}`
    : produtoNome;
}

export function obterImagemVariacao(
  produto: any,
  variacao: any
) {
  if (!produto?.produto_imagem)
    return "";

  const itemCor =
    variacao?.produto_variacao_item?.find(
      (item: any) =>
        item.variacao_valor?.variacao_tipo?.nome
          ?.toLowerCase() === "cor"
    );

  let principal;

  if (itemCor?.id_valor != null) {
    const imagens =
      produto.produto_imagem.filter(
        (img: any) =>
          img.id_valor === itemCor.id_valor
      );

    principal =
      imagens.find(
        (img: any) => img.principal
      ) ??
      imagens.sort(
        (a: any, b: any) =>
          a.ordem - b.ordem
      )[0];
  }

  principal =
    principal ??
    produto.produto_imagem.find(
      (img: any) => img.principal
    ) ??
    produto.produto_imagem[0];

  if (!principal) return "";

  return supabase.storage
    .from("produtos")
    .getPublicUrl(principal.caminho)
    .data.publicUrl;
}