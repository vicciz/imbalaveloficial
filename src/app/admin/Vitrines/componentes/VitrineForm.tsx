"use client";

import { useEffect, useState } from "react";

import type { Produto } from "@/src/services/produto/produtos";
import type { VitrineSecao } from "@/src/services/vitrine/types";

import {
  inserirVitrine,
  atualizarVitrine,
} from "@/src/services/vitrine";

import { listarCategorias } from "@/src/services/categoria/categorias";
import { listarColecoes } from "@/src/services/colecao";

import { supabase } from "@/supabaseClient";

import ProdutosSelector from "./ProdutosSelector";

type Props = {
  vitrine: VitrineSecao | null;
  onSuccess(): void;
};

export default function VitrineForm({
  vitrine,
  onSuccess,
}: Props) {

  const [titulo, setTitulo] = useState(
    vitrine?.titulo ?? ""
  );

  const [tipo, setTipo] = useState<
    "categoria" | "colecao" | "produtos"
  >(
    vitrine?.tipo ?? "categoria"
  );

  const [referencia, setReferencia] = useState<string>(
    vitrine?.referencia ?? ""
  );

  const [quantidade, setQuantidade] = useState(
    vitrine?.quantidade ?? 6
  );

  const [ordem, setOrdem] = useState(
    vitrine?.ordem ?? 1
  );

  const [ativo, setAtivo] = useState(
    vitrine?.ativo ?? true
  );

  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [categorias, setCategorias] = useState<any[]>([]);
  const [colecoes, setColecoes] = useState<any[]>([]);

  useEffect(() => {

    async function carregar() {

      const { data: categoriasData } =
        await listarCategorias();

      const { data: colecoesData } =
        await listarColecoes();

      setCategorias(categoriasData ?? []);
      setColecoes(colecoesData ?? []);

    }

    carregar();

  }, []);

  async function salvar() {

    const payload = {

      titulo,

      tipo,

      referencia:
        tipo === "produtos"
          ? null
          : referencia,

      quantidade,

      ordem,

      ativo,

    };

    let secaoId: number;

    if (vitrine) {

      const { data, error } =
        await atualizarVitrine(
          vitrine.id,
          payload
        );

      if (error) {

        alert("Erro ao atualizar.");

        return;

      }

      secaoId = data.id;

    } else {

      const { data, error } =
        await inserirVitrine(payload);

      if (error) {

        alert("Erro ao criar.");

        return;

      }

      secaoId = data.id;

    }

    if (tipo === "produtos") {

      await supabase
        .from("vitrine_secao_produto")
        .delete()
        .eq("secao_id", secaoId);

      if (produtos.length) {

        await supabase
          .from("vitrine_secao_produto")
          .insert(

            produtos.map((produto, index) => ({

              secao_id: secaoId,

              produto_id: produto.id,

              ordem: index + 1,

            }))

          );

      }

    }

    onSuccess();

  }

  return (

    <section className="space-y-6">

      <h2 className="mb-6 text-2xl font-semibold">

        {vitrine

          ? "Editar Vitrine"

          : "Nova Vitrine"}

      </h2>

      <div className="space-y-5">
                {/* ===========================
            TÍTULO
        =========================== */}

        <div>

          <label className="mb-2 block font-medium">
            Título
          </label>

          <input
            className="w-full rounded-lg border p-3"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

        </div>

        {/* ===========================
            TIPO
        =========================== */}

        <div>

          <label className="mb-2 block font-medium">
            Tipo
          </label>

          <select
            className="w-full rounded-lg border p-3"
            value={tipo}
            onChange={(e) =>
              setTipo(
                e.target.value as
                  | "categoria"
                  | "colecao"
                  | "produtos"
              )
            }
          >

            <option value="categoria">
              Categoria
            </option>

            <option value="colecao">
              Coleção
            </option>

            <option value="produtos">
              Produtos Específicos
            </option>

          </select>

        </div>

        {/* ===========================
            CATEGORIA
        =========================== */}

        {tipo === "categoria" && (

          <div>

            <label className="mb-2 block font-medium">
              Categoria
            </label>

            <select
              className="w-full rounded-lg border p-3"
              value={referencia}
              onChange={(e) =>
                setReferencia(e.target.value)
              }
            >

              <option value="">
                Selecione...
              </option>

              {categorias.map((categoria) => (

                <option
                  key={categoria.id}
                  value={categoria.id}
                >
                  {categoria.nome}
                </option>

              ))}

            </select>

          </div>

        )}

        {/* ===========================
            COLEÇÃO
        =========================== */}

        {tipo === "colecao" && (

          <div>

            <label className="mb-2 block font-medium">
              Coleção
            </label>

            <select
              className="w-full rounded-lg border p-3"
              value={referencia}
              onChange={(e) =>
                setReferencia(e.target.value)
              }
            >

              <option value="">
                Selecione...
              </option>

              {colecoes.map((colecao) => (

                <option
                  key={colecao.id}
                  value={colecao.id}
                >
                  {colecao.nome}
                </option>

              ))}

            </select>

          </div>

        )}

        {/* ===========================
            PRODUTOS
        =========================== */}

        {tipo === "produtos" && (

          <ProdutosSelector
            value={produtos}
            onChange={setProdutos}
          />

        )}

        {/* ===========================
            QUANTIDADE / ORDEM
        =========================== */}

        <div className="grid grid-cols-2 gap-4">

          <div>

            <label className="mb-2 block font-medium">
              Quantidade
            </label>

            <input
              type="number"
              min={1}
              className="w-full rounded-lg border p-3"
              value={quantidade}
              onChange={(e) =>
                setQuantidade(Number(e.target.value))
              }
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Ordem
            </label>

            <input
              type="number"
              min={1}
              className="w-full rounded-lg border p-3"
              value={ordem}
              onChange={(e) =>
                setOrdem(Number(e.target.value))
              }
            />

          </div>

        </div>

        {/* ===========================
            STATUS
        =========================== */}

        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) =>
              setAtivo(e.target.checked)
            }
          />

          Ativo

        </label>

        {/* ===========================
            BOTÕES
        =========================== */}

        <div className="flex justify-end gap-3">

          <button
            type="button"
            className="
              rounded-lg
              border
              px-6
              py-3
              transition
              hover:bg-zinc-100
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={salvar}
            className="
              rounded-lg
              bg-violet-600
              px-6
              py-3
              font-medium
              text-white
              transition
              hover:bg-violet-700
            "
          >
            Salvar
          </button>

        </div>

      </div>

    </section>

  );

}