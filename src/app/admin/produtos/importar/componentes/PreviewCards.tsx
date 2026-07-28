interface Props {

  preview: any[];

}

export default function PreviewCards({

  preview,

}: Props) {

  const total =
    preview.length;

  return (

    <div
      className="
        border-b
        bg-zinc-50
        p-6
      "
    >

      <h2
        className="
          text-lg
          font-semibold
        "
      >

        Pré-visualização da importação

      </h2>

      <p
        className="
          mt-1
          text-sm
          text-zinc-500
        "
      >

        Confira os produtos encontrados na planilha.

      </p>

      <div
        className="
          mt-6
          grid
          gap-4
          md:grid-cols-2
        "
      >

        <div
          className="
            rounded-xl
            border
            bg-white
            p-5
          "
        >

          <p
            className="
              text-sm
              text-zinc-500
            "
          >

            Produtos encontrados

          </p>

          <h3
            className="
              mt-2
              text-3xl
              font-bold
            "
          >

            {total}

          </h3>

        </div>

        <div
          className="
            rounded-xl
            border
            bg-white
            p-5
          "
        >

          <p
            className="
              text-sm
              text-zinc-500
            "
          >

            Tipo de arquivo

          </p>

          <h3
            className="
              mt-2
              text-lg
              font-semibold
            "
          >

            Planilha Excel

          </h3>

        </div>

      </div>

    </div>

  );

}