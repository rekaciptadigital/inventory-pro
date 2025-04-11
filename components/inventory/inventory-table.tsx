import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useInventory } from "@/lib/hooks/inventory/use-inventory";
import type { InventoryProduct } from "@/types/inventory";

// Define proper component props interface
interface InventoryTableProps {
  data: InventoryProduct[];
  onRefresh?: () => void;
}

export function InventoryTable({ data, onRefresh }: Readonly<InventoryTableProps>) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();
  const { deleteProduct } = useInventory();
  
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    
    try {
      await deleteProduct(id);
      // Show success toast - change variant from "success" to "default"
      toast({
        title: "Product Deleted",
        description: "The product has been successfully removed.",
        variant: "default", // Changed from "success" to "default"
      });
      
      // Call onRefresh to update the list
      if (onRefresh) onRefresh();
    } catch (error) {
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to delete the product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Instead of defining a separate function, use the delete button directly in the render method
  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        {/* ...existing table header code... */}
        <tbody>
          {data.map((product) => (
            <tr key={product.id}>
              {/* ...existing product data cells... */}
              <td className="p-2 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(Number(product.id))}
                  disabled={deletingId === Number(product.id)}
                  className="text-destructive hover:text-destructive/90"
                >
                  {deletingId === Number(product.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4" />
                  )}
                </Button>
                {/* ...any other action buttons... */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}