import { Produto } from "@/src/services/produtos";

type Props = {
  produto: Produto;
};

export default function ProductSpecification({
  produto,
}: Props) {
  const especificacoes = [
    {
      titulo: "Informações do Produto",
      itens: [
        { nome: "Nome", valor: produto.nome },
        ...(produto.fornecedor ? [{ nome: "Fornecedor", valor: produto.fornecedor }] : []),
        ...(produto.preco ? [{ nome: "Preço", valor: `R$ ${Number(produto.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }] : []),
        ...(produto.estoque !== undefined && produto.estoque !== null ? [{ nome: "Estoque", valor: `${produto.estoque} unidades` }] : []),
      ].filter(item => item.valor !== undefined && item.valor !== null),
    },
  ];

  return (
    <section className="mt-28 w-full">

      <h2 className="mb-10 text-4xl font-bold text-slate-900">
        Características do produto
      </h2>

      <div className="grid grid-cols-2 gap-8">

        {especificacoes.map((grupo, index) => (
          <div key={index}>

            <h3 className="mb-5 text-2xl font-semibold text-slate-800">
              {grupo.titulo}
            </h3>

            <div className="overflow-hidden rounded-2xl border border-slate-200">

              {grupo.itens.map((item, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[45%_55%] ${
                    i % 2 === 0
                      ? "bg-slate-100"
                      : "bg-white"
                  }`}
                >
                  <div className="px-6 py-5 font-medium text-slate-700">
                    {item.nome}
                  </div>

                  <div className="px-6 py-5 text-slate-600">
                    {item.valor}
                  </div>

                </div>
              ))}

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}