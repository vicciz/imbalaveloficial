"use client";

import { supabase } from "@/supabaseClient";
import { toast } from "sonner";

type Props = {
    userId: string;
  enderecoId: number | null;
  selectedItemIds: number[];
};

export function useCheckout({
  userId,
  enderecoId,
  selectedItemIds,
}: Props) {

  async function finalizarCompra() {

    try {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {

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
            },

            body: JSON.stringify({
              userId: user.id,
              enderecoId,
              selectedItemIds,
            }),
          }
        );

      const data =
        await response.json();

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