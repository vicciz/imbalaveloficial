import Image from "next/image";
import { Produto } from "@/src/components/produto/types/produtos";

type Props = {
  produto: Produto;
  horizontal?: boolean;
};

export default function ProductCardImage({
  produto,
  horizontal = false,
}: Props) {
  return (
    <div
      className={`
        flex
        items-center
        justify-center
        overflow-hidden
        bg-white
        ${
          horizontal
            ? "h-36 w-36 shrink-0 rounded-lg p-3"
            : "aspect-square w-full p-4"
        }
      `}
    >
      <Image
        src={produto.image || "/placeholder.png"}
        alt={produto.nome}
        width={250}
        height={250}
        className="h-full w-full object-contain"
      />
    </div>
  );
}