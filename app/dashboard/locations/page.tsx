'use client';

import { useState } from 'react';
import { LocationList } from '@/components/locations/location-list';
import { LocationForm } from '@/components/locations/location-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocations } from '@/lib/hooks/locations/use-locations';

export default function LocationsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>();

  const {
    locations,
    isLoading,
    error,
    createLocation,
    updateLocation,
    deleteLocation,
  } = useLocations({
    search,
    type: typeFilter === 'all' ? undefined : typeFilter,
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
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
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
              if (selectedLocation) {
                await updateLocation({
                  id: selectedLocation.id,
                  data,
                });
              } else {
                await createLocation(data);
              }
              handleSuccess();
            }}
            initialData={selectedLocation}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}