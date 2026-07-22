"use client";

import ListProductCard from "./ListProductCard";

type Props = {
  titulo: string;
  quantidade?: number;
};

export default function HomeCategorySection({
  titulo,
  quantidade = 6,
}: Props) {
  return (
    <section
      className="
        rounded-xl
        bg-white
        p-5
        shadow-sm
      "
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900">
          {titulo}
        </h2>
      </div>

      <ListProductCard quantidade={quantidade} />
    </section>
  );
}