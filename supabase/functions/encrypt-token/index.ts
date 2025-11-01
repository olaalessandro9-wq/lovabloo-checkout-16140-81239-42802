import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { encrypt } from "../_shared/crypto.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";

serve(async (req) => {
  // 1) Tratar preflight OPTIONS
  if (req.method === "OPTIONS") {
    return handleOptions(req);
  }

  const origin = req.headers.get("Origin");
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  try {
    // 2) Validar método
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        { status: 405, headers }
      );
    }

    // 3) Extrair e validar dados
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return new Response(
        JSON.stringify({ error: "Token é obrigatório" }),
        { status: 422, headers }
      );
    }

    // 4) Criptografar token
    const encrypted = await encrypt(token);

    // 5) Retornar sucesso
    return new Response(
      JSON.stringify({ encrypted }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Erro ao criptografar token:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro ao criptografar token", 
        detail: String(error) 
      }),
      { status: 500, headers }
    );
  }
});
