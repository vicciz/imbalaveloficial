import { Produto } from "@/src/services/produto/produtos";
import ProductCard from "./ProductCard";

type Props = {
  titulo: string;
  produtos: Produto[];
  layout?: "grid" | "list";
};

export default function ProductList({
  titulo,
  produtos,
  layout = "grid",
}: Props) {
  return (
    <section className="mt-20">

      <h2 className="mb-8 text-4xl font-semibold text-slate-800">
        {titulo}
      </h2>

      {layout === "grid" ? (
        <div className="grid grid-cols-4 gap-6">
          {produtos.map((produto) => (
            <ProductCard
              key={produto.id}
              produto={produto}
              layout="vertical"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {produtos.map((produto) => (
            <ProductCard
              key={produto.id}
              produto={produto}
              layout="horizontal"
            />
          ))}
        </div>
      )}

    </section>
  );
}
