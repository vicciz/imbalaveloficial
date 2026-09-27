"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { Button } from "../../ui/button";
import { toast } from "sonner";

import VariantImageManagerDialog from "./VariantImageManagerDialog";
import { CardVariacaoProps } from "./types";

import {
  aplicarPrecoATodasVariacoes,
  salvarItemVariacao,
} from "@/src/components/produto/types/variacoes";
import { variantImageService } from "@/src/services/products/services/VariantImageService";

function formatarMoeda(valor: number, currency: "USD" | "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(valor);
}

function parsePrecoVenda(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    return null;
  }

  const price = Number(normalized);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

export default function CardVariacao({
  produto,
  variacao,
  imagens,
  usdBrlRate,
  onRefresh,
}: CardVariacaoProps) {
  const [modalAberto, setModalAberto] = useState(false);

  const atributos = variacao.produto_variacao_item
    .map((item) => item.variacao_valor.valor)
    .join(" / ");

  // Cada produto_variacao possui um item comercial
  const item = variacao.produto_variacao_item[0];
  useEffect(() => {
    setPrecoVenda(String(item?.preco ?? 0));
  }, [item?.id, item?.preco]);

  const imagensPersistidas = useMemo(
    () => imagens.filter((image): image is typeof image & { id: number } => typeof image.id === "number"),
    [imagens]
  );
  const totalImagensVariacao = useMemo(
    () => variantImageService.getVariationImages(imagensPersistidas, variacao).length,
    [imagensPersistidas, variacao]
  );

  const [custoFornecedor, setCustoFornecedor] = useState(
    item?.custo_fornecedor ?? 0
  );
  const [precoVenda, setPrecoVenda] = useState(String(item?.preco ?? 0));
  const [precoAtualizadoPeloCusto, setPrecoAtualizadoPeloCusto] = useState(false);
  const [estoque, setEstoque] = useState(item?.estoque ?? 0);
  const [sku, setSku] = useState(item?.sku ?? "");
  const [ativo, setAtivo] = useState(item?.ativo ?? true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarAplicarTodas, setMostrarAplicarTodas] = useState(false);
  const custoBaseRef = useRef(Number(item?.custo_fornecedor ?? 0));
  const precoBaseRef = useRef(Number(item?.preco ?? 0));
  const isCjProduct = produto.origem?.toLowerCase() === "cj";
  const totalItensVariacao = (produto.produto_variacao ?? []).reduce(
    (count, productVariation) => count + (productVariation.produto_variacao_item?.length ?? 0),
    0
  );

  useEffect(() => {
    const savedCost = Number(item?.custo_fornecedor ?? 0);
    const savedPrice = Number(item?.preco ?? 0);

    custoBaseRef.current = savedCost;
    precoBaseRef.current = savedPrice;
    setCustoFornecedor(savedCost);
    setPrecoVenda(String(savedPrice));
    setPrecoAtualizadoPeloCusto(false);
  }, [item?.id, item?.custo_fornecedor, item?.preco]);

  function alterarCustoFornecedor(nextCost: number) {
    setCustoFornecedor(nextCost);

    const baseCost = custoBaseRef.current;
    const basePrice = precoBaseRef.current;
    if (baseCost > 0 && nextCost > baseCost) {
      setPrecoVenda((basePrice * nextCost / baseCost).toFixed(2));
      setPrecoAtualizadoPeloCusto(true);
      return;
    }

    setPrecoVenda(String(basePrice));
    setPrecoAtualizadoPeloCusto(false);
  }

  function alterarPrecoVenda(value: string) {
    setPrecoVenda(value);
    setPrecoAtualizadoPeloCusto(false);

    const salePrice = parsePrecoVenda(value);
    if (salePrice !== null) {
      custoBaseRef.current = Number(custoFornecedor);
      precoBaseRef.current = salePrice;
    }
  }

  async function salvar() {
    if (!item || salvando) return;

    const salePrice = parsePrecoVenda(precoVenda);
    if (salePrice === null) {
      toast.error("Informe um preço de venda válido em reais.");
      return;
    }

    setSalvando(true);
    try {
      await salvarItemVariacao(item.id, {
        preco: salePrice,
        custo_fornecedor: Number(custoFornecedor),
        estoque,
        sku,
        ativo,
        imagem_principal: item.imagem_principal,
      });

      await onRefresh();
      toast.success("Preço da variação salvo.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao salvar variação."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function aplicarATodasVariacoes() {
    if (!item || salvando) return;

    const salePrice = parsePrecoVenda(precoVenda);
    if (salePrice === null) {
      toast.error("Informe um preço de venda válido em reais.");
      return;
    }

    const formattedPrice = formatarMoeda(salePrice, "BRL");
    if (!window.confirm(`Aplicar ${formattedPrice} a todas as variações deste produto?`)) {
      return;
    }

    setSalvando(true);
    try {
      const updatedCount = await aplicarPrecoATodasVariacoes(
        item.id,
        produto.id,
        salePrice
      );
      await onRefresh();
      toast.success(`Preço aplicado a ${updatedCount} variações.`);
      setMostrarAplicarTodas(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao aplicar preço às variações."
      );
    } finally {
      setSalvando(false);
    }
  }

  const parsedSalePrice = parsePrecoVenda(precoVenda);
  const hasUnsavedSalePrice =
    parsedSalePrice !== null && parsedSalePrice !== Number(item?.preco ?? 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{atributos}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium">
              {isCjProduct ? "Custo do fornecedor (USD)" : "Custo do fornecedor"}
            </label>

            <div className="relative mt-1">
              {isCjProduct && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  US$
                </span>
              )}
              <Input
                type="number"
                min="0"
                step="0.01"
                className={isCjProduct ? "pl-12" : undefined}
                value={custoFornecedor}
                onChange={(e) =>
                  alterarCustoFornecedor(Number(e.target.value))
                }
              />
            </div>

            {isCjProduct && (
              <p className="mt-1 text-xs text-slate-600" aria-live="polite">
                ≈ {typeof usdBrlRate === "number"
                  ? formatarMoeda(custoFornecedor * usdBrlRate, "BRL")
                  : "conversão indisponível"}
              </p>
            )}

            {precoAtualizadoPeloCusto && (
              <p className="mt-1 text-xs text-emerald-700" aria-live="polite">
                Preço de venda ajustado proporcionalmente ao custo.
              </p>
            )}

            <p className="mt-1 text-xs text-slate-500">
              Preço de venda
            </p>

            <div className="relative mt-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                R$
              </span>
              <Input
                type="text"
                inputMode="decimal"
                className="pl-12"
                value={precoVenda}
                onChange={(e) => {
                  alterarPrecoVenda(e.target.value);
                  setMostrarAplicarTodas(false);
                }}
                onBlur={() => {
                  if (hasUnsavedSalePrice && totalItensVariacao > 1) {
                    setMostrarAplicarTodas(true);
                  }
                }}
              />
            </div>

            {mostrarAplicarTodas && hasUnsavedSalePrice && totalItensVariacao > 1 && (
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full"
                onClick={aplicarATodasVariacoes}
                disabled={salvando}
              >
                {salvando ? "Aplicando..." : "Aplicar a todas as variações"}
              </Button>
            )}
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
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar"}
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