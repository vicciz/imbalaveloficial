import { Produto } from "@/src/services/produtos";

type Props = {
  produto: Produto;
};

export default function ProductSpecification({
  produto,
}: Props) {
  const especificacoes = [
    {
      titulo: "Características gerais",
      itens: [
        { nome: "Marca", valor: "IMBALÁVEL" },
        { nome: "Modelo", valor: produto.nome },
        { nome: "Cor", valor: "Verde" },
        { nome: "Voltagem", valor: "220V" },
      ],
    },
    {
      titulo: "Potência",
      itens: [
        { nome: "Potência", valor: "60W" },
        { nome: "Velocidades", valor: "3" },
        { nome: "Alimentação", valor: "Bivolt" },
        { nome: "Consumo", valor: "0,06 kWh" },
      ],
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