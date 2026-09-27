import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  importarProdutoCJ,
} from "@/src/services/cjdropshipping/import";

function createAuthenticatedSupabaseClient(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Configuração do Supabase ausente.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export async function POST(
  request: NextRequest
) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Não autenticado." },
      { status: 401 }
    );
  }

  try {
    const authenticatedSupabase =
      createAuthenticatedSupabaseClient(accessToken);
    const { data: authData, error: authError } =
      await authenticatedSupabase.auth.getUser(accessToken);

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, message: "Sessão inválida." },
        { status: 401 }
      );
    }

    const { data: usuario, error: usuarioError } =
      await authenticatedSupabase
        .from("usuario")
        .select("role")
        .eq("user_id", authData.user.id)
        .single();

    if (usuarioError || usuario?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Acesso negado." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null) as {
      pid?: unknown;
    } | null;
    const pid = typeof body?.pid === "string" ? body.pid.trim() : "";

    if (!pid) {
      return NextResponse.json(
        { success: false, message: "PID obrigatório." },
        { status: 400 }
      );
    }

    const produto = await importarProdutoCJ(pid);

    return NextResponse.json({
      success: true,
      produto,
    });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Erro ao importar.",
      },
      { status: 500 }
    );
  }
}