'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Search } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationControls } from '@/components/ui/pagination/pagination-controls';
import { PaginationInfo } from '@/components/ui/pagination/pagination-info';
import { usePagination } from '@/lib/hooks/use-pagination';
import { useProductCategories } from '@/lib/hooks/use-product-categories';
import { formatDate } from '@/lib/utils/format';
import type { ProductCategory } from '@/types/product-category';

export default function ProductCategoriesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [sort, setSort] = useState<'ASC' | 'DESC'>('DESC');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination();

  const {
    categories,
    pagination,
    isLoading,
    error,
  } = useProductCategories({
    search,
    status: status === 'all' ? undefined : status === 'true',
    page: currentPage,
    limit: pageSize,
    sort: 'created_at',
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

  const renderCategory = (category: ProductCategory, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <>
        <TableRow key={category.id}>
          <TableCell className="font-medium">
            <div className="flex items-center" style={{ paddingLeft: `${level * 2}rem` }}>
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 mr-2"
                  onClick={() => toggleExpand(category.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {category.name}
            </div>
          </TableCell>
          <TableCell>{category.code}</TableCell>
          <TableCell>{category.description || '-'}</TableCell>
          <TableCell>
            <Badge variant={category.status ? 'default' : 'secondary'}>
              {category.status ? 'Active' : 'Inactive'}
            </Badge>
          </TableCell>
          <TableCell>{formatDate(category.created_at)}</TableCell>
          <TableCell>{formatDate(category.updated_at)}</TableCell>
        </TableRow>
        {hasChildren && isExpanded && category.children.map(child => 
          renderCategory(child, level + 1)
        )}
      </>
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
        <Button>
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
          onValueChange={(value: 'ASC' | 'DESC') => {
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
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 6 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map(category => renderCategory(category))
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