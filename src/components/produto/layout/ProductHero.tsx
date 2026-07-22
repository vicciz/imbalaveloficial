"use client";

import { Produto } from "@/src/components/produto/types/produtos";
import { useProdutoVariacao } from "@/src/hooks/produto/useProdutoVariacao";

import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductPurchase from "./ProductPurchase";
import ProductDescribe from "./productEspecification";
import ProductList from "./ProductList";
import ProductApresentation from "./ProductApresentation";
import ProductReviews from "./ProductRviews";
import Footer from "@/src/components/layout/Home/Footer/Footer";
import ProductSpecification from "./productEspecification";

type Props = {
  produto: Produto;
};

export default function ProductHero({ produto }: Props) {
  const variacao = useProdutoVariacao(produto.id);

  return (
    <div className="mx-auto max-w-400 px-4 py-10 sm:px-6">

      <section className="grid grid-cols-1 gap-12 items-start lg:grid-cols-12">

        {/* COLUNA ESQUERDA */}
        <div className="col-span-full space-y-20 lg:col-span-8">

          {/* Hero */}
          <section className="grid grid-cols-1 gap-10 xl:grid-cols-8">

            <div className="col-span-full xl:col-span-4">
              <ProductGallery
                produto={produto}
                variacao={variacao}
              />
            </div>
            

            <div className="col-span-full xl:col-span-4">
              <ProductInfo
                produto={produto}
                variacao={variacao}
              />
            </div>

          </section>

          {/* Descrição */}
          <ProductDescribe produto={produto} />

          {/* Especificações */}
          <ProductSpecification produto={produto} />

          {/* Apresentação */}
          <ProductApresentation produto={produto} />

          {/* Comentários */}
          <ProductReviews produto={produto} />

        </div>

        {/* COLUNA DIREITA */}
        <div className="col-span-full space-y-8 lg:col-span-4">

          <div>
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
              <ProductPurchase
                produto={produto}
                variacao={variacao}
              />
            </div>
          </div>

          <div>
            <ProductList
              titulo="Produtos relacionados"
              produtos={[
                produto,
              ]}
              layout="list"
            />
          </div>

        </div>

      </section>

      <Footer />

    </div>
  );
}