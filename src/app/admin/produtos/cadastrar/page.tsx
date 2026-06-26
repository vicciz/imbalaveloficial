"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/supabaseClient';
import { cadastrarProduto } from '@/src/services/produtos';
import { adicionarImagem } from "@/src/services/produtoImagem";

export default function CadastrarProduto() {
    const [nome, setNome] = useState("");
      const [preco, setPreco] = useState("");
      const [descricao, setDescricao] = useState("");
      const [detalhes, setDetalhes] = useState("");
      const [fornecedor, setFornecedor] = useState("");
      const [categoriaId, setCategoriaId] = useState("");
      const [colecaoId, setColecaoId] = useState("");
      const [link, setLink] = useState("");
      const [imagens, setImagens] = useState<File[]>([]);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 2) Create product record with the uploaded file path
        const {
        data: produto,
        error,
        } = await cadastrarProduto({
        nome,
        preco,
        descricao,
        detalhes,
        fornecedor,
        link,
        ...(categoriaId
            ? { categoria_id: Number(categoriaId) }
            : {}),
        });
    if (error || !produto) {
  console.error(error);
  alert("Erro ao cadastrar produto.");
  return;
}

    for (let i = 0; i < imagens.length; i++) {
        const imagem = imagens[i];

        const extensao =
            imagem.name.split(".").pop();

        const caminho =
            `${produto.id}/${i + 1}.${extensao}`;
const {
  data: { user },
} = await supabase.auth.getUser();

console.log(user);
        const {
            data: upload,
            error: uploadError,
        } = await supabase.storage
            .from("produtos")
            .upload(caminho, imagem);

        if (uploadError) {
            console.error(uploadError);
            continue;
        }

        await adicionarImagem(
            produto.id,
            upload.path,
            i + 1,
            i === 0
        );
}
      
      if (colecaoId && produto) {
        const { error: relacaoError } =
        await supabase
        .from("colecao_produto")
        .insert({
            colecao_id: Number(colecaoId),
            produto_id: produto.id,
        });

    if (relacaoError) {
        console.error(relacaoError);
    }
    alert("Produto cadastrado com sucesso!");
}

      alert('Produto cadastrado com sucesso!');
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao conectar com o servidor');
    }
  };
return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 p-6 bg-white border border-black/10 rounded-xl shadow-lg"
      >
        <h1 className="text-xl font-bold">Cadastrar Produto</h1>

        <input
          className="w-full p-3 rounded bg-slate-100 border border-black/10"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-slate-100 border border-black/10"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-slate-100 border border-black/10"
          placeholder="Link do Produto"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          setImagens(files);
          }}
        />
   <textarea
          className="w-full p-3 rounded bg-slate-100 border border-black/10"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <textarea
          className="w-full p-3 rounded bg-slate-100 border border-black/10"
          placeholder="Detalhes"
          value={detalhes}
          onChange={(e) => setDetalhes(e.target.value)}
        />

        <select
          className="w-full p-3 rounded bg-slate-100 border border-black/10"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
        >
          <option value="">Selecione a categoria</option>
        </select>

        <select
          className="w-full p-3 rounded bg-slate-100 border border-black/10"
          value={colecaoId}
          onChange={(e) => setColecaoId(e.target.value)}
        >
          <option value="">Coleção (opcional)</option>
        </select>

        <input
          className="w-full p-3 rounded bg-slate-100 border border-black/10"
          placeholder="Fornecedor"
          value={fornecedor}
          onChange={(e) => setFornecedor(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded font-semibold"
        >
          Salvar Produto
        </button>

      </form>
    </div>
  );
}