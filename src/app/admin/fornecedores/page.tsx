"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Check,
  ChevronRight,
  Globe2,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

type FornecedorStatus = "disponivel" | "analise" | "indisponivel";

type Fornecedor = {
  id: string;
  nome: string;
  descricao: string;
  status: FornecedorStatus;
  tipo: string;
  origem: string;
  icon: React.ReactNode;
  href?: string;
};

const fornecedores: Fornecedor[] = [
  {
    id: "cj",
    nome: "CJ Dropshipping",
    descricao:
      "Importe produtos diretamente do catálogo da CJ Dropshipping e mantenha as informações de fornecedor vinculadas ao produto.",
    status: "disponivel",
    tipo: "Dropshipping internacional",
    origem: "Internacional",
    icon: <Package size={28} />,
    href: "/admin/fornecedores/cjdropshipping",
  },
  {
    id: "dsers",
    nome: "AliExpress · DSers",
    descricao:
      "Importação de produtos do AliExpress utilizando o DSers como camada de integração e fulfillment.",
    status: "analise",
    tipo: "AliExpress / DSers",
    origem: "Internacional",
    icon: <ShoppingBag size={28} />,
  },
];

function StatusBadge({ status }: { status: FornecedorStatus }) {
  if (status === "disponivel") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Disponível
      </span>
    );
  }

  if (status === "analise") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        Integração em análise 
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500">
      <span className="h-2 w-2 rounded-full bg-zinc-400" />
      Indisponível
    </span>
  );
}

export default function FornecedoresPage() {
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState("cj");

  function selecionarFornecedor(fornecedor: Fornecedor) {
    if (fornecedor.status !== "disponivel") {
      return;
    }

    setFornecedorSelecionado(fornecedor.id);
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Cabeçalho */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500">
            <span>Administração</span>
            <ChevronRight size={15} />
            <span>Fornecedores</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Fornecedores
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Selecione o fornecedor que será utilizado para importar produtos
            para o Imbalável.
          </p>
        </div>

        {/* Fornecedor atualmente selecionado */}
        <section className="mb-8 rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Truck size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                Fornecedor selecionado para importação
              </p>

              <h2 className="mt-1 text-lg font-bold text-zinc-900">
                {
                  fornecedores.find(
                    (item) => item.id === fornecedorSelecionado
                  )?.nome
                }
              </h2>

              <p className="mt-1 text-sm text-zinc-600">
                Os próximos produtos importados utilizarão este fornecedor.
              </p>
            </div>
          </div>
        </section>

        {/* Lista */}
        <div className="grid gap-6 md:grid-cols-2">
          {fornecedores.map((fornecedor) => {
            const selecionado =
              fornecedorSelecionado === fornecedor.id;

            const disponivel = fornecedor.status === "disponivel";

            return (
              <article
                key={fornecedor.id}
                className={[
                  "relative overflow-hidden rounded-2xl border bg-white p-6 transition-all",
                  selecionado
                    ? "border-violet-500 ring-2 ring-violet-100"
                    : "border-zinc-200 hover:border-zinc-300",
                  !disponivel ? "opacity-90" : "",
                ].join(" ")}
              >
                {/* Check de selecionado */}
                {selecionado && (
                  <div className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white">
                    <Check size={16} strokeWidth={3} />
                  </div>
                )}

                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                    {fornecedor.icon}
                  </div>
                </div>

                <StatusBadge status={fornecedor.status} />

                <h2 className="mt-4 text-xl font-bold text-zinc-900">
                  {fornecedor.nome}
                </h2>

                <p className="mt-2 min-h-[72px] text-sm leading-6 text-zinc-500">
                  {fornecedor.descricao}
                </p>

                <div className="mt-5 space-y-3 border-t border-zinc-100 pt-5">
                  <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <Package size={17} className="text-zinc-400" />
                    <span>{fornecedor.tipo}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <Globe2 size={17} className="text-zinc-400" />
                    <span>{fornecedor.origem}</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={!disponivel}
                    onClick={() => selecionarFornecedor(fornecedor)}
                    className={[
                      "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition",
                      disponivel
                        ? selecionado
                          ? "bg-violet-600 text-white"
                          : "bg-zinc-900 text-white hover:bg-zinc-800"
                        : "cursor-not-allowed bg-zinc-100 text-zinc-400",
                    ].join(" ")}
                  >
                    {selecionado
                      ? "Fornecedor selecionado"
                      : disponivel
                      ? "Usar este fornecedor"
                      : "Integração em análise"}
                  </button>

                  {fornecedor.href ? (
                    <Link
                      href={fornecedor.href}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                    >
                      Abrir fornecedor
                      <ChevronRight size={16} />
                    </Link>
                  ) : (
                    <span
                      className="flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-400"
                      aria-disabled="true"
                    >
                      Aba em preparação
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Informação */}
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="font-semibold text-zinc-900">
            Como funciona
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <span className="text-sm font-semibold text-violet-600">
                01
              </span>
              <p className="mt-1 text-sm text-zinc-600">
                Escolha o fornecedor que deseja utilizar.
              </p>
            </div>

            <div>
              <span className="text-sm font-semibold text-violet-600">
                02
              </span>
              <p className="mt-1 text-sm text-zinc-600">
                Acesse a importação de produtos daquele fornecedor.
              </p>
            </div>

            <div>
              <span className="text-sm font-semibold text-violet-600">
                03
              </span>
              <p className="mt-1 text-sm text-zinc-600">
                Os produtos importados ficam vinculados ao fornecedor
                escolhido.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}