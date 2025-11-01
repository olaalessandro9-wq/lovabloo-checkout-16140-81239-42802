// src/lib/auth.ts
import { createClient } from "@supabase/supabase-js";

export const supabase =
  // Se já existe um cliente centralizado, use-o; este é um fallback seguro.
  (globalThis as any).supabaseClient ||
  createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  );

export async function signOut() {
  try {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  } catch {
    // fallback: caso o projeto trate logout por rota
    window.location.href = "/auth";
  }
}
