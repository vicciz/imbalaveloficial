"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
  listarProdutos,
  type Produto,
} from "@/src/services/produto/produtos";

type Props = {
  value: Produto[];
  onChange(produtos: Produto[]): void;
};

export default function ProdutosSelector({
  value,
  onChange,
}: Props) {

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {

    async function carregar() {

      const { data } = await listarProdutos();

      setProdutos(data ?? []);

    }

    carregar();

  }, []);

  const resultados = useMemo(() => {

    const texto = busca.toLowerCase();

    return produtos.filter((produto) => {

      const jaExiste = value.some(
        p => p.id === produto.id
      );

      return (
        !jaExiste &&
        produto.nome.toLowerCase().includes(texto)
      );

    });

  }, [busca, produtos, value]);

  function adicionar(produto: Produto) {

    onChange([
      ...value,
      produto,
    ]);

  }

  function remover(id: number) {

    onChange(

      value.filter(

        produto => produto.id !== id

      )

    );

  }

  return (

    <div className="space-y-6">

      <div>

        <label className="mb-2 block font-medium">

          Pesquisar Produto

        </label>

        <input
          value={busca}
          onChange={(e) =>
            setBusca(e.target.value)
          }
          placeholder="Pesquisar..."
          className="w-full rounded-lg border p-3"
        />

      </div>

      {/* RESULTADOS */}

      <div className="rounded-xl border">

        <div className="border-b bg-slate-50 p-3 font-semibold">

          Resultados

        </div>

        <div className="max-h-80 overflow-y-auto">

          {resultados.map((produto) => (

            <div
              key={produto.id}
              className="
                flex
                items-center
                gap-4
                border-b
                p-3
              "
            >

              <Image
                src={
                  produto.image ||
                  "/placeholder.png"
                }
                alt={produto.nome}
                width={60}
                height={60}
                className="rounded object-contain"
              />

              <div className="flex-1">

                <h4 className="font-medium">

                  {produto.nome}

                </h4>

                <p className="text-sm text-zinc-500">

                  {Number(produto.preco).toLocaleString(

                    "pt-BR",

                    {

                      style: "currency",

                      currency: "BRL",

                    }

                  )}

                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  adicionar(produto)
                }
                className="
                  rounded-lg
                  bg-violet-600
                  px-4
                  py-2
                  text-white
                "
              >

                Adicionar

              </button>

            </div>

          ))}

        </div>

      </div>

      {/* SELECIONADOS */}

      <div className="rounded-xl border">

        <div className="border-b bg-slate-50 p-3 font-semibold">

          Produtos da Vitrine

        </div>

        {value.length === 0 && (

          <div className="p-6 text-center text-zinc-500">

            Nenhum produto selecionado.

          </div>

        )}

        {value.map((produto) => (

          <div
            key={produto.id}
            className="
              flex
              items-center
              gap-4
              border-b
              p-3
            "
          >

            <Image
              src={
                produto.image ||
                "/placeholder.png"
              }
              alt={produto.nome}
              width={60}
              height={60}
              className="rounded object-contain"
            />

            <div className="flex-1">

              <h4 className="font-medium">

                {produto.nome}

              </h4>

              <p className="text-sm text-zinc-500">

                {Number(produto.preco).toLocaleString(

                  "pt-BR",

                  {

                    style: "currency",

                    currency: "BRL",

                  }

                )}

              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                remover(produto.id)
              }
              className="
                rounded-lg
                bg-red-500
                px-4
                py-2
                text-white
              "
            >

              Remover

            </button>

          </div>

        ))}

      </div>

    </div>

  );

}