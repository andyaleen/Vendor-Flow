import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const response = await fetch("/api/auth/user", {
        credentials: "include", // Important for session cookies
      });
      
      if (!response.ok) {
        throw new Error("Not authenticated");
      }
      
      return response.json();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}