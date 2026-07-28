import JSZip from "jszip";

export interface ArquivoZip {

  excel: File;

  imagens: Map<
    string,
    Blob
  >;

}

export async function lerZip(
  arquivo: File
): Promise<ArquivoZip> {

  const zip =
    await JSZip.loadAsync(
      arquivo
    );

  let excel:
    | File
    | null = null;

  const imagens =
    new Map<
      string,
      Blob
    >();

  for (const nome in zip.files) {

    const file =
      zip.files[nome];

    if (file.dir) {
      continue;
    }

    const arquivoNome =
      nome.split("/").pop() ??
      "";

    if (
      arquivoNome.endsWith(
        ".xlsx"
      )
    ) {

      const blob =
        await file.async(
          "blob"
        );

      excel =
        new File(
          [blob],
          arquivoNome,
          {
            type:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }
        );

      continue;

    }

    const extensao =
      arquivoNome
        .split(".")
        .pop()
        ?.toLowerCase();

    if (
      [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ].includes(
        extensao ?? ""
      )
    ) {
      console.log(
        "Imagem encontrada:",
        arquivoNome
      );
      imagens.set(

        arquivoNome,

        await file.async(
          "blob"
        )

      );
      console.log(
        "Total:",
        imagens.size
      );
    }

  }

  if (!excel) {

    throw new Error(
      "Nenhuma planilha .xlsx encontrada."
    );

  }

  return {

    excel,

    imagens,

  };

}