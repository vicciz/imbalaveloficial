"use client";

import { useState, useEffect } from "react";
import { createColecao, listarColecoes, adicionarProdutoColecao,listarProdutosColecao, removerProdutoColecao } from "@/src/services/colecao";
import { listarProdutos } from "@/src/services/produtos";

export default function Colecao() {
  const [nome, setNome] = useState("");

  const [colecoes, setColecoes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [colecaoSelecionada, setColecaoSelecionada] = useState(null);
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
      setColecoes(data);
    } else {
      console.log("Erro ao carregar coleções");
    }

    setCarregando(false);
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
      setProdutos(data);
      console.log("Produtos disponíveis");
    } else {
      console.log("Falha ao carregar produtos");
    }

    setCarregando(false);
  }

  return (
    <div>
      {/* Criar coleção */}
      <div>
        <h2>Criar coleção</h2>

        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border"
        />

        <button onClick={submitNewColect}>
          Criar
        </button>
      </div>

      {/* Lista de coleções */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {colecoes.map((colecao) => (
              <tr key={colecao.id}>
                <td>{colecao.id}</td>
                <td>{colecao.nome}</td>

                <td className="flex gap-2">
                  <button onClick={() => abrirModalColecao(colecao)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="overlay">
          <div className="modal">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2>
                Adicionar produtos
                {colecaoSelecionada && ` - ${colecaoSelecionada.nome}`}
              </h2>

              <button
                onClick={() => {
                  setModalAberto(false);
                  setProdutosSelecionados([]);
                  setProdutosOriginais([]);
                }}
              >
                Fechar
              </button>
            </div>

            {carregando ? (
              <p>Carregando produtos...</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    
                    <th className="border p-2">Imagem</th>
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Nome</th>
                    <th className="border p-2">Selecionar</th>
                  </tr>
                </thead>

                <tbody>
                  {produtos.map((produto) => (
                    
                    <tr key={produto.id}>
                      <td className="border p-2">
                        <img
                          src={produto.image}
                          alt={produto.nome}
                          width={50}
                        />
                      </td>
                      
                      <td className="border p-2">{produto.id}</td>

                      <td className="border p-2">{produto.nome}</td>
                      <td className="border p-2">
                        <input
                          type="checkbox"
                          checked={produtosSelecionados.includes(produto.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProdutosSelecionados([
                                ...produtosSelecionados,
                                produto.id,
                              ]);
                            } else {
                              setProdutosSelecionados(
                                produtosSelecionados.filter(
                                  (id) => id !== produto.id
                                )
                              );
                            }
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
            )}
            <button onClick={salvarProdutosNaColecao}>
    Salvar
</button>
          </div>
        </div>
      )}
    </div>
  );
}