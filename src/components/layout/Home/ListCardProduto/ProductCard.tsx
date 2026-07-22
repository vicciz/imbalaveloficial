import { Produto } from "@/src/components/produto/types/produtos";
import ProductCardImage from "./ProductCardImage";
import ProductCardInfo from "./ProductCardInfo";

type Props = {
  produto: Produto;
  layout?: "vertical" | "horizontal";
};

export default function ProductCard({
  produto,
  layout = "vertical",
}: Props) {
  const horizontal = layout === "horizontal";

  return (
    <article
      className={`
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        ${
          horizontal
            ? "flex gap-4 p-4"
            : "flex flex-col"
        }
      `}
    >
      <ProductCardImage
        produto={produto}
        horizontal={horizontal}
      />

      <ProductCardInfo
        produto={produto}
      />
    </article>
  );
}