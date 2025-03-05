"use client";

import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateProductByVariant } from "@/lib/store/slices/formInventoryProductSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';

export function VariantCombinations() {
  const dispatch = useDispatch();
  const variants = useSelector((state: RootState) => state.formInventoryProduct.product_by_variant);
  const mainSku = useSelector((state: RootState) => state.formInventoryProduct.sku);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  
  // Handler to update status of a variant
  const handleStatusToggle = (index: number, checked: boolean) => {
    if (!variants || !variants[index]) return;
    
    const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      status: checked
    };
    
    dispatch(updateProductByVariant(updatedVariants));
  };
  
  // Get unique codes for validation
  const getExistingCodes = (currentIndex: number) => {
    return variants
      .map((variant, idx) => (idx !== currentIndex ? variant.sku_product_unique_code : null))
      .filter(Boolean) as string[];
  };

  // Handler to update unique code
  const handleUniqueCodeChange = (index: number, code: string) => {
    if (!variants || !variants[index]) return;
    
    const updatedVariants = [...variants];
    const variant = updatedVariants[index];
    
    updatedVariants[index] = {
      ...variant,
      sku_product_unique_code: code,
      sku: `${mainSku}-${code}`
    };
    
    dispatch(updateProductByVariant(updatedVariants));
  };

  // Handler to update vendor SKU
  const handleVendorSkuChange = (index: number, value: string) => {
    if (!variants || !variants[index]) return;
    
    // Store in local state first
    const key = `vendor-${index}`;
    setLocalValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update redux when focus leaves the field
  const handleVendorSkuBlur = (index: number) => {
    if (!variants || !variants[index]) return;
    
    const updatedVariants = [...variants];
    const variant = updatedVariants[index];
    const key = `vendor-${index}`;
    
    updatedVariants[index] = {
      ...variant,
      vendor_sku: localValues[key] || variant.vendor_sku
    };
    
    dispatch(updateProductByVariant(updatedVariants));
  };
  
  // Generate default code
  const getDefaultCode = (index: number) => {
    return `V${String(index + 1).padStart(2, '0')}`;
  };
  
  // Reset unique code to default
  const handleResetUniqueCode = (index: number) => {
    const defaultCode = getDefaultCode(index);
    handleUniqueCodeChange(index, defaultCode);
  };
  
  // If there are no variants yet, show a placeholder
  if (!variants || variants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No variants configured. Add variants in the Basic Information section first.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-md font-medium">Variant SKUs</h3>
      
      <div className="overflow-auto">
        <div className="rounded-md border min-w-[640px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Product Name</TableHead>
                <TableHead>SKU Variant</TableHead>
                <TableHead className="w-[200px]">Unique Code</TableHead>
                <TableHead>Vendor SKU</TableHead>
                <TableHead className="w-[100px] text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant, index) => (
                <TableRow key={index}>
                  <TableCell>{variant.full_product_name}</TableCell>
                  <TableCell>
                    <FormItem className="space-y-2 mb-0">
                      <FormControl>
                        <Input
                          value={`${mainSku}-${variant.sku_product_unique_code}`}
                          className="font-mono bg-muted"
                          readOnly
                        />
                      </FormControl>
                      <FormDescription>
                        Generated SKU based on main SKU and unique code
                      </FormDescription>
                    </FormItem>
                  </TableCell>
                  <TableCell>
                    <FormItem className="space-y-2 mb-0">
                      <FormControl>
                        <div className="relative">
                          <Input
                            value={variant.sku_product_unique_code}
                            onChange={(e) => handleUniqueCodeChange(index, e.target.value)}
                            className="font-mono pr-8"
                            placeholder="0000"
                            maxLength={10}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                            onClick={() => handleResetUniqueCode(index)}
                            title={`Reset to default (${getDefaultCode(index)})`}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter 1-10 numeric or use the default code
                      </FormDescription>
                    </FormItem>
                  </TableCell>
                  <TableCell>
                    <FormItem className="space-y-2 mb-0">
                      <FormControl>
                        <Input
                          value={localValues[`vendor-${index}`] || variant.vendor_sku || ''}
                          onChange={(e) => handleVendorSkuChange(index, e.target.value)}
                          onBlur={() => handleVendorSkuBlur(index)}
                          placeholder="(Optional)"
                          maxLength={50}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional vendor reference number
                      </FormDescription>
                    </FormItem>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Switch
                        checked={variant.status ?? true}
                        onCheckedChange={(checked) => handleStatusToggle(index, checked)}
                        className="mx-auto"
                      />
                      <span className="text-xs mt-1 text-muted-foreground">
                        {(variant.status ?? true) ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}