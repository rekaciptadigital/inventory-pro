import type { Category, CategoryTreeItem } from '@/types/category';

export function buildCategoryTree(categories: Category[]): CategoryTreeItem[] {
  const categoryMap = new Map<string, CategoryTreeItem>();
  const roots: CategoryTreeItem[] = [];

  // First pass: Create CategoryTreeItem objects for each category
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Second pass: Build the tree structure
  categories.forEach(category => {
    const node = categoryMap.get(category.id)!;
    if (category.parentId === null) {
      roots.push(node);
    } else {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  // Sort each level by order
  const sortChildren = (items: CategoryTreeItem[]) => {
    items.sort((a, b) => a.order - b.order);
    items.forEach(item => {
      if (item.children.length > 0) {
        sortChildren(item.children);
      }
    });
  };

  sortChildren(roots);
  return roots;
}

export function flattenCategoryTree(tree: CategoryTreeItem[]): Category[] {
  const result: Category[] = [];
  
  function traverse(node: CategoryTreeItem) {
    const { children, ...category } = node;
    result.push(category);
    children.forEach(traverse);
  }

  tree.forEach(traverse);
  return result;
}

export function getCategoryPath(
  categories: Category[],
  categoryId: string
): Category[] {
  const path: Category[] = [];
  let current = categories.find(cat => cat.id === categoryId);
  
  while (current) {
    path.unshift(current);
    current = current.parentId 
      ? categories.find(cat => cat.id === current!.parentId)
      : undefined;
  }
  
  return path;
}

export function getCategoryDepth(
  categories: Category[],
  categoryId: string | null
): number {
  if (!categoryId) return 0;
  
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) return 0;
  
  return 1 + getCategoryDepth(categories, category.parentId);
}