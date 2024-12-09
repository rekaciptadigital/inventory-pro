'use client';

import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductActions } from '@/components/inventory/product-actions';
import { ProductList } from '@/components/inventory/product-list';
import { SingleProductForm } from '@/components/inventory/product-form/single-product-form';
import { useToast } from '@/components/ui/use-toast';
import type { Product } from '@/types/inventory';

export default function InventoryPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load products from localStorage on component mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = (updatedProduct: Product) => {
    const updatedProducts = products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    );
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
    
    toast({
      title: 'Success',
      description: 'Product has been updated successfully',
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      toast({
        title: 'Success',
        description: 'Product has been deleted successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete product',
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = (
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesCategory = categoryFilter === 'all' || product.productTypeId === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your archery equipment inventory
          </p>
        </div>
        <ProductActions />
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by brand, SKU, or product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={setCategoryFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="bows">Bows</SelectItem>
            <SelectItem value="arrows">Arrows</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ProductList 
        products={filteredProducts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <SingleProductForm
              initialData={selectedProduct}
              onSuccess={handleEditSuccess}
              onClose={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}