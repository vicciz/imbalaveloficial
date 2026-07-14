import Image from "next/image";
import { Produto } from "@/src/services/produtos";

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
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        horizontal
          ? "flex gap-4 p-4"
          : "flex flex-col p-4"
      }`}
    >
      {/* Imagem */}
      <div
        className={
          horizontal
            ? "flex h-32 w-32 shrink-0 items-center justify-center"
            : "mb-4 flex h-60 items-center justify-center"
        }
      >
        <Image
          src={produto.image || "/placeholder.png"}
          alt={produto.nome}
          width={250}
          height={250}
          className="max-h-full w-full object-contain"
        />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col">

        <h3 className="line-clamp-2 text-lg font-medium text-slate-800">
          {produto.nome}
        </h3>

        {produto.descricao && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
            {produto.descricao}
          </p>
        )}

        <div className="mt-4">
          <span className="text-3xl font-bold text-slate-900">
            {Number(produto.preco).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>

          <p className="mt-1 text-sm text-green-600">
            Frete grátis
          </p>
        </div>

      </div>
    </article>
  );
}