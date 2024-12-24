"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import type { Brand } from "@/types/brand";

interface BrandListProps {
  brands: Brand[];
  onEdit: (brand: Brand) => void;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: boolean) => Promise<void>;
}

export function BrandList({
  brands,
  onEdit,
  onDelete,
  onStatusChange,
}: BrandListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      await onDelete(id);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleStatusChange = async (id: string, status: boolean) => {
    try {
      setIsUpdatingStatus(id);
      await onStatusChange(id, status);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  if (brands.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No brands found. Add your first brand by clicking the "Add New Brand"
        button.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Brand Name</TableHead>
            <TableHead>Brand Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell className="font-medium">{brand.name}</TableCell>
              <TableCell>{brand.code}</TableCell>
              <TableCell>
                <Switch
                  checked={brand.status}
                  disabled={isUpdatingStatus === brand.id}
                  onCheckedChange={(checked) =>
                    handleStatusChange(brand.id, checked)
                  }
                />
              </TableCell>
              <TableCell>{formatDate(brand.created_at)}</TableCell>
              <TableCell>{formatDate(brand.updated_at)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(brand)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Brand</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this brand? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(brand.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeleting === brand.id}
                        >
                          {isDeleting === brand.id ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
