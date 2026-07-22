"use client";

import Footer from "@/src/components/layout/Home/Footer/Footer";

import Banner from "../components/layout/Home/Banner";

import HomeVitrines from "./admin/Vitrines/componentes/HomeVitrines";


export default function Page() {


  return (
<main
  className="min-h-screen bg-[#ebebeb] text-zinc-900"
  style={{ paddingTop: "96px" }}
>

      {/* ==========================
          BANNER FULL WIDTH
      =========================== */}

      <section
        className="
          w-full
        "
      >

        <Banner

          banner={{
            image:
              "/imagens/Banners/Imbalavel.png",

            badge:
              "DESTAQUE DA SEMANA",

            title:
              "Entrega rápida em todo o Brasil",

            subtitle:
              "Os melhores perfumes, cosméticos e maquiagem para cuidar da sua beleza todos os dias.",

            buttonText:
              "Ver ofertas",

            buttonHref:
              "/produtos",

          }}

          height="420px"

        />

      </section>



      {/* ==========================
          VITRINES
      =========================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          pb-10
          pt-4
          sm:px-6
        "
      >

        <HomeVitrines />

      </section>



      {/* ==========================
          BENEFÍCIOS
      =========================== */}

      <section
        className="
          border-y
          border-[#d9e4fb]
          bg-[#f5f8ff]
          py-10
        "
      >

        <div
          className="
            mx-auto
            grid
            max-w-7xl
            grid-cols-1
            gap-6
            px-4
            sm:px-6
            md:grid-cols-3
          "
        >

          {[
            {
              title:
                "Entrega rápida",

              desc:
                "Postagem ágil e rastreamento em tempo real.",
            },

            {
              title:
                "Pagamento seguro",

              desc:
                "Pix, cartão e proteção contra fraudes.",
            },

            {
              title:
                "Curadoria premium",

              desc:
                "Fragrâncias de alta performance e autenticidade.",
            },

          ].map((item) => (

            <div
              key={item.title}
              className="
                rounded-2xl
                border
                border-[#e7eefc]
                bg-white
                p-6
              "
            >

              <h3
                className="
                  text-lg
                  font-semibold
                  text-[#202020]
                "
              >

                {item.title}

              </h3>


              <p
                className="
                  mt-2
                  text-sm
                  text-[#5c5c5c]
                "
              >

                {item.desc}

              </p>


            </div>

          ))}


        </div>

      </section>



      <Footer />


    </main>

  );

}