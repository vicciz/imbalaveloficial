"use client";

type Atributo = {
  nome: string;
  valores: string[];
};

interface Props {
  atributos: Atributo[];

  atributosSelecionados: Record<
    string,
    string
  >;

  onSelecionar: (
    tipo: string,
    valor: string
  ) => void;
}

export default function SeletorVariacoes({
  atributos,
  atributosSelecionados,
  onSelecionar,
}: Props) {
  if (!atributos.length) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">

      {atributos.map((atributo) => (

        <div key={atributo.nome}>

          <h3 className="mb-3 font-semibold text-slate-700">
            {atributo.nome}
          </h3>

          <div className="flex flex-wrap gap-2">

            {atributo.valores.map((valor) => {

              const ativo =
                atributosSelecionados[
                  atributo.nome
                ] === valor;

              return (
                <button
                  key={valor}
                  onClick={() =>
                    onSelecionar(
                      atributo.nome,
                      valor
                    )
                  }
                  className={`
                    rounded-lg
                    border
                    px-4
                    py-2
                    text-sm
                    transition

                    ${
                      ativo
                        ? "border-violet-500 bg-violet-500 text-white"
                        : "border-slate-300 hover:border-violet-400"
                    }
                  `}
                >
                  {valor}
                </button>
              );
            })}

          </div>

        </div>

      ))}

    </div>
  );
}