import { useQuery } from '@tanstack/react-query';
import { getUsers, type UserFilters } from '@/lib/api/users';

export function useUserList(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
    keepPreviousData: true,
  });
}