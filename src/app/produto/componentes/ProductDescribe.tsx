import { IMAGES } from "@/src/constants/imagens";
import { Produto } from "@/src/services/produtos";
import Image from "next/image";

type Props = {
  produto: Produto;
};

export default function ProductDescribe({ produto }: Props) {
  const textoDescricao = produto.detalhes || produto.descricao || "";

  return (
    <section className="mt-20">
   <div className="grid grid-cols-2 gap-y-16 gap-x-12">

  {/* Título e texto 1 */}
  <div className="col-span-2 text-center">
    <h2 className="text-4xl font-bold">
      {produto.nome}
    </h2>

    <p className="mt-3 max-w-lg mx-auto text-gray-600">
      {textoDescricao}
    </p>
  </div>

  {/* Imagem */}
  <div className="flex justify-start">
    <Image
      src={IMAGES.placeholder}
      alt=""
      width={220}
      height={220}
    />
  </div>

  {/* Segunda descrição */}
  <div className="flex flex-col justify-center text-right">
    <h2 className="text-4xl font-bold">
      {produto.nome}
    </h2>

    <p className="mt-3 text-gray-600">
      {textoDescricao}
    </p>
  </div>

  {/* Botão */}
  <div className="col-span-2 flex justify-end">
    <button className="rounded-lg bg-violet-600 px-8 py-3 text-white">
      Comprar Agora
    </button>
  </div>

</div>
    </section>
  );
}