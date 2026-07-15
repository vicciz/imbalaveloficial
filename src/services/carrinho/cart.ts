import { supabase } from "../../../supabaseClient";

type CarrinhoBase = {
  id: number;
  id_user: string;
  id_produto: number;
  id_variacao: number | null;
  quantidade: number;
};

type RemoverCarrinhoArgs = {
  userId: string;
  productId: number;
  idVariacao?: number | null;
};

function normalizarQuantidade(qtd: number) {
  return Math.max(1, Math.min(Number(qtd) || 1, 30));
}

export async function adicionarAoCarrinho(
  productId: number,
  userId: string,
  qtd: number,
  idVariacao: number | null = null
) {
  const quantidade = normalizarQuantidade(qtd);

  const payloadBase = {
    id_user: userId,
    id_produto: productId,
    id_variacao: idVariacao,
    quantidade,
  };

  console.log("PAYLOAD CARRINHO", payloadBase);
  console.log("PAYLOAD CAMPOS CARRINHO", {
    id_user: payloadBase.id_user,
    id_produto: payloadBase.id_produto,
    id_variacao: payloadBase.id_variacao,
    quantidade: payloadBase.quantidade,
  });

  let query = supabase
    .from("carrinho")
    .select("id, quantidade")
    .eq("id_user", userId)
    .eq("id_produto", productId);

  if (idVariacao != null) {
    query = query.eq("id_variacao", idVariacao);
  } else {
    query = query.is("id_variacao", null);
  }

  const {
    data: existente,
    error: erroBuscaExistente,
  } = await query.maybeSingle();

  console.log("RESULTADO BUSCA ITEM EXISTENTE", existente);

  if (erroBuscaExistente) {
    console.error("ERRO BUSCA ITEM EXISTENTE", erroBuscaExistente);
    throw erroBuscaExistente;
  }

  if (existente) {
    const novaQuantidade = normalizarQuantidade(
      Number(existente.quantidade) + quantidade
    );

    const updatePayload = {
      quantidade: novaQuantidade,
    };

    console.log("UPDATE CARRINHO", {
      id: existente.id,
      ...updatePayload,
    });

    const { data: dataUpdate, error: erroUpdate } = await supabase
      .from("carrinho")
      .update(updatePayload)
      .eq("id", existente.id)
      .select("id, id_user, id_produto, id_variacao, quantidade")
      .maybeSingle();

    console.log("RESULTADO UPDATE CARRINHO", dataUpdate);

    if (erroUpdate) {
      console.error("ERRO UPDATE CARRINHO", erroUpdate);
      throw erroUpdate;
    }

    if (!dataUpdate) {
      const erroSemRetorno = new Error(
        "UPDATE do carrinho não retornou dados. Verifique RLS/permissões."
      );
      console.error("ERRO UPDATE CARRINHO", erroSemRetorno);
      throw erroSemRetorno;
    }

    return dataUpdate;
  }

  console.log("INSERT CARRINHO", payloadBase);

  const { data: dataInsert, error: erroInsert } = await supabase
    .from("carrinho")
    .insert(payloadBase)
    .select("id, id_user, id_produto, id_variacao, quantidade")
    .maybeSingle();

  console.log("RESULTADO INSERT CARRINHO", dataInsert);

  if (erroInsert) {
    console.error("ERRO INSERT CARRINHO", erroInsert);
    throw erroInsert;
  }

  if (!dataInsert) {
    const erroSemRetorno = new Error(
      "INSERT do carrinho não retornou dados. Verifique RLS/permissões."
    );
    console.error("ERRO INSERT CARRINHO", erroSemRetorno);
    throw erroSemRetorno;
  }

  return dataInsert;
}


//buscar cart
export async function buscarCarrinho(
  userId: string
) {
  const selectCarrinhoComProduto = `
      *,
      produto (
        *,
        produto_imagem (
          id,
          id_produto,
          id_variacao,
          id_valor,
          caminho,
          ordem,
          principal
        )
      )
    `;

  console.log("QUERY BUSCAR CARRINHO #1", {
    from: "carrinho",
    filtro: { id_user: userId },
    select: selectCarrinhoComProduto,
  });

  const { data: itensBase, error: erroBase } = await supabase
    .from("carrinho")
    .select(selectCarrinhoComProduto)
    .eq("id_user", userId);

  console.log("RESULTADO BUSCAR CARRINHO #1", itensBase);

  if (erroBase) {
    console.error("ERRO BUSCAR CARRINHO #1", erroBase);
  }

  if (erroBase || !itensBase) {
    return {
      data: null,
      error: erroBase,
    };
  }

  const idsVariacao = Array.from(
    new Set(
      itensBase
        .map((item: any) => item.id_variacao)
        .filter((id): id is number => id != null)
    )
  );

  if (!idsVariacao.length) {
    return { data: itensBase, error: null };
  }

  const selectVariacoes = `
      id,
      sku,
      preco,
      estoque,
      produto_variacao_item (
        id_valor,
        variacao_valor (
          valor,
          variacao_tipo (
            nome
          )
        )
      )
    `;

  console.log("QUERY BUSCAR CARRINHO #2", {
    from: "produto_variacao",
    filtro: { ids: idsVariacao },
    select: selectVariacoes,
  });

  const { data: variacoes, error: erroVariacoes } = await supabase
    .from("produto_variacao")
    .select(selectVariacoes)
    .in("id", idsVariacao);

  console.log("RESULTADO BUSCAR CARRINHO #2", variacoes);

  if (erroVariacoes) {
    console.error("ERRO BUSCAR CARRINHO #2", erroVariacoes);
  }

  if (erroVariacoes) {
    return {
      data: null,
      error: erroVariacoes,
    };
  }

  const variacoesPorId = new Map(
    (variacoes ?? []).map((v: any) => [v.id, v])
  );

  const itensComVariacao = itensBase.map((item: any) => ({
    ...item,
    variacao:
      item.id_variacao != null
        ? variacoesPorId.get(item.id_variacao) ?? null
        : null,
  }));

  return {
    data: itensComVariacao,
    error: null,
  };
}

export async function removerDoCarrinho(
  idOrArgs: number | RemoverCarrinhoArgs
) {
  let query = supabase.from("carrinho").delete();

  if (typeof idOrArgs === "number") {
    query = query.eq("id", idOrArgs);
  } else {
    query = query
      .eq("id_user", idOrArgs.userId)
      .eq("id_produto", idOrArgs.productId);

    if (idOrArgs.idVariacao != null) {
      query = query.eq("id_variacao", idOrArgs.idVariacao);
    } else {
      query = query.is("id_variacao", null);
    }
  }

  const { error } = await query;

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}

export function calcularTotal(itens: any[]) {
  return itens.reduce(
    (acc, item) =>
      acc +
      Number(item.variacao?.preco ?? item.produto.preco) *
        Number(item.quantidade),
    0
  );
}

export async function buscarItemCarrinhoPorCombinacao(
  userId: string,
  productId: number,
  idVariacao: number | null
) {
  let query = supabase
    .from("carrinho")
    .select("*")
    .eq("id_user", userId)
    .eq("id_produto", productId);

  if (idVariacao != null) {
    query = query.eq("id_variacao", idVariacao);
  } else {
    query = query.is("id_variacao", null);
  }

  return await query.maybeSingle();
}

export async function limparCarrinho(userId: string) {
  const { error } = await supabase
    .from("carrinho")
    .delete()
    .eq("id_user", userId);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}

export async function atualizarQuantidadeCarrinho(
  id: number,
  quantidade: number
) {
  const quantidadeNormalizada = normalizarQuantidade(quantidade);

  const { data, error } = await supabase
    .from("carrinho")
    .update({
      quantidade: quantidadeNormalizada,
    })
    .eq("id", id)
    .select("id, quantidade")
    .maybeSingle();

  if (error) {
    console.error(error);
    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}
