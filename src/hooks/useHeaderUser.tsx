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

      // Busca os dados do usuário
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
        setLoading(false);
        return;
      }

      // Busca o endereço principal
      const { data: address } = await supabase
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

      setLoading(false);
    }

    async function initialize() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await loadUser(user);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await loadUser(session?.user ?? null);
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