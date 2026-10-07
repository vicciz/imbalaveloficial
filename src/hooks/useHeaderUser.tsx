"use client";

import { useEffect, useState } from "react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { supabase } from "@/supabaseClient";

export interface HeaderUser {
  id: number;
  user_id: string;
  nome: string;
  email?: string;
  telefone?: string;
  role?: string;
  endereco?: string;
}

export function useHeaderUser() {
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser(authUser: AuthUser | null) {
      if (!authUser) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      if (active) {
        setLoading(true);
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from("usuario")
          .select(`
            id,
            user_id,
            nome,
            telefone,
            role
          `)
          .eq("user_id", authUser.id)
          .single();

        if (!active) return;

        if (profileError || !profile) {
          console.error(
            "Não foi possível carregar o perfil do Header.",
            profileError
          );

          setUser(null);
          return;
        }

        const { data: address, error: addressError } = await supabase
          .from("enderecos")
          .select(`
            logradouro,
            numero,
            cidade,
            estado
          `)
          .eq("id_usuario", profile.id)
          .eq("principal", true)
          .maybeSingle();

        if (!active) return;

        if (addressError) {
          console.error(
            "Não foi possível carregar o endereço do Header.",
            addressError
          );
        }

        const endereco = address
          ? [
              address.logradouro,
              address.numero,
              address.cidade,
              address.estado,
            ]
              .filter(Boolean)
              .join(", ")
          : undefined;

        setUser({
          id: profile.id,
          user_id: profile.user_id,
          nome: profile.nome,
          telefone: profile.telefone,
          role: profile.role,
          email: authUser.email,
          endereco,
        });
      } catch (error) {
        console.error(
          "Não foi possível carregar os dados do Header.",
          error
        );

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null;

      setTimeout(() => {
        if (active) {
          void loadUser(authUser);
        }
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Erro ao sair:", error);
      return;
    }

    setUser(null);
  }

  return {
    user,
    loading,
    logout,
  };
}