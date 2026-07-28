interface Props {

  preview: any[];

}

export default function PreviewTable({

  preview,

}: Props) {

  return (

    <div className="overflow-x-auto">

      <table
        className="
          w-full
          text-sm
        "
      >

        <thead>

          <tr className="border-b bg-zinc-50">

            <th className="px-5 py-4 text-left">
              Código
            </th>

            <th className="px-5 py-4 text-left">
              Produto
            </th>

            <th className="p-3 text-left">
              Descrição
            </th>

            <th className="px-5 py-4 text-left">
              Categoria
            </th>

            <th className="px-5 py-4 text-left">
              Marca
            </th>

            <th className="px-5 py-4 text-right">
              Preço
            </th>

          </tr>

        </thead>

        <tbody>

          {

            preview.map(

              (
                produto,
                index
              ) => (

                <tr
                  key={
                    produto.codigo ??
                    index
                  }
                  className="
                    border-b
                    transition
                    hover:bg-zinc-50
                  "
                >

                  <td className="px-5 py-4">

                    {produto.codigo}

                  </td>

                  <td className="px-5 py-4 font-medium">

                    {produto.nome}

                  </td>

                  <td className="px-5 py-4">

                    {produto.categoria}

                  </td>

                  <td className="p-3 max-w-sm">

                    <p className="truncate">

                      {produto.descricao}

                    </p>

                 </td>

                  <td className="px-5 py-4">

                    {produto.marca}

                  </td>

                  <td
                    className="
                      px-5 py-4
                      text-right
                    "
                  >

                    {Number(
                      produto.preco
                    ).toLocaleString(
                      "pt-BR",
                      {
                        style:
                          "currency",
                        currency:
                          "BRL",
                      }
                    )}

                  </td>

                </tr>

              )

            )

          }

        </tbody>

      </table>

    </div>

  );

}