"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/src/components/layout/Admin";
import { supabase } from "@/supabaseClient";

export default function Pedido() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);

      // Busca o usuário autenticado
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Usuário não autenticado", authError);
        setPedidos([]);
        setCarregando(false);
        return;
      }

      // Busca apenas os pedidos do usuário logado
      const { data, error } = await supabase
        .from("pedido")
        .select(`
          *,
          pedidoItem (
            quantidade,
            produto (
              id,
              nome,
              preco,
              produto_imagem (
                caminho,
                principal,
                ordem
              )
            )
          )
        `)
        .eq("id_usuario", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setPedidos([]);
        setCarregando(false);
        return;
      }

      const pedidosNormalizados = (data ?? []).map((pedido: any) => ({
        ...pedido,
        pedidoItem: (pedido.pedidoItem ?? []).map((item: any) => {
          const imagens =
            item.produto?.produto_imagem?.sort(
              (a: any, b: any) => a.ordem - b.ordem
            ) ?? [];

          const principal =
            imagens.find((img: any) => img.principal) ?? imagens[0];

          return {
            ...item,
            produto: {
              ...item.produto,
              image: principal
                ? supabase.storage
                    .from("produtos")
                    .getPublicUrl(principal.caminho).data.publicUrl
                : "",
            },
          };
        }),
      }));

      setPedidos(pedidosNormalizados);
      setCarregando(false);
    }

    carregar();
  }, []);

  return (
    <>
      <div className="space-y-6" >
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Meus Pedidos
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Aqui estão todos os pedidos realizados pela sua conta.
          </p>
        </div>

        {carregando ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
            Carregando pedidos...
          </div>
        ) : pedidos.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
            Você ainda não realizou nenhum pedido.
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Pedido #{pedido.id}
                    </h2>

                    <p className="text-sm text-slate-600">
                      Status: {pedido.status ?? "Sem status"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Total: R$ {Number(pedido.valorTotal ?? 0).toFixed(2)}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {new Date(pedido.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {(pedido.pedidoItem ?? []).map(
                    (item: any, index: number) => (
                      <div
                        key={`${pedido.id}-${index}`}
                        className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {item.produto?.image ? (
                            <img
                              src={item.produto.image}
                              alt={item.produto.nome}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-500">
                              Sem imagem
                            </div>
                          )}

                          <div>
                            <p className="font-medium text-slate-900">
                              {item.produto?.nome ?? "Produto"}
                            </p>

                            <p className="text-sm text-slate-600">
                              Quantidade: {item.quantidade}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm font-semibold text-slate-900">
                          R$ {Number(item.produto?.preco ?? 0).toFixed(2)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}