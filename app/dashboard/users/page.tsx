'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { UserTable } from '@/components/users/user-table';
import { UserForm } from '@/components/users/user-form';
import { useUsers } from '@/lib/hooks/users/use-users';
import type { User } from '@/types/user';

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [userToDelete, setUserToDelete] = useState<User | undefined>();

  const {
    users,
    pagination,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers({
    page,
    search,
    limit: ITEMS_PER_PAGE,
  });

  const handleCreate = async (formData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createUser(formData);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create user',
      });
    }
  };

  const handleUpdate = async (formData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedUser) return;

    try {
      await updateUser({
        id: selectedUser.id,
        data: formData,
      });
      setIsDialogOpen(false);
      setSelectedUser(undefined);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user',
      });
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      setUserToDelete(undefined);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user',
      });
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error loading users. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage system users and their access
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="border rounded-lg p-8">
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      ) : (
        <UserTable
          users={users}
          onEdit={(user) => {
            setSelectedUser(user);
            setIsDialogOpen(true);
          }}
          onDelete={setUserToDelete}
        />
      )}

      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedUser(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser 
                ? 'Edit user details below'
                : 'Add a new user to the system'
              }
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={selectedUser ? handleUpdate : handleCreate}
            initialData={selectedUser}
            isSubmitting={isLoading}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={Boolean(userToDelete)}
        onOpenChange={(open) => !open && setUserToDelete(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div><strong>Name:</strong> {userToDelete?.first_name} {userToDelete?.last_name}</div>
                <div><strong>Email:</strong> {userToDelete?.email}</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}