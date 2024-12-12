'use client';

import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useLogout } from '@/lib/hooks/use-logout';

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useLogout();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenuItem 
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="text-destructive focus:text-destructive"
    >
      {isLoggingOut ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </DropdownMenuItem>
  );
}