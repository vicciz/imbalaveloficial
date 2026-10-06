"use client";

import Footer from "@/src/components/layout/Home/Footer/Footer";

import Banner from "../components/layout/Home/Banner";
import HomeVitrines from "@/src/app/admin/home/vitrines/componentes/HomeVitrines";

console.log("[diag] home page module loaded");

export default function Page() {
  console.log("[diag] home page render");

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
        <Banner />
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

      <Footer />


    </main>

  );

}