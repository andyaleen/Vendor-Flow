import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: Infinity,
    enabled: false, // Disable automatic auth checking for now
  });

  return {
    user: null, // Force unauthenticated state
    isLoading: false,
    isAuthenticated: false,
    error,
  };
}