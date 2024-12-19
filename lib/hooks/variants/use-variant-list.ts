import { useQuery } from '@tanstack/react-query';
import { getVariantTypes } from '@/lib/api/variants';

export function useVariantList() {
  return useQuery({
    queryKey: ['variants'],
    queryFn: () => getVariantTypes(),
  });
}