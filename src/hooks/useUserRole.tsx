import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = (userId: string | undefined) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!userId) {
        setIsAdmin(false);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        const userRole = data?.role || "user";
        setRole(userRole);
        setIsAdmin(userRole === "admin");
      } catch (error) {
        console.error("Error fetching user role:", error);
        setIsAdmin(false);
        setRole("user");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [userId]);

  return { isAdmin, role, loading };
};
