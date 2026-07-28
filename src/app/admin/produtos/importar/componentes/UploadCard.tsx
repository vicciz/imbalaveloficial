interface Props {

  arquivo: File | null;

  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;

}

export default function UploadCard({

  arquivo,

  onChange,

}: Props) {

  return (

    <>

      <label
        className="
          flex
          h-56
          cursor-pointer
          flex-col
          items-center
          justify-center
          rounded-2xl
          border-2
          border-dashed
          border-zinc-300
          transition
          hover:border-violet-500
        "
      >

        <input
          type="file"
          accept=".xlsx,.xls,.zip"
          onChange={onChange}
        />

        <span
          className="
            text-lg
            font-semibold
          "
        >

          Arraste ou selecione um arquivo

        </span>

        <span
          className="
            mt-2
            text-sm
            text-zinc-500
          "
        >

          produtos.xlsx ou catalogo.zip

        </span>

      </label>

      {

        arquivo && (

          <div
            className="
              mt-6
              rounded-xl
              bg-zinc-100
              p-4
            "
          >

            <p>

              Arquivo:

              <strong>

                {" "}

                {arquivo.name}

              </strong>

            </p>

          </div>

        )

      }

    </>

  );

}