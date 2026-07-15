"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  adicionarItemVariacao,
  criarTipoVariacao,
  criarValorVariacao,
  criarVariacaoProduto,
  editarVariacaoProduto,
  excluirTipoVariacao,
  excluirValorVariacao,
  excluirVariacaoProduto,
  listarTiposVariacao,
  listarValoresTipo,
  listarVariacoesProduto,
  removerItemVariacao,
  type ProdutoVariacao,
  type VariacaoTipo,
  type VariacaoValor,
} from "@/src/services/produto/variacoes";

interface VariacoesProdutoProps {
  produtoId?: number;
}

export default function VariacoesProduto({ produtoId }: VariacoesProdutoProps) {
  const [tipos, setTipos] = useState<VariacaoTipo[]>([]);
  const [valoresPorTipo, setValoresPorTipo] = useState<Record<number, VariacaoValor[]>>({});
  const [variacoes, setVariacoes] = useState<ProdutoVariacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [novoTipo, setNovoTipo] = useState("");
  const [valoresEmEdicao, setValoresEmEdicao] = useState<Record<number, string>>({});
  const [sku, setSku] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [selecoes, setSelecoes] = useState<Record<number, number[]>>({});
  const [salvandoVariacao, setSalvandoVariacao] = useState(false);

  async function carregarDados() {
    if (!produtoId) {
      setTipos([]);
      setValoresPorTipo({});
      setVariacoes([]);
      return;
    }

    setLoading(true);

    const [{ data: tiposData, error: tiposError }, { data: variacoesData, error: variacoesError }] = await Promise.all([
      listarTiposVariacao(),
      listarVariacoesProduto(produtoId),
    ]);

    if (!tiposError) {
      const tiposCarregados = tiposData ?? [];
      setTipos(tiposCarregados);

      const valoresMap: Record<number, VariacaoValor[]> = {};
      const valoresRequests = tiposCarregados.map(async (tipo) => {
        const { data } = await listarValoresTipo(tipo.id);
        valoresMap[tipo.id] = data ?? [];
      });

      await Promise.all(valoresRequests);
      setValoresPorTipo(valoresMap);
    }

    if (!variacoesError) {
      setVariacoes(variacoesData ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    carregarDados();
  }, [produtoId]);

  async function criarTipo() {
    if (!novoTipo.trim()) return;

    const { data, error } = await criarTipoVariacao(novoTipo.trim());

    if (error) {
      alert("Erro ao criar tipo de variação");
      return;
    }

    setTipos((prev) => [...prev, data]);
    setValoresPorTipo((prev) => ({ ...prev, [data.id]: [] }));
    setNovoTipo("");
  }

  async function removerTipo(idTipo: number) {
    const { error } = await excluirTipoVariacao(idTipo);

    if (error) {
      alert("Erro ao excluir tipo de variação");
      return;
    }

    setTipos((prev) => prev.filter((tipo) => tipo.id !== idTipo));
    setValoresPorTipo((prev) => {
      const copia = { ...prev };
      delete copia[idTipo];
      return copia;
    });
  }

  async function criarValor(idTipo: number) {
    const valor = (valoresEmEdicao[idTipo] ?? "").trim();
    if (!valor) return;

    const { data, error } = await criarValorVariacao(idTipo, valor);

    if (error) {
      alert("Erro ao criar valor de variação");
      return;
    }

    setValoresPorTipo((prev) => ({
      ...prev,
      [idTipo]: [...(prev[idTipo] ?? []), data],
    }));
    setValoresEmEdicao((prev) => ({ ...prev, [idTipo]: "" }));
  }

  async function removerValor(idTipo: number, idValor: number) {
    const { error } = await excluirValorVariacao(idValor);

    if (error) {
      alert("Erro ao excluir valor de variação");
      return;
    }

    setValoresPorTipo((prev) => ({
      ...prev,
      [idTipo]: (prev[idTipo] ?? []).filter((valor) => valor.id !== idValor),
    }));
  }

  function toggleSelecao(idTipo: number, idValor: number) {
    setSelecoes((prev) => {
      const atual = prev[idTipo] ?? [];
      const jaSelecionado = atual.includes(idValor);

      return {
        ...prev,
        [idTipo]: jaSelecionado
          ? atual.filter((valorId) => valorId !== idValor)
          : [...atual, idValor],
      };
    });
  }

  async function salvarVariacao() {
    if (!produtoId) {
      alert("Salve o produto primeiro para gerenciar variações.");
      return;
    }

    const valoresSelecionados = Object.values(selecoes).flat();
    if (!sku.trim() || !preco || !estoque || valoresSelecionados.length === 0) {
      alert("Preencha SKU, preço, estoque e selecione pelo menos um valor.");
      return;
    }

    setSalvandoVariacao(true);

    const { data: variacaoData, error: variacaoError } = await criarVariacaoProduto(
      produtoId,
      sku.trim(),
      Number(preco),
      Number(estoque)
    );

    if (variacaoError || !variacaoData) {
      alert("Erro ao criar variação do produto");
      setSalvandoVariacao(false);
      return;
    }

    for (const idValor of valoresSelecionados) {
      await adicionarItemVariacao(variacaoData.id, idValor);
    }

    setSku("");
    setPreco("");
    setEstoque("");
    setSelecoes({});
    await carregarDados();
    setSalvandoVariacao(false);
  }

  async function removerVariacao(idVariacao: number) {
    const { error } = await excluirVariacaoProduto(idVariacao);

    if (error) {
      alert("Erro ao remover variação");
      return;
    }

    await carregarDados();
  }

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Variações</h2>
        <p className="mt-1 text-sm text-slate-600">
          Defina tipos e valores de variação e associe combinações ao produto.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={novoTipo}
            onChange={(e) => setNovoTipo(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500"
            placeholder="Ex.: Cor, Tamanho"
          />
          <button
            onClick={criarTipo}
            className="rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500"
          >
            <span className="flex items-center gap-2">
              <Plus size={16} /> Criar tipo
            </span>
          </button>
        </div>

        {tipos.length > 0 ? (
          <div className="space-y-3">
            {tipos.map((tipo) => (
              <div key={tipo.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-slate-900">{tipo.nome}</h3>
                  <button
                    onClick={() => removerTipo(tipo.id)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-3 flex flex-col gap-2 md:flex-row">
                  <input
                    value={valoresEmEdicao[tipo.id] ?? ""}
                    onChange={(e) =>
                      setValoresEmEdicao((prev) => ({ ...prev, [tipo.id]: e.target.value }))
                    }
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500"
                    placeholder={`Adicionar valor para ${tipo.nome}`}
                  />
                  <button
                    onClick={() => criarValor(tipo.id)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Adicionar valor
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(valoresPorTipo[tipo.id] ?? []).map((valor) => (
                    <span
                      key={valor.id}
                      className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {valor.valor}
                      <button onClick={() => removerValor(tipo.id, valor.id)} className="text-red-500">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Ainda não há tipos de variação cadastrados.</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <h3 className="font-medium text-slate-900">Criar combinação de variação</h3>
        <p className="mt-1 text-sm text-slate-600">
          Defina uma combinação do produto com SKU, preço e estoque.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">SKU</label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="SKU"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Preço</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Estoque</label>
            <input
              type="number"
              min="0"
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="0"
            />
          </div>
        </div>

        {tipos.length > 0 && (
          <div className="mt-4 space-y-3">
            {tipos.map((tipo) => (
              <div key={tipo.id}>
                <h4 className="text-sm font-semibold text-slate-800">{tipo.nome}</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(valoresPorTipo[tipo.id] ?? []).map((valor) => (
                    <label key={valor.id} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={(selecoes[tipo.id] ?? []).includes(valor.id)}
                        onChange={() => toggleSelecao(tipo.id, valor.id)}
                      />
                      {valor.valor}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={salvarVariacao}
            disabled={salvandoVariacao}
            className="rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {salvandoVariacao ? "Salvando..." : "Adicionar variação"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4">
        <h3 className="font-medium text-slate-900">Variações cadastradas</h3>

        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando variações...
          </div>
        ) : variacoes.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nenhuma variação cadastrada ainda.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {variacoes.map((variacao) => (
              <div key={variacao.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-800">{variacao.sku ?? "Sem SKU"}</p>
                    <p className="text-sm text-slate-600">
                      Preço: R$ {Number(variacao.preco ?? 0).toFixed(2)} • Estoque: {variacao.estoque}
                    </p>
                  </div>
                  <button
                    onClick={() => removerVariacao(variacao.id)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(variacao.produto_variacao_item ?? []).map((item: any) => (
                    <span key={item.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                      {item.variacao_valor?.valor} ({item.variacao_valor?.variacao_tipo?.nome})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
