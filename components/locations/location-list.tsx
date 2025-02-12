"use client";

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
import { Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import type { Location } from "@/types/location";

interface LocationListProps {
  readonly locations: Location[];
  readonly onEdit: (location: Location) => void;
  readonly onDelete: (id: number) => void;
  readonly onStatusChange: (id: number, status: boolean) => void;
  readonly isLoading?: boolean;
}

export function LocationList({
  locations,
  onEdit,
  onDelete,
  onStatusChange,
  isLoading,
}: LocationListProps) {
  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 text-center">
        Loading locations...
      </div>
    );
  }

  if (!locations?.length) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No locations found. Click the "Add New Location" button to add your
        first location.
      </div>
    );
  }

  const getLocationTypeBadge = (type: Location["type"]) => {
    const variants: Record<string, any> = {
      warehouse: { variant: "default", label: "Warehouse" },
      store: { variant: "secondary", label: "Store" },
      affiliate: { variant: "outline", label: "Affiliate Store" },
      others: { variant: "secondary", label: "Others" },
    };

    const { variant, label } = variants[type] || variants.others;
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Location Code</TableHead>
            <TableHead>Location Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => (
            <TableRow key={location.id}>
              <TableCell className="font-medium">{location.code}</TableCell>
              <TableCell>{location.name}</TableCell>
              <TableCell>{getLocationTypeBadge(location.type)}</TableCell>
              <TableCell>{formatDate(location.created_at)}</TableCell>
              <TableCell>{formatDate(location.updated_at)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(location)}
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
                        <AlertDialogTitle>Delete Location</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                          <div>
                            Are you sure you want to delete this location? This action cannot be undone.
                            <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
                              <p>
                                <strong>Code:</strong> {location.code}
                              </p>
                              <p>
                                <strong>Name:</strong> {location.name}
                              </p>
                              <p>
                                <strong>Type:</strong> {location.type}
                              </p>
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(location.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
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
