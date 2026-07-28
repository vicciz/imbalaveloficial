import Link from "next/link";
import {
  Images,
  LayoutTemplate,
} from "lucide-react";
import { AdminLayout } from "@/src/components/layout/Admin";
export default function HomeAdminPage() {
    return (
      <AdminLayout>
    <main className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold">
          Configuração da Home
        </h1>

        <p className="mt-2 text-zinc-600">
          Gerencie os elementos exibidos na página inicial da loja.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* Banner */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-violet-100 p-3">
              <Images className="h-6 w-6 text-violet-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Banners
              </h2>

              <p className="text-sm text-zinc-500">
                Gerencie os banners da página inicial.
              </p>
            </div>

          </div>

          <Link
            href="/admin/home/banners"
            className="
              mt-6
              inline-flex
              rounded-lg
              bg-violet-600
              px-4
              py-2
              text-sm
              font-medium
              text-white
              transition
              hover:bg-violet-700
            "
          >
            Configurar banners
          </Link>

        </div>

        {/* Vitrines */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-violet-100 p-3">
              <LayoutTemplate className="h-6 w-6 text-violet-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Vitrines
              </h2>

              <p className="text-sm text-zinc-500">
                Configure as vitrines de produtos exibidas na Home.
              </p>
            </div>

          </div>

          <Link
            href="/admin/home/vitrines"
            className="
              mt-6
              inline-flex
              rounded-lg
              bg-violet-600
              px-4
              py-2
              text-sm
              font-medium
              text-white
              transition
              hover:bg-violet-700
            "
          >
            Configurar vitrines
          </Link>

        </div>

      </div>

    </main>
  </AdminLayout>
  );
}