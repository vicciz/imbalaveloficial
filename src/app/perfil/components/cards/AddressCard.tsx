"use client";

import { MapPin } from "lucide-react";

interface Props {
  endereco: any;
  selecionado: boolean;
  onSelecionar: () => void;
}

export default function AddressCard({
  endereco,
  selecionado,
  onSelecionar,
}: Props) {
  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        selecionado
          ? "border-violet-600 bg-violet-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between">

        <div className="flex gap-3">

          <input
            type="radio"
            checked={selecionado}
            onChange={onSelecionar}
            className="mt-1 h-5 w-5 accent-violet-600"
          />

          <div>

            <div className="flex items-center gap-2">

              <MapPin className="h-5 w-5 text-violet-600" />

              <h3 className="font-semibold">
                {endereco.principal
                  ? "Endereço Principal"
                  : "Endereço"}
              </h3>

            </div>

            <div className="mt-3 space-y-1 text-sm text-slate-600">

              <p>
                {endereco.logradouro}, {endereco.numero}
              </p>

              {endereco.complemento && (
                <p>{endereco.complemento}</p>
              )}

              <p>{endereco.bairro}</p>

              <p>
                {endereco.cidade} - {endereco.estado}
              </p>

              <p>CEP: {endereco.cep}</p>

              <p>{endereco.pais}</p>

            </div>

          </div>

        </div>

        <div className="flex gap-2">

          <button
            className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-100"
          >
            Editar
          </button>

          <button
            className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Remover
          </button>

        </div>

      </div>
    </div>
  );
}