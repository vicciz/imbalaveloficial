"use client";

import { useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { Button } from "../../ui/button";

import VariantImageManagerDialog from "./VariantImageManagerDialog";
import { CardVariacaoProps } from "./types";

import { salvarItemVariacao } from "@/src/components/produto/types/variacoes";
import { calcularPrecoVenda, normalizarMarkup } from "@/src/services/precos/markup";
import { variantImageService } from "@/src/services/products/services/VariantImageService";
import { supabase } from "@/supabaseClient";

export default function CardVariacao({
  produto,
  variacao,
  imagens,
  onRefresh,
}: CardVariacaoProps) {
  const [modalAberto, setModalAberto] = useState(false);

  const atributos = variacao.produto_variacao_item
    .map((item) => item.variacao_valor.valor)
    .join(" / ");

  // Cada produto_variacao possui um item comercial
  const item = variacao.produto_variacao_item[0];
  const imagensPersistidas = useMemo(
    () => imagens.filter((image): image is typeof image & { id: number } => typeof image.id === "number"),
    [imagens]
  );
  const totalImagensVariacao = useMemo(
    () => variantImageService.getVariationImages(imagensPersistidas, variacao).length,
    [imagensPersistidas, variacao]
  );

  const [custoFornecedor, setCustoFornecedor] = useState(
    variacao?.custo_fornecedor ??
    item?.custo_fornecedor ??
    variacao?.preco ??
    item?.preco ??
    0
  );
  const markupPercent = normalizarMarkup(produto?.markup_percent);
  const precoVenda = calcularPrecoVenda(
    custoFornecedor,
    markupPercent
  );
  const [estoque, setEstoque] = useState(item?.estoque ?? 0);
  const [sku, setSku] = useState(item?.sku ?? "");
  const [ativo, setAtivo] = useState(item?.ativo ?? true);

  async function salvar() {
    if (!item) return;

    await salvarItemVariacao(item.id, {
      preco: precoVenda,
      custo_fornecedor: Number(custoFornecedor),
      estoque,
      sku,
      ativo,
      imagem_principal: item.imagem_principal,
    });

    await supabase
      .from("produto_variacao")
      .update({
        preco: precoVenda,
        custo_fornecedor: Number(custoFornecedor),
      })
      .eq("id", variacao.id);

    await onRefresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{atributos}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium">
              Custo do fornecedor
            </label>

            <Input
              type="number"
              min="0"
              step="0.01"
              value={custoFornecedor}
              onChange={(e) =>
                setCustoFornecedor(Number(e.target.value))
              }
            />

            <p className="mt-1 text-xs text-slate-500">
              Venda: R$ {precoVenda.toFixed(2)} ({markupPercent}% de markup)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">
              Estoque
            </label>

            <Input
              type="number"
              value={estoque}
              onChange={(e) =>
                setEstoque(Number(e.target.value))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              SKU
            </label>

            <Input
              value={sku}
              onChange={(e) =>
                setSku(e.target.value)
              }
            />

            <Button
              className="mt-3"
              onClick={salvar}
            >
              Salvar
            </Button>

            <Button
              variant="outline"
              className="mt-3 ml-2"
              onClick={() => setModalAberto(true)}
            >
              Gerenciar imagens
            </Button>

            <p className="text-sm text-muted-foreground mt-2">
              {totalImagensVariacao}{" "}
              imagens cadastradas
            </p>

            <div className="mt-4 flex items-center gap-3">
              <Switch checked={ativo} onCheckedChange={setAtivo} />
              <span className="text-sm text-slate-700">
                {ativo ? "Variação ativa" : "Variação desativada"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <VariantImageManagerDialog
        open={modalAberto}
        onOpenChange={setModalAberto}
        variation={variacao}
        title={atributos}
        productImages={imagensPersistidas}
        onSaved={onRefresh}
      />
    </Card>
  );
}