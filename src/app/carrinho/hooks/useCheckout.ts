"use client";

import { supabase } from "@/supabaseClient";
import { toast } from "sonner";

type Props = {
  enderecoId: number | null;
  selectedItemIds: number[];
};

export function useCheckout({
  enderecoId,
  selectedItemIds,
}: Props) {

  async function finalizarCompra() {

    try {

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user || !session.access_token) {

        toast.error(
          "Faça login para continuar."
        );

        return;

      }

      if (!selectedItemIds.length) {

        toast.error(
          "Selecione ao menos um item."
        );

        return;

      }

      if (!enderecoId) {

        toast.error(
          "Selecione um endereço."
        );

        return;

      }

      const response =
        await fetch(
          "/stripe/checkout-carrinho",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              enderecoId,
              selectedItemIds,
            }),
          }
        );

      const data = await response.json();

      if (!response.ok) {

        toast.error(
          data.error ??
            "Erro ao iniciar checkout."
        );

        return;

      }

      window.location.href =
        data.url;

    } catch (error) {

      console.error(error);

      toast.error(
        "Erro ao iniciar checkout."
      );

    }

  }

  return {
    finalizarCompra,
  };

}