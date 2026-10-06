import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("error", "google_auth_failed");
  return NextResponse.redirect(loginUrl);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  if (oauthError || !code) {
    if (oauthError) {
      console.error("Erro retornado pelo provedor OAuth:", oauthError);
    }
    return redirectToLogin(request);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Configuração do Supabase ausente ao concluir OAuth.");
    return redirectToLogin(request);
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
      auth: {
        flowType: "pkce",
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Erro ao trocar o código OAuth por uma sessão:", error);
    return redirectToLogin(request);
  }
}
