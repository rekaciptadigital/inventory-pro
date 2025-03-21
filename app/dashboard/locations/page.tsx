'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocationList } from '@/components/locations/location-list';
import { LocationForm } from '@/components/locations/location-form';
import { useLocations } from '@/lib/hooks/locations/use-locations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Location, type LocationFormData } from '@/types/location';
import { generateLocationCode } from '@/lib/utils/location-code';

export default function LocationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [filter, setFilter] = useState({
    search: '',
    type: 'all' as 'all' | 'warehouse' | 'store' | 'affiliate' | 'others',
    parent_id: undefined as number | null | undefined,
  });

  const {
    locations,
    isLoading,
    createLocation,
    updateLocation,
    deleteLocation,
    updateLocationStatus,
  } = useLocations({
    search: filter.search,
    type: filter.type === 'all' ? undefined : filter.type,
    parent_id: filter.parent_id,
  });

  const handleOpenDialog = (location?: Location) => {
    setEditingLocation(location || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLocation(null);
  };

  const handleSubmit = async (data: LocationFormData) => {
    try {
      // Ensure code exists (either from form or auto-generated)
      const formattedData = {
        ...data,
        code: data.code ?? generateLocationCode(data.type),
      };

      if (editingLocation) {
        // Map parentId to parent_id for API
        const apiData = {
          ...formattedData,
          parent_id: formattedData.parentId,
        };
        await updateLocation({ id: editingLocation.id, data: apiData });
      } else {
        // Map parentId to parent_id for API
        const apiData = {
          ...formattedData,
          parent_id: formattedData.parentId,
        };
        await createLocation(apiData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteLocation(id);
    } catch (error) {
      console.error('Failed to delete location:', error);
    }
  };

  const handleStatusChange = async (id: number, status: boolean) => {
    try {
      await updateLocationStatus({ id, status });
    } catch (error) {
      console.error('Failed to update location status:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Locations</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Location
        </Button>
      </div>

      <div className="mb-6 flex items-end gap-4">
        <div className="flex-1">
          <div className="relative">
            <Input
              placeholder="Search locations..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-10"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        <div className="w-48">
          <Select
            value={filter.type}
            onValueChange={(value) => setFilter({ 
              ...filter, 
              type: value as 'all' | 'warehouse' | 'store' | 'affiliate' | 'others' 
            })}
          >
            <SelectTrigger>
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
      </div>

      <LocationList
        locations={locations}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        isLoading={isLoading}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
          </DialogHeader>
          <LocationForm
            initialData={editingLocation || undefined}
            onSubmit={handleSubmit}
            onClose={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}