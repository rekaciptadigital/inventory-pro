import { useState } from 'react';
import { useUserList } from './use-user-list';
import { useUserMutations } from './use-user-mutations';
import type { UserFilters } from '@/lib/api/users';

export function useUsers(filters: UserFilters = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { data, isLoading: isLoadingList, error } = useUserList(filters);
  const mutations = useUserMutations();

  return {
    users: data?.data || [],
    pagination: data?.pagination,
    isLoading: isLoadingList || isLoading || mutations.isLoading,
    error,
    ...mutations,
  };
}