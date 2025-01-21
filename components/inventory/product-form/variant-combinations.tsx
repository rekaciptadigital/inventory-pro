"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  updateForm,
  selectProductNames,
  selectSkuInfo,
} from "@/lib/store/slices/formInventoryProductSlice";
import { useVariantTypes } from "@/lib/hooks/use-variant-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  VariantTypeSelector as VariantType,
  VariantValueSelector as VariantValue,
} from "./enhanced-selectors";
import type { ProductFormValues } from "./form-schema";
import type { Variant, VariantValue } from "@/types/variant";
import type { SelectOption } from "@/components/ui/enhanced-select";
import { useBrands } from "@/lib/hooks/use-brands";
import { useProductTypes } from "@/lib/hooks/use-product-types";
import { Input } from "@/components/ui/input";

/**
 * Interface untuk struktur data varian yang dipilih
 * typeId: ID numerik untuk tipe varian
 * values: Array string berisi nilai-nilai yang dipilih untuk tipe varian tersebut
 */
interface SelectedVariant {
  typeId: number; // Make sure this is number
  values: string[];
  availableValues?: string[]; // Add this to store available values from selected variant
}

/**
 * Komponen VariantCombinations
 *
 * Komponen ini menangani pembuatan dan pengelolaan kombinasi varian produk.
 * Memungkinkan pengguna untuk:
 * - Menambah/menghapus tipe varian
 * - Memilih nilai-nilai untuk setiap tipe varian
 * - Menghasilkan SKU otomatis berdasarkan kombinasi varian
 */
export function VariantCombinations() {
  const form = useFormContext<ProductFormValues>();
  const dispatch = useDispatch();
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>(
    []
  );
  const { variantTypes } = useVariantTypes(); // Add this hook

  /**
   * Hooks untuk mengambil data brands dan product types
   * Data ini digunakan untuk menampilkan nama brand dan tipe produk
   * dalam generated SKU
   */
  const { brands } = useBrands();
  const { productTypes } = useProductTypes();

  /**
   * Memantau perubahan nilai form menggunakan watch
   * Nilai-nilai ini digunakan untuk membuat SKU dan mengatur harga dasar
   */
  // Watch form values
  const brand = form.watch("brand");
  const productTypeId = form.watch("productTypeId");
  const sku = form.watch("sku");
  const productName = form.watch("productName");

  // Get brand and product type names
  const brandName = brands?.find((b) => b.id === brand)?.name || "";
  const productTypeName =
    productTypes?.find((pt) => pt.id === productTypeId)?.name || "";

  // Product details for SKU generation
  const productDetails = {
    brand: brandName,
    productType: productTypeName,
    productName,
  };

  /**
   * Fungsi untuk menambah baris varian baru
   * Menginisialisasi dengan typeId 0 dan array values kosong
   */
  const handleAddVariant = useCallback(() => {
    setSelectedVariants((prev) => [...prev, { typeId: 0, values: [] }]);

    // Update Redux store without touching the form
    const currentVariants = selectedVariants.map((variant) => ({
      variant_id: variant.typeId,
      variant_name:
        variantTypes?.find((vt) => vt.id === variant.typeId)?.name || "",
      variant_values: variant.values.map((value) => ({
        variant_value_id: 0,
        variant_value_name: value,
      })),
    }));

    dispatch(updateForm({ variants: currentVariants }));
  }, [dispatch, selectedVariants, variantTypes]);

  /**
   * Fungsi untuk menghapus baris varian berdasarkan index
   * Memperbarui state dan nilai form setelah penghapusan
   */
  const handleRemoveVariant = useCallback(
    (index: number) => {
      setSelectedVariants((prev) => {
        const newVariants = prev.filter((_, i) => i !== index);

        // Update Redux store
        const formattedVariants = newVariants
          .filter((v) => v.typeId)
          .map((variant) => {
            const variantType = variantTypes?.find(
              (vt) => vt.id === variant.typeId
            );
            return {
              variant_id: variant.typeId,
              variant_name: variantType?.name || "",
              variant_values: variant.values.map((value) => ({
                variant_value_id: 0,
                variant_value_name: value,
              })),
            };
          });

        dispatch(updateForm({ variants: formattedVariants }));

        // Update form value
        form.setValue("variants", formattedVariants, {
          shouldValidate: true,
          shouldDirty: true,
        });

        return newVariants;
      });
    },
    [dispatch, form, variantTypes]
  );

  /**
   * Fungsi untuk menangani perubahan tipe varian
   * Mereset nilai values menjadi array kosong saat tipe berubah
   */
  const handleTypeChange = useCallback(
    (index: number, selected: SelectOption | null) => {
      if (!selected?.data) return;

      console.log("Selected variant data:", selected.data); // Debug log

      setSelectedVariants((prev) => {
        const newVariants = prev.map((v, i) =>
          i === index
            ? {
                typeId: parseInt(selected.value),
                values: [],
                availableValues: selected.data.values, // Store available values from selected variant
              }
            : v
        );

        const formattedVariants = newVariants
          .filter((v) => v.typeId)
          .map((variant) => ({
            variant_id: variant.typeId,
            variant_name: selected.data.name,
            variant_values: [],
          }));

        setTimeout(() => {
          dispatch(updateForm({ variants: formattedVariants }));
        }, 0);

        return newVariants;
      });
    },
    [dispatch]
  );

  /**
   * Fungsi untuk memperbarui nilai-nilai varian yang dipilih
   * Memperbarui state dan nilai form ketika nilai dipilih
   */
  const handleValuesChange = (index: number, selected: SelectOption | null) => {
    if (!selected) return;

    setSelectedVariants((prev) => {
      const newVariants = prev.map((v, i) =>
        i === index
          ? {
              ...v,
              values: [selected.value],
            }
          : v
      );

      // Format variants for Redux store
      const formattedVariants = newVariants
        .filter((v) => v.typeId)
        .map((variant) => {
          const variantType = variantTypes?.find(
            (vt) => vt.id === variant.typeId
          );
          return {
            variant_id: variant.typeId,
            variant_name: variantType?.name || "",
            variant_values: variant.values.map((value) => ({
              variant_value_id: 0, // Since we're using string values directly
              variant_value_name: value,
            })),
          };
        });

      dispatch(
        updateForm({
          variants: formattedVariants,
        })
      );

      return newVariants;
    });
  };

  // Effect untuk inisialisasi data variant dari Redux jika ada
  useEffect(() => {
    const savedVariants = form.getValues("variants");
    if (savedVariants?.length) {
      const formattedVariants = savedVariants.map((variant) => ({
        typeId: variant.variant_id,
        values: variant.variant_values.map((v) =>
          v.variant_value_id.toString()
        ),
      }));
      setSelectedVariants(formattedVariants);
    }
  }, []);

  /**
   * Menyimpan daftar typeId yang sudah digunakan
   * Digunakan untuk mencegah pemilihan tipe varian yang sama
   */
  const usedTypeIds = selectedVariants.map((v) => v.typeId).filter(Boolean);

  const handleVariantChange = useCallback(
    (selectedVariants: Variant[]) => {
      // Transform the variants into the required format
      const formattedVariants = selectedVariants.map((variant) => ({
        variant_id: variant.id,
        variant_name: variant.name,
        variant_values: variant.selectedValues.map((value) => ({
          variant_value_id: value.id,
          variant_value_name: value.name,
        })),
      }));

      // Update Redux store
      dispatch(
        updateForm({
          variants: formattedVariants,
        })
      );
    },
    [dispatch]
  );

  const handleVariantValuesChange = useCallback(
    (variantId: number, selectedValues: VariantValue[]) => {
      // Update the specific variant's values
      dispatch(
        updateForm({
          variants: (prevVariants: any[]) => {
            const updatedVariants = prevVariants.map((variant) => {
              if (variant.variant_id === variantId) {
                return {
                  ...variant,
                  variant_values: selectedValues.map((value) => ({
                    variant_value_id: value.id,
                    variant_value_name: value.name,
                  })),
                };
              }
              return variant;
            });
            return updatedVariants;
          },
        })
      );
    },
    [dispatch]
  );

  // Get values from Redux store
  const { full_product_name } = useSelector(selectProductNames);
  const { sku: baseSku } = useSelector(selectSkuInfo);

  // Generate combinations function
  const generateCombinations = (variants: SelectedVariant[]) => {
    if (variants.length === 0) return [[]];

    const [first, ...rest] = variants;
    const restCombinations = generateCombinations(rest);

    return first.values.flatMap((value) =>
      restCombinations.map((combo) => [value, ...combo])
    );
  };

  // Format variant combination for display
  const formatVariantCombo = (combo: string[]) => {
    return combo.join(" / ");
  };

  // Tambahkan state untuk menyimpan unique codes
  const [variantUniqueCodes, setVariantUniqueCodes] = useState<
    Record<string, string>
  >({});

  // Generate sequential unique code
  const generateUniqueCode = useCallback((index: number) => {
    return String(index + 1).padStart(3, "0");
  }, []);

  // Handle unique code change
  const handleUniqueCodeChange = useCallback(
    (skuKey: string, value: string) => {
      setVariantUniqueCodes((prev) => ({
        ...prev,
        [skuKey]: value.replace(/\D/g, ""), // Only allow numbers
      }));
    },
    []
  );

  // Gunakan useMemo untuk data yang dikalkulasi
  const variantData = useMemo(() => {
    const filteredVariants = selectedVariants.filter(
      (v) => v.values.length > 0
    );
    const combinations = generateCombinations(filteredVariants);

    return combinations.map((combo, index) => {
      const variantCombo = formatVariantCombo(combo);
      const productName = `${full_product_name} ${variantCombo}`;
      const skuKey = `${baseSku}-${combo.join("-")}`;
      const defaultUniqueCode = generateUniqueCode(index);
      const uniqueCode = variantUniqueCodes[skuKey] || defaultUniqueCode;

      return {
        skuKey,
        productName,
        uniqueCode,
        combo,
      };
    });
  }, [selectedVariants, full_product_name, baseSku, variantUniqueCodes]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {selectedVariants.map((variant, index) => {
          console.log("Variant data:", variant); // Debug log

          return (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <VariantType
                  value={
                    variant.typeId
                      ? {
                          value: variant.typeId.toString(),
                          label:
                            variantTypes?.find((vt) => vt.id === variant.typeId)
                              ?.name || "",
                          data: variantTypes?.find(
                            (vt) => vt.id === variant.typeId
                          ),
                        }
                      : null
                  }
                  onChange={(selected) => handleTypeChange(index, selected)}
                  excludeIds={usedTypeIds.filter((id) => id !== variant.typeId)}
                />
              </div>
              <div className="flex-1">
                <VariantValue
                  values={variant.availableValues || []} // Use stored available values
                  value={
                    variant.values[0]
                      ? {
                          value: variant.values[0],
                          label: variant.values[0],
                          data: variant.values[0],
                        }
                      : null
                  }
                  onChange={(selected) => handleValuesChange(index, selected)}
                  isDisabled={!variant.typeId}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveVariant(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}

        <Button type="button" variant="outline" onClick={handleAddVariant}>
          <Plus className="mr-2 h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {variantData.length > 0 && (
        <div className="border rounded-lg p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Generated SKUs</h4>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Full Product Name</TableHead>
                    <TableHead>SKU Variant</TableHead>
                    <TableHead className="w-[200px]">Unique Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variantData.map(
                    ({ skuKey, productName, uniqueCode, combo }) => (
                      <TableRow key={skuKey}>
                        <TableCell>{productName}</TableCell>
                        <TableCell className="font-medium">{skuKey}</TableCell>
                        <TableCell>
                          <Input
                            value={uniqueCode}
                            onChange={(e) =>
                              handleUniqueCodeChange(skuKey, e.target.value)
                            }
                            className="w-[120px]"
                            placeholder="Enter unique code"
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
      )}
    </div>
  );
}
