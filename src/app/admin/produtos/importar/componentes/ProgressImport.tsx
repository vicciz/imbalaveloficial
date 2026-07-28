interface Props {

  loading: boolean;

  progresso: number;

  produtoAtual: string;

  totalProdutos: number;

}

export default function ProgressImport({

  loading,

  progresso,

  produtoAtual,

  totalProdutos,

}: Props) {

  if (!loading) {

    return null;

  }

  return (

    <div
      className="
        mt-6
        rounded-2xl
        border
        bg-white
        p-6
      "
    >

      <div
        className="
          mb-4
          flex
          items-center
          justify-between
        "
      >

        <div>

          <h3
            className="
              font-semibold
            "
          >

            Importando catálogo...

          </h3>

          <p
            className="
              text-sm
              text-zinc-500
            "
          >

            Aguarde enquanto os produtos são processados.

          </p>

        </div>

        <span
          className="
            text-lg
            font-bold
            text-violet-600
          "
        >

          {progresso}%

        </span>

      </div>

      <div
        className="
          h-3
          overflow-hidden
          rounded-full
          bg-zinc-200
        "
      >

        <div
          className="
            h-full
            rounded-full
            bg-violet-600
            transition-all
            duration-300
          "
          style={{
            width:
              `${progresso}%`,
          }}
        />

      </div>

      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          text-sm
        "
      >

        <span
          className="
            truncate
            text-zinc-600
          "
        >

          {produtoAtual}

        </span>

        <span
          className="
            font-medium
            text-zinc-500
          "
        >

          {progresso > 0
            ? `${Math.round(
                (progresso * totalProdutos) /
                100
              )}/${totalProdutos}`
            : `0/${totalProdutos}`}

        </span>

      </div>

    </div>

  );

}