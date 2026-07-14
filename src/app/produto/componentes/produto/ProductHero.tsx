"use client";

import { Produto } from "@/src/services/produtos";

import { useProdutoVariacao } from "@/src/hooks/useProdutoVariacao";

import ProductGallery from "@/src/app/produto/componentes/produto/ProductGallery";
import ProductInfo from "@/src/app/produto/componentes/produto/ProductInfo";
import ProductPurchase from "@/src/app/produto/componentes/produto/ProductPurchase";
import ProductDescribe from "../ProductDescribe";
import ProductSpecification from "../productEspecification";
import ProductList from "./ProductList";
import ProductApresentation from "./ProductApresentation";
import ProductReviews from "./ProductRviews";
import Header from "@/src/layout/Home/Header";
import HeaderResumo from "@/src/app/admin/ModalVariacoes/componentes/HeaderResumo";
import Footer from "@/src/layout/Home/Footer";
type Props = {
  produto: Produto;
};

export default function ProductHero({
  produto,
}: Props) {
  const variacao =
    useProdutoVariacao(produto.id);

return (
  <div className="space-y-20">

    {/* Hero */}
    <section className="grid grid-cols-12 gap-10">

      <div className="col-span-4">
        <ProductGallery
          produto={produto}
          variacao={variacao}
        />
      </div>

      <div className="col-span-4">
        <ProductInfo
          produto={produto}
          variacao={variacao}
        />
      </div>

      <div className="col-span-4">
        <ProductPurchase
          produto={produto}
          variacao={variacao}
        />
      </div>

    </section>

    {/* Descrição */}
    <ProductDescribe produto={produto} />

    {/* Especificações + Produtos */}
    <section className="grid grid-cols-12">

      <div className="col-span-8 pr-20">
        <ProductSpecification produto={produto} />
      </div>

      <aside className="col-span-4 pl-10">
        <ProductList
          titulo="Produtos relacionados"
          produtos={[
            produto,
            
          ]}
          layout="list"
        />
      </aside>
    </section>

    <section>
     <ProductApresentation 
     produto={produto}/> 
    </section>

    <section>
      <ProductReviews
      produto={produto}
/>
    </section>

    <section>
      <Footer/>
    </section>
  </div>
);
}