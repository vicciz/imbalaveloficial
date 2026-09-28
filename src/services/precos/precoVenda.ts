type PrecoBruto = number | string | null | undefined

export interface ItemComPrecoVenda {
  preco?: PrecoBruto
  ativo?: boolean | null
}

export interface VariacaoComPrecoVenda {
  preco?: PrecoBruto
  produto_variacao_item?: readonly ItemComPrecoVenda[] | null
}

export interface FontesPrecoCheckout {
  itemVariacao?: ItemComPrecoVenda | null
  variacao?: VariacaoComPrecoVenda | null
  variacaoSelecionada?: ItemComPrecoVenda | null
  produto?: {
    preco?: PrecoBruto
  } | null
}

function obterPrecoNumerico(valor: PrecoBruto): number | null {
  if (valor == null || (typeof valor === "string" && !valor.trim())) {
    return null
  }

  const preco = Number(valor)

  return Number.isFinite(preco) && preco >= 0 ? preco : null
}

export function obterPrecoVendaVariacao(
  variacao: VariacaoComPrecoVenda | null | undefined
): number | null {
  const itemAtivo = variacao?.produto_variacao_item?.find(
    (item) => item.ativo !== false
  )

  return obterPrecoNumerico(itemAtivo?.preco) ?? obterPrecoNumerico(variacao?.preco)
}

export function obterMenorPrecoVenda(
  variacoes: readonly VariacaoComPrecoVenda[] | null | undefined
): number {
  const precos = (variacoes ?? [])
    .map(obterPrecoVendaVariacao)
    .filter((preco): preco is number => preco !== null)

  return precos.length ? Math.min(...precos) : 0
}

export function obterPrecoVendaCheckout({
  itemVariacao,
  variacao,
  variacaoSelecionada,
  produto,
}: FontesPrecoCheckout): number {
  return (
    obterPrecoNumerico(itemVariacao?.preco) ??
    obterPrecoNumerico(variacao?.preco) ??
    obterPrecoNumerico(variacaoSelecionada?.preco) ??
    obterPrecoNumerico(produto?.preco) ??
    0
  )
}
