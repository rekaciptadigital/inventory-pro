"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Pencil,
  Trash,
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
import { formatDate } from "@/lib/utils/format";
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
import { Edit, Trash2 } from "lucide-react";

const generateUniqueKey = (prefix: string) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default function ProductCategoriesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } =
    usePagination();

  const {
    categories,
    pagination,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory, // Add this
    error,
  } = useProductCategories({
    search,
    status: status === "all" ? undefined : status === "true",
    page: currentPage,
    limit: pageSize,
    sort: "created_at",
    order: sort,
  });

  const toggleExpand = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleUpdate = async (data: z.infer<typeof formSchema>) => {
    if (!selectedCategory?.id) return;

    try {
      await updateCategory({
        id: selectedCategory.id,
        data: {
          name: data.name,
          description: data.description || "",
          status: data.status,
        },
      });
      setIsUpdateDialogOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(id);
      await deleteCategory(id);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = async (category: ProductCategory) => {
    try {
      const detailData = await getCategory(category.id);
      if (detailData?.data) {
        setSelectedCategory(detailData.data);
        setIsUpdateDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch category details:", error);
    }
  };

  const renderCategory = (category: ProductCategory, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
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
          <TableCell>{category.code}</TableCell>
          <TableCell>{category.description || "-"}</TableCell>
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
          category.children.map((child) => renderCategory(child, level + 1))}
      </React.Fragment>
    );
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
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Category
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new product category or subcategory
            </DialogDescription>
          </DialogHeader>
          <ProductCategoryForm
            categories={categories}
            onSubmit={async (data) => {
              await createCategory(data);
              setIsDialogOpen(false);
            }}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="flex flex-col max-h-[90vh]">
          <DialogHeader className="flex-none border-b bg-background pb-4">
            <DialogTitle>Update Category</DialogTitle>
            <DialogDescription>
              Update product category details
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            <ProductCategoryForm
              categories={categories}
              initialData={selectedCategory}
              onSubmit={handleUpdate}
              onClose={() => {
                setIsUpdateDialogOpen(false);
                setSelectedCategory(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handlePageChange(1);
            }}
            className="pl-8"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            handlePageChange(1);
          }}
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
          onValueChange={(value: "ASC" | "DESC") => {
            setSort(value);
            handlePageChange(1);
          }}
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={generateUniqueKey(`skeleton_${index}`)}>
                  {Array.from({ length: 6 }).map((_, cellIndex) => (
                    <TableCell
                      key={generateUniqueKey(`cell_${index}_${cellIndex}`)}
                    >
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : categories.length === 0 ? (
              <TableRow key={generateUniqueKey("empty_row")}>
                <TableCell colSpan={6} className="text-center py-8">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => renderCategory(category))
            )}
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
