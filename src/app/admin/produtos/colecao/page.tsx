"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/src/layout/Admin";
import { createColecao, listarColecoes, adicionarProdutoColecao,listarProdutosColecao, removerProdutoColecao, delColecao } from "@/src/services/colecao";
import { listarProdutos, Produto } from "@/src/services/produtos";

export default function Colecao() {
  const [nome, setNome] = useState("");

  const [colecoes, setColecoes] = useState<{ id: number; nome: string }[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [colecaoSelecionada, setColecaoSelecionada] = useState<{ id: number; nome: string } | null>(null);
  const [produtosSelecionados, setProdutosSelecionados] = useState<number[]>([]);
  const [produtosOriginais, setProdutosOriginais] = useState<number[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
//funções assincronas
  async function submitNewColect() {
    const { data, error } = await createColecao(nome);

    if (!error) {
      console.log("Coleção criada com sucesso");
      console.log(data);

      setNome("");
      await carregarColecoes();
    } else {
      console.log("Erro ao criar coleção");
    }
  }
  async function salvarProdutosNaColecao() {
  if (!colecaoSelecionada) return;

  const produtosParaAdicionar = produtosSelecionados.filter(
    (id) => !produtosOriginais.includes(id)
  );

  const produtosParaRemover = produtosOriginais.filter(
    (id) => !produtosSelecionados.includes(id)
  );

  // Adiciona os novos produtos
  for (const idProduto of produtosParaAdicionar) {
    const { error } = await adicionarProdutoColecao(
      colecaoSelecionada.id,
      idProduto
    );

    if (error) {
      console.log(error);
    }
  }

  // Remove os produtos desmarcados
  for (const idProduto of produtosParaRemover) {
    const { error } = await removerProdutoColecao(
      colecaoSelecionada.id,
      idProduto
    );

    if (error) {
      console.log(error);
    }
  }

  alert("Coleção atualizada com sucesso!");

  setModalAberto(false);
  setProdutosSelecionados([]);
  setProdutosOriginais([]);
}

  async function carregarColecoes() {
    setCarregando(true);

    const { data, error } = await listarColecoes();

    if (!error) {
      setColecoes(data ?? []);
    } else {
      console.log("Erro ao carregar coleções");
    }

    setCarregando(false);
  }

  async function handleExcluirColecao(idColecao: number) {
    if (!confirm("Deseja realmente excluir esta coleção?")) return;

    const { error } = await delColecao(idColecao);

    if (!error) {
      await carregarColecoes();
      alert("Coleção excluída com sucesso");
    } else {
      alert("Erro ao excluir coleção");
    }
  }

  async function carregarProdutosDaColecao(idColecao: number) {
    const { data, error } = await listarProdutosColecao(idColecao);
    if (!error && data) {
      const ids = data.map((item) => item.produto_id);

      setProdutosSelecionados(ids);
      setProdutosOriginais(ids);
    }
  }
  async function abrirModalColecao(colecao: any) {
  setColecaoSelecionada(colecao);

  await exibirProdutos();
  await carregarProdutosDaColecao(colecao.id);

  setModalAberto(true);
}


  useEffect(() => {
    carregarColecoes();
  }, []);

  async function exibirProdutos() {
    setCarregando(true);

    const { data, error } = await listarProdutos();

    if (!error) {
      setProdutos(data ?? []);
      console.log("Produtos disponíveis");
    } else {
      console.log("Falha ao carregar produtos");
    }

    setCarregando(false);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Coleções</h1>
          <p className="mt-2 text-sm text-slate-600">Crie, organize e gerencie as coleções da loja.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Criar coleção</h2>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="Nome da coleção"
            />
            <button onClick={submitNewColect} className="rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500">
              Criar coleção
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Coleções cadastradas</h2>
          </div>

          {carregando ? (
            <div className="p-6 text-sm text-slate-600">Carregando coleções...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 text-left text-sm text-slate-600">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {colecoes.map((colecao) => (
                    <tr key={colecao.id} className="border-t border-slate-100 text-sm text-slate-700">
                      <td className="px-6 py-4">#{colecao.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{colecao.nome}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => abrirModalColecao(colecao)} className="rounded-lg bg-amber-100 px-3 py-2 text-amber-700 hover:bg-amber-200">
                            Editar produtos
                          </button>
                          <button onClick={() => handleExcluirColecao(colecao.id)} className="rounded-lg bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200">
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Adicionar produtos {colecaoSelecionada ? `- ${colecaoSelecionada.nome}` : ""}
              </h2>
              <button
                onClick={() => {
                  setModalAberto(false);
                  setProdutosSelecionados([]);
                  setProdutosOriginais([]);
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>

            {carregando ? (
              <p className="mt-6 text-sm text-slate-600">Carregando produtos...</p>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="border-b border-slate-100 px-4 py-3">Imagem</th>
                      <th className="border-b border-slate-100 px-4 py-3">ID</th>
                      <th className="border-b border-slate-100 px-4 py-3">Nome</th>
                      <th className="border-b border-slate-100 px-4 py-3 text-center">Selecionar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((produto) => (
                      <tr key={produto.id} className="border-b border-slate-100">
                        <td className="px-4 py-3">
                          <img src={produto.image || "/placeholder.png"} alt={produto.nome} className="h-12 w-12 rounded-lg object-cover" />
                        </td>
                        <td className="px-4 py-3">{produto.id}</td>
                        <td className="px-4 py-3">{produto.nome}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={produtosSelecionados.includes(produto.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProdutosSelecionados([...produtosSelecionados, produto.id]);
                              } else {
                                setProdutosSelecionados(produtosSelecionados.filter((id) => id !== produto.id));
                              }
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button onClick={salvarProdutosNaColecao} className="rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500">
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}