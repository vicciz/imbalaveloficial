"use client";

import CardVariacao from "./CardVariacao";
import { VariacoesEditorProps } from "./types";

export default function VariacoesEditor({
  produto,
  variacoes,
  imagens,
  setImagens,
  abrirCropper,
}: VariacoesEditorProps) {
  if (
    !produto.produto_variacao?.length
  ) {
    return null;
  }

return (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">
        Variações
      </h2>

      <p className="text-muted-foreground">
        Cada variação possui seu próprio estoque,
        preço e imagens.
      </p>
    </div>

    {variacoes.map((variacao) => (
      <CardVariacao
        key={variacao.id}
        produto={produto}
        variacao={variacao}
        imagens={imagens}
        setImagens={setImagens}
        abrirCropper={abrirCropper}
      />
    ))}
  </div>
);
}