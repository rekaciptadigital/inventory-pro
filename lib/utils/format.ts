import { format, parseISO } from 'date-fns';

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'yyyy-MM-dd HH:mm:ss');
  } catch (error) {
    return dateString;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}