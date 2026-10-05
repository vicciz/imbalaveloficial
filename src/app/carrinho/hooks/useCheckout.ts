"use client";

import { useRef, useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const checkoutPending = useRef(false);

  async function finalizarCompra() {
    if (checkoutPending.current) return;

    checkoutPending.current = true;
    setLoading(true);
    let checkoutIniciado = false;

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
      checkoutIniciado = true;

    } catch (error) {

      console.error(error);

      toast.error(
        "Erro ao iniciar checkout."
      );

    } finally {
      if (!checkoutIniciado) {
        checkoutPending.current = false;
        setLoading(false);
      }
    }

  }

  return {
    finalizarCompra,
    loading,
  };

}