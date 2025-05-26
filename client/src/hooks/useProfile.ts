import { useQuery } from "@tanstack/react-query";

export function useProfile() {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["/api/user/profile"],
    retry: false,
  });

  return {
    profile,
    isLoading,
    error,
    isComplete: profile?.isComplete || false,
  };
}