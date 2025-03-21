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
import { ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { useState, Fragment } from "react";
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
  const [expandedLocations, setExpandedLocations] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedLocations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

  const renderLocationRow = (location: Location, depth = 0) => {
    const hasChildren = location.children && location.children.length > 0;
    const isExpanded = !!expandedLocations[location.id];

    return (
      <Fragment key={location.id}>
        <TableRow>
          <TableCell className="font-medium">
            <div className="flex items-center">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 mr-1"
                  onClick={() => toggleExpand(location.id)}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
              {!hasChildren && depth > 0 && <div className="w-5 mr-1"></div>}
              {location.code}
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center">
              {depth > 0 && (
                <span className="text-xs text-muted-foreground mr-2" style={{ marginLeft: `${(depth - 1) * 20}px` }}>
                  ↳
                </span>
              )}
              {location.name}
              {hasChildren && (
                <Badge variant="outline" className="ml-2">
                  {location.children!.length} sub-location{location.children!.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </TableCell>
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
                        {hasChildren && (
                          <p className="text-destructive mt-2">
                            Warning: This location has {location.children!.length} sub-location{location.children!.length !== 1 ? 's' : ''} that will also be deleted.
                          </p>
                        )}
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
        {hasChildren && isExpanded && location.children!.map(child => renderLocationRow(child, depth + 1))}
      </Fragment>
    );
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
          {locations.map(location => renderLocationRow(location))}
        </TableBody>
      </Table>
    </div>
  );
}
