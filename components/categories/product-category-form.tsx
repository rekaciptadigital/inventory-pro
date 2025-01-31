'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { ProductCategory } from "@/types/product-category";
import { ChevronRight } from "lucide-react";

// Komponen form untuk membuat dan mengedit kategori produk
// Menggunakan React Hook Form untuk validasi dan state management
// Mendukung operasi create dan update dengan tampilan yang berbeda

// Skema validasi form menggunakan Zod
const formSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  parent_id: z.number().nullable().optional(),
  status: z.boolean().default(true),
});

interface ProductCategoryFormProps {
  readonly onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  readonly categories: ProductCategory[];
  readonly onClose: () => void;
  readonly isSubmitting?: boolean;
  readonly initialData?: ProductCategory;
  readonly buttonText: string;
}

interface ParentInfoProps {
  readonly parent: ProductCategory & { parents?: ProductCategory[] };
}

// Komponen untuk menampilkan informasi parent kategori
function ParentInfo({ parent }: Readonly<ParentInfoProps>) {
  if (!parent.parents?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-muted-foreground">
        Parent Information
      </h4>
      <div className="bg-muted/50 rounded-lg p-4 max-h-[200px] overflow-y-auto">
        <div className="space-y-4">
          {parent.parents.map((p, index) => (
            <div key={p.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Level {parent.parents!.length - index}
                </span>
                <span className="font-medium">{p.name}</span>
              </div>
              {p.description && (
                <p className="text-sm text-muted-foreground">
                  {p.description}
                </p>
              )}
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground">
              Current Category
            </p>
            <p className="font-medium text-primary">{parent.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductCategoryForm({
  onSubmit,
  categories,
  onClose,
  isSubmitting = false,
  initialData,
  buttonText,
}: ProductCategoryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      parent_id: initialData ? undefined : null, // Only set parent_id for new categories
      status: initialData?.status ?? true,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  // Flatten categories for the select input
  const flattenCategories = (
    cats: ProductCategory[],
    level = 0,
    result: Array<{ id: number; name: string; level: number }> = []
  ) => {
    cats.forEach((cat) => {
      result.push({ id: cat.id, name: cat.name, level });
      if (cat.children?.length) {
        flattenCategories(cat.children, level + 1, result);
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories);

  const hasParents = initialData?.parents && Array.isArray(initialData.parents) && initialData.parents.length > 0;

  // Fungsi-fungsi utama:
  // - handleSubmit: Menangani submit form
  // - flattenCategories: Mengubah struktur hierarki menjadi flat untuk select input
  // - renderCategoryPath: Menampilkan path kategori untuk mode edit
  const renderCategoryPath = () => {
    if (!hasParents || !initialData?.parents) {
      return null;
    }

    const reversedParents = [...initialData.parents].reverse();

    return (
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Category Path
          </h4>
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            {reversedParents.map((parent, index, array) => (
              <div key={parent.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Level {array.length - index}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{parent.name}</span>
                </div>
                {parent.description && (
                  <p className="text-sm text-muted-foreground ml-6">
                    {parent.description}
                  </p>
                )}
              </div>
            ))}
            <div className="space-y-1 border-t pt-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-primary">
                  {initialData.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Form {...form}>
      <div className="relative">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-6 pb-16">
            {" "}
            {/* Add padding bottom for footer space */}
            {/* Parent Information Section */}
            {initialData?.parent_id && <ParentInfo parent={initialData} />}
            {renderCategoryPath()}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter category description (optional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!initialData && (
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "null" ? null : Number(value))
                      }
                      value={field.value?.toString() ?? "null"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent category (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">None (Top Level)</SelectItem>
                        {flatCategories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                            className="pl-[var(--indent)]"
                            style={
                              {
                                "--indent": `${category.level * 1.5}rem`,
                              } as any
                            }
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Leave empty to create a top-level category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription>
                      Category will{" "}
                      {field.value ? "be visible" : "not be visible"} in the
                      system
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Fixed Footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {buttonText}
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
}
