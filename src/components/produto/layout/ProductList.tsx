import { Produto } from "@/src/components/produto/types/produtos";
import ProductCard from "../../layout/Home/ListCardProduto/ProductCard";

type Props = {
  titulo: string;
  produtos: Produto[];
  layout?: "grid" | "list";
  categoria?: string;
  quantidade?: number;
};

export default function ProductList({
  titulo,
  produtos,
  layout = "grid",
  categoria,
  quantidade,
}: Props) {

  const produtosFiltrados = categoria
    ? produtos.filter(
        (produto) =>
          produto.categoria?.toLowerCase() === categoria.toLowerCase()
      )
    : produtos;


  const produtosExibidos = quantidade
    ? produtosFiltrados.slice(0, quantidade)
    : produtosFiltrados;


  return (
    <section className="mt-20">

      <h2 className="mb-8 text-4xl font-semibold text-slate-800">
        {titulo}
      </h2>

      <div className="grid grid-cols-4 gap-6">

        {produtosExibidos.map((produto) => (
          <ProductCard
            key={produto.id}
            produto={produto}
            layout="vertical"
          />
        ))}

      </div>

    </section>
  );
}