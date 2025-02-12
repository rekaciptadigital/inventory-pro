'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LocationList } from '@/components/locations/location-list';
import { LocationForm } from '@/components/locations/location-form';
import { useLocations } from '@/lib/hooks/locations/use-locations';
import { PaginationControls } from '@/components/ui/pagination/pagination-controls';
import { PaginationInfo } from '@/components/ui/pagination/pagination-info';
import { usePagination } from '@/lib/hooks/use-pagination';
import type { Location } from '@/types/location';

export default function LocationsPage() {
  const [search, setSearch] = useState('');
  const [locationType, setLocationType] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>();
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination();

  const {
    locations,
    pagination,
    isLoading,
    error,
    createLocation,
    updateLocation,
    deleteLocation,
    updateLocationStatus,
  } = useLocations({
    search,
    type: locationType === 'all' ? undefined : locationType as Location['type'],
    page: currentPage,
    limit: pageSize,
  });

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedLocation(undefined);
  };

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error loading locations. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Location Management</h1>
          <p className="text-muted-foreground">
            Manage your storage locations and warehouses
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Location
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search locations..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handlePageChange(1); // Reset to first page on search
            }}
          />
        </div>
        <Select 
          value={locationType} 
          onValueChange={(value) => {
            setLocationType(value);
            handlePageChange(1); // Reset to first page on type change
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="warehouse">Warehouse</SelectItem>
            <SelectItem value="store">Store</SelectItem>
            <SelectItem value="affiliate">Affiliate Store</SelectItem>
            <SelectItem value="others">Others</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <LocationList
        locations={locations}
        onEdit={(location) => {
          setSelectedLocation(location);
          setIsDialogOpen(true);
        }}
        onDelete={deleteLocation}
        onStatusChange={(id, status) => updateLocationStatus({ id, status })}
        isLoading={isLoading}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedLocation(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
            <DialogDescription>
              {selectedLocation
                ? 'Edit location details below'
                : 'Add a new storage location to your system'}
            </DialogDescription>
          </DialogHeader>
          <LocationForm
            onSubmit={async (data) => {
              // Ensure code exists before submitting
              if (!data.code) {
                throw new Error('Location code is required');
              }

              if (selectedLocation) {
                await updateLocation({
                  id: selectedLocation.id,
                  data: {
                    code: data.code,
                    name: data.name,
                    type: data.type,
                    description: data.description,
                    status: data.status
                  },
                });
              } else {
                await createLocation({
                  code: data.code,
                  name: data.name,
                  type: data.type,
                  description: data.description,
                  status: data.status
                });
              }
              handleSuccess();
            }}
            initialData={selectedLocation}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PaginationInfo
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={pagination?.totalItems || 0}
        />
        <PaginationControls
          currentPage={currentPage}
          totalPages={pagination?.totalPages || 1}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}