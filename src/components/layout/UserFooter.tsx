// src/components/layout/UserFooter.tsx
import { LogOut } from "lucide-react";
import { signOut, supabase } from "@/lib/auth";
import { useEffect, useState } from "react";

export function UserFooter() {
  const [email, setEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? undefined);
    });
  }, []);

  return (
    <div className="mt-auto border-t border-border/50 p-3">
      {email && (
        <div
          className="truncate text-xs text-muted-foreground mb-2"
          title={email}
        >
          {email}
        </div>
      )}
      <button
        type="button"
        onClick={signOut}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-destructive/90 px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive transition"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </div>
  );
}
