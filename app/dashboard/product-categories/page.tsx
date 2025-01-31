'use client';

// Halaman utama manajemen kategori produk
// Menampilkan daftar kategori dalam bentuk tabel dengan fitur:
// - Hierarki kategori (expand/collapse)
// - Pencarian dan filter
// - Pagination
// - CRUD operations

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Edit,
  Trash2,
} from "lucide-react";
import { ProductCategoryForm } from "@/components/categories/product-category-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination/pagination-controls";
import { PaginationInfo } from "@/components/ui/pagination/pagination-info";
import { usePagination } from "@/lib/hooks/use-pagination";
import { useProductCategories } from "@/lib/hooks/use-product-categories";
import type { ProductCategory } from "@/types/product-category";
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

// Fungsi untuk menghasilkan unique key yang digunakan pada rendering list
// Menggabungkan timestamp dan random string untuk menghindari duplikasi
const generateUniqueKey = (prefix: string) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

export default function ProductCategoriesPage() {
  // State untuk pencarian kategori
  const [search, setSearch] = useState("");
  
  // State untuk filter status aktif/nonaktif kategori
  const [status, setStatus] = useState<string>("all");
  
  // State untuk mengontrol dialog form kategori
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // State untuk menyimpan kategori yang sedang diedit
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>();
  
  // State untuk pengurutan data (ascending/descending)
  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");
  
  // State untuk tracking kategori yang sedang di-expand
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  
  // State untuk tracking proses penghapusan kategori
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Hook untuk mengatur pagination
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination();

  // Hook untuk operasi CRUD kategori dan loading state
  const {
    categories,
    pagination,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    error,
  } = useProductCategories({
    search,
    status: status === "all" ? undefined : status === "true",
    page: currentPage,
    limit: pageSize,
    sort: "created_at",
    order: sort,
  });

  // Fungsi untuk menangani edit kategori
  // Mengambil detail kategori dan menampilkan form edit
  const handleEdit = async (category: ProductCategory) => {
    try {
      const detailData = await getCategory(category.id);
      if (detailData?.data) {
        // Ensure the data matches our ProductCategory type
        setSelectedCategory(detailData.data as ProductCategory);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch category details:", error);
    }
  };

  // Fungsi untuk menangani penghapusan kategori
  // Menampilkan loading state selama proses
  const handleDelete = async (categoryId: number) => {
    setIsDeleting(categoryId);
    try {
      await deleteCategory(categoryId);
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  // Fungsi untuk mengatur expand/collapse kategori
  // Menggunakan Set untuk tracking status expanded
  const toggleExpand = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Fungsi untuk merender satu baris kategori
  // Menangani hierarki dengan level indentasi
  const renderCategory = (category: ProductCategory, level: number = 0): JSX.Element => {
    const hasChildren = Array.isArray(category.children) && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <React.Fragment key={generateUniqueKey(`category_${category.id}`)}>
        <TableRow>
          <TableCell className="font-medium">
            <div
              className="flex items-center"
              style={{ paddingLeft: `${level * 2}rem` }}
            >
              {category.name}
            </div>
          </TableCell>
          <TableCell>{category.code ?? "-"}</TableCell>
          <TableCell>{category.description ?? "-"}</TableCell>
          <TableCell>
            <Badge variant={category.status ? "default" : "secondary"}>
              {category.status ? "Active" : "Inactive"}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(category)}
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
                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this category? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(category.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting === category.id}
                    >
                      {isDeleting === category.id ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleExpand(category.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
        {hasChildren &&
          isExpanded &&
          category.children?.map((child) => renderCategory(child, level + 1))}
      </React.Fragment>
    );
  };

  // Fungsi untuk menghasilkan teks tombol submit yang dinamis
  // Menyesuaikan dengan mode create/update dan loading state
  const getButtonText = (isSubmitting: boolean, selectedCategory?: ProductCategory) => {
    if (isSubmitting) {
      return selectedCategory?.id ? "Updating..." : "Creating...";
    }
    return selectedCategory?.id ? "Update Category" : "Create Category";
  };

  // Fungsi untuk merender konten tabel
  // Menangani loading state, empty state, dan data state
  const renderTableContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={generateUniqueKey(`skeleton_${index}`)}>
          {Array.from({ length: 6 }).map((_, cellIndex) => (
            <TableCell key={generateUniqueKey(`cell_${index}_${cellIndex}`)}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (categories.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8">
            No categories found
          </TableCell>
        </TableRow>
      );
    }

    return categories.map((category: ProductCategory) => renderCategory(category));
  };

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error loading categories. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Categories</h1>
          <p className="text-muted-foreground">
            Manage your product categories and subcategories
          </p>
        </div>
        <Button onClick={() => {
          setSelectedCategory(undefined);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Category
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={status}
          onValueChange={setStatus}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sort}
          onValueChange={(value: "ASC" | "DESC") => setSort(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DESC">Newest First</SelectItem>
            <SelectItem value="ASC">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedCategory(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory?.id ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory?.id 
                ? 'Edit category details below'
                : 'Add a new category to organize your products'
              }
            </DialogDescription>
          </DialogHeader>
          <ProductCategoryForm
            categories={categories}
            onSubmit={async (data) => {
              if (selectedCategory?.id) {
                await updateCategory({
                  id: selectedCategory.id,
                  data: {
                    name: data.name,
                    description: data.description ?? "",
                    parent_id: data.parent_id,
                    status: data.status,
                  },
                });
              } else {
                await createCategory(data);
              }
              setIsDialogOpen(false);
              setSelectedCategory(undefined);
            }}
            initialData={selectedCategory}
            onClose={() => setIsDialogOpen(false)}
            buttonText={getButtonText(false, selectedCategory)}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTableContent()}
          </TableBody>
        </Table>
      </div>

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