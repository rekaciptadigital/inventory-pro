import type { SelectOption } from "@/components/ui/enhanced-select";

// Original VariantValue type from the system
export interface VariantValue {
  id: string;
  name: string;  // This is the key property we use for display/conversion
  [key: string]: any;
}

export interface VariantValueData {
  variant_value_id: string;
  variant_value_name: string;
}

// Update to match the structure from useVariantTypes hook
export interface VariantTypeData {
  id: number;
  name: string;
  values: VariantValue[] | string[];
  display_order: number;
}

export interface SelectedVariant {
  id: string;
  typeId: number;
  values: string[];
  availableValues?: string[] | VariantValue[];
  display_order?: number;
}

export interface VariantTableData {
  originalSkuKey: string;
  skuKey: string;
  productName: string;
  uniqueCode: string;
  vendorSku?: string;
  combo?: string[];
}

export interface CurrentSelector {
  id: number;
  name: string;
  values: string[];
  selected_values: string[];
}

export interface ExistingVariant {
  variant_id: number;
  variant_name: string;
  variant_values: Array<{
    variant_value_id: string;
    variant_value_name: string;
  }>;
}

export interface VariantSelectorData {
  id: number;
  name: string;
  values: string[];
  selected_values?: string[];
  display_order?: number;
}

export interface HandleCodeUpdates {
  handleUniqueCodeChange: (originalSkuKey: string, value: string) => void;
  handleInputBlur: (originalSkuKey: string, value: string) => void;
  handleResetUniqueCode: (originalSkuKey: string) => void;
  handleStatusToggle: (sku: string, checked: boolean) => void;
  handleVendorSkuChange: (originalSkuKey: string, value: string) => void;
  handleVendorSkuBlur: (originalSkuKey: string, value: string) => void;
}

export interface VariantManagerReturn {
  selectedVariants: SelectedVariant[];
  variantUniqueCodes: Record<string, string>;
  localValues: Record<string, string>;
  skuStatuses: Record<string, boolean>;
  skipReduxUpdate: boolean;
  handleAddVariant: () => void;
  handleRemoveVariant: (variantId: string) => void;
  handleTypeChange: (variantId: string, selected: SelectOption | null) => void;
  handleValuesChange: (variantId: string, selected: SelectOption[]) => void;
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  usedTypeIds: number[];
  handleVariantCodeUpdate: {
    handleUniqueCodeChange: (originalSkuKey: string, value: string) => void;
    handleInputBlur: (originalSkuKey: string, value: string) => void;
    handleResetUniqueCode: (originalSkuKey: string) => void;
    handleStatusToggle: (sku: string, checked: boolean) => void;
    handleVendorSkuChange: (originalSkuKey: string, value: string) => void;
    handleVendorSkuBlur: (originalSkuKey: string, value: string) => void;
    initializeVariants: (initialVariants: SelectedVariant[], variantSelectorData: VariantSelectorData[]) => void;
  };
}

export interface VariantManagerProps {
  variantTypes: any; // Update to accept any variant types structure
  existingVariants: ExistingVariant[];
  variantSelectors: VariantSelectorData[];
  dispatch: any;
}

export interface CombinationsGeneratorProps {
  selectedVariants: SelectedVariant[];
  variantTypes: any; // Update to accept any variant types structure
  variantUniqueCodes: Record<string, string>;
  baseSku: string;
  full_product_name: string;
}
