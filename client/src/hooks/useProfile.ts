import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useProfile() {
  const { data: profile, isLoading, error } = useQuery<User>({
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