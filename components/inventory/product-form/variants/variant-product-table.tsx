import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { SkuFormGroup } from "./sku-form-group";

interface VariantTableData {
  readonly originalSkuKey: string;
  readonly skuKey: string;
  readonly productName: string;
  readonly uniqueCode: string;
}

interface VariantProductTableProps {
  readonly variantData: readonly VariantTableData[];
  readonly skuStatuses: Readonly<Record<string, boolean>>;
  readonly localValues: Readonly<Record<string, string>>;
  readonly handleCodeUpdates: Readonly<{
    readonly handleUniqueCodeChange: (originalSkuKey: string, value: string) => void;
    readonly handleInputBlur: (originalSkuKey: string, value: string) => void;
    readonly handleResetUniqueCode: (originalSkuKey: string) => void;
    readonly handleStatusToggle: (sku: string, checked: boolean) => void;
    readonly handleVendorSkuChange: (originalSkuKey: string, value: string) => void;
    readonly handleVendorSkuBlur: (originalSkuKey: string, value: string) => void;
  }>;
}

export function VariantProductTable({
  variantData,
  skuStatuses,
  localValues,
  handleCodeUpdates
}: VariantProductTableProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Generated SKUs</h4>
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
                {variantData.map(
                  ({ originalSkuKey, skuKey, productName, uniqueCode }) => (
                    <TableRow key={skuKey}>
                      <TableCell>{productName}</TableCell>
                      <TableCell colSpan={3}>
                        <SkuFormGroup 
                          originalSkuKey={originalSkuKey}
                          skuKey={skuKey}
                          uniqueCode={uniqueCode}
                          localValues={localValues}
                          handleUniqueCodeChange={handleCodeUpdates.handleUniqueCodeChange}
                          handleInputBlur={handleCodeUpdates.handleInputBlur}
                          handleResetUniqueCode={handleCodeUpdates.handleResetUniqueCode}
                          handleVendorSkuChange={handleCodeUpdates.handleVendorSkuChange}
                          handleVendorSkuBlur={handleCodeUpdates.handleVendorSkuBlur}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={skuStatuses[originalSkuKey] ?? true}
                          onCheckedChange={(checked) => 
                            handleCodeUpdates.handleStatusToggle(originalSkuKey, checked)
                          }
                          className="mx-auto"
                        />
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
