import { IMAGES } from "@/src/constants/imagens";
import { Produto } from "@/src/services/produtos";
import Image from "next/image";

type Props = {
  produto: Produto;
};

export default function ProductDescribe({ produto }: Props) {
  const descricao = [
    {
      titulo: "Velocidade",
      texto:
        "Silencioso, eficiente e com múltiplas velocidades, ele proporciona excelente circulação de ar, garantindo mais conforto para sua casa ou escritório.",
    },
    {
      titulo: "Sensor de Umidade",
      texto:
        "Mantém seus ambientes sempre frescos com este ventilador de alto desempenho.",
    },
  ];

  return (
    <section className="mt-20">
   <div className="grid grid-cols-2 gap-y-16 gap-x-12">

  {/* Título e texto 1 */}
  <div className="col-span-2 text-center">
    <h2 className="text-4xl font-bold">
      Velocidade
    </h2>

    <p className="mt-3 max-w-lg mx-auto text-gray-600">
      Silencioso, eficiente e com múltiplas velocidades...
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
      Sensor de Umidade
    </h2>

    <p className="mt-3 text-gray-600">
      Mantém seus ambientes sempre frescos...
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