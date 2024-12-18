import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/lib/api/users';

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}