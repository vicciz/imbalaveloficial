import { Produto } from "@/src/components/produto/types/produtos";

type Props = {
  produto: Produto;
};

export default function ProductCardInfo({
  produto,
}: Props) {
  const preco =
    produto.produto_variacao
      ?.flatMap((v) => v.produto_variacao_item ?? [])
      ?.find((i) => i.ativo)?.preco ?? 0;

  return (
    <div
      className="
        flex
        flex-1
        flex-col
        justify-between
        p-4
      "
    >
      <div>
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-800">
          {produto.nome}
        </h3>

        {produto.descricao && (
          <p className="mt-2 line-clamp-2 text-xs text-slate-500">
            {produto.descricao}
          </p>
        )}
      </div>

      <div className="mt-4">
        <div className="space-y-1">
          <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">
            A partir de
          </span>

          <span className="block text-xl font-bold text-slate-900">
            {Number(preco).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>

        <span className="mt-1 block text-xs font-medium text-green-600">
          Frete grátis
        </span>
      </div>
    </div>
  );
}