import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { encrypt } from "../_shared/crypto.ts";
import { corsHeaders, handleCorsPreFlight } from "../_shared/cors.ts";

serve(async (req) => {
  // Tratar preflight OPTIONS
  if (req.method === "OPTIONS") {
    return handleCorsPreFlight();
  }

  // Validar método
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return new Response(
        JSON.stringify({ error: "Token é obrigatório" }),
        { 
          status: 422, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const encrypted = await encrypt(token);

    return new Response(
      JSON.stringify({ encrypted }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Erro ao criptografar token:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro ao criptografar token", 
        detail: String(error) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
