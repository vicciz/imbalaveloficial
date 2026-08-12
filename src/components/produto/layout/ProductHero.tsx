"use client";

import { Produto } from "@/src/components/produto/types/produtos";
import { useProdutoVariacao } from "@/src/hooks/produto/useProdutoVariacao";

import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductPurchase from "./ProductPurchase";
import ProductList from "./ProductList";
import ProductApresentation from "./ProductApresentation";
import ProductReviews from "./ProductRviews";
import ProductSpecification from "./productEspecification";
import Footer from "@/src/components/layout/Home/Footer/Footer";

type Props = {
  produto: Produto;
};

export default function ProductHero({ produto }: Props) {
  const variacao = useProdutoVariacao(produto.id);

  return (
    <div className="mx-auto w-full max-w-[100rem] px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <div className="col-span-full min-w-0 space-y-16 lg:col-span-8">
          <section className="grid grid-cols-1 items-start gap-10 xl:grid-cols-8">
            <div className="col-span-full min-w-0 xl:col-span-4">
              <ProductGallery produto={produto} variacao={variacao} />
            </div>

            <div className="col-span-full min-w-0 xl:col-span-4">
              <ProductInfo produto={produto} variacao={variacao} />
            </div>
          </section>

          <ProductApresentation produto={produto} />

          

          <ProductReviews produto={produto} />
        </div>

        <div className="col-span-full min-w-0 space-y-8 lg:col-span-4">
          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <ProductPurchase produto={produto} variacao={variacao} />
          </div>

          <ProductList
            titulo="Produtos relacionados"
            produtos={[produto]}
            layout="list"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
