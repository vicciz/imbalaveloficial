"use client";
import { ImagemFormulario } from "@/src/components/Admin/common/types";
import GaleriaImagens from "../Components/galeria/GaleriaImagens";

interface Props {
  titulo: string;

  imagens: ImagemFormulario[];

  setImagens: React.Dispatch<
    React.SetStateAction<
      ImagemFormulario[]
    >
  >;

  abrirCropper: (
    imagem: ImagemFormulario
  ) => void;

  idValor: number;
}

export default function GaleriaVariacao({
  titulo,
  imagens,
  setImagens,
  abrirCropper,
  idValor,
}: Props) {

  return (
    <GaleriaImagens
      titulo={titulo}
      imagens={imagens}
      setImagens={setImagens}
      abrirCropper={abrirCropper}
      idValor={idValor}
    />
  );

}