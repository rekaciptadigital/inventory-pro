'use client';

// Mengimpor modul dan hook yang diperlukan
import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useLogout } from '@/lib/hooks/use-logout';

// Fungsi komponen LogoutButton
export function LogoutButton() {
  // Menggunakan state untuk melacak status logout
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useLogout();

  // Fungsi untuk menangani proses logout
  const handleLogout = async () => {
    // Jika sudah dalam proses logout, hentikan eksekusi
    if (isLoggingOut) return;
    
    try {
      // Mengubah status menjadi sedang logout
      setIsLoggingOut(true);
      // Memanggil fungsi logout
      await logout();
    } finally {
      // Mengembalikan status menjadi tidak sedang logout
      setIsLoggingOut(false);
    }
  };

  // Mengembalikan elemen DropdownMenuItem dengan logika tampilan berdasarkan status logout
  return (
    <DropdownMenuItem 
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="text-destructive focus:text-destructive"
    >
      {isLoggingOut ? (
        // Menampilkan ikon loader saat sedang logout
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        // Menampilkan ikon logout saat tidak sedang logout
        <LogOut className="mr-2 h-4 w-4" />
      )}
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </DropdownMenuItem>
  );
}