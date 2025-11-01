import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { encrypt } from "../_shared/crypto.ts";

const JSON_HEADER = { "Content-Type": "application/json" };

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { status: 405, headers: JSON_HEADER }
    );
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return new Response(
        JSON.stringify({ error: "Token é obrigatório" }),
        { status: 422, headers: JSON_HEADER }
      );
    }

    const encrypted = await encrypt(token);

    return new Response(
      JSON.stringify({ encrypted }),
      { headers: JSON_HEADER }
    );

  } catch (error) {
    console.error("Erro ao criptografar token:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro ao criptografar token", 
        detail: String(error) 
      }),
      { status: 500, headers: JSON_HEADER }
    );
  }
});
