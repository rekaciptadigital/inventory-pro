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
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/lib/hooks/use-users';
import type { User } from '@/types/user';

export default function UsersPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [userToDelete, setUserToDelete] = useState<User | undefined>();

  const { data, isLoading, error } = useUsers(page, search);
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleCreate = async (formData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createUserMutation.mutateAsync(formData);
      toast({
        title: 'Success',
        description: 'User has been created successfully',
      });
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
      await updateUserMutation.mutateAsync({
        id: selectedUser.id,
        data: formData,
      });
      toast({
        title: 'Success',
        description: 'User has been updated successfully',
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
      await deleteUserMutation.mutateAsync(userToDelete.id);
      toast({
        title: 'Success',
        description: 'User has been deleted successfully',
      });
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
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setSelectedUser(undefined);
          }}
        >
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
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
              isSubmitting={
                selectedUser 
                  ? updateUserMutation.isPending 
                  : createUserMutation.isPending
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          users={data?.data || []}
          onEdit={(user) => {
            setSelectedUser(user);
            setIsDialogOpen(true);
          }}
          onDelete={setUserToDelete}
        />
      )}

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
                <div><strong>Name:</strong> {userToDelete?.firstName} {userToDelete?.lastName}</div>
                <div><strong>Email:</strong> {userToDelete?.email}</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}