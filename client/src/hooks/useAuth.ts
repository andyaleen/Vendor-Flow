import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
      } else {
        setUser(session.user as User);
      }
      setIsLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user as User ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}