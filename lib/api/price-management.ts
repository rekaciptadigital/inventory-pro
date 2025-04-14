import axiosInstance from './axios';
import type { ApiResponse } from '@/types/api';
import type { InventoryProduct } from '@/types/inventory';

export interface PriceManagementFilters {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export async function getPriceManagementProducts(
  filters: PriceManagementFilters = {}
): Promise<ApiResponse<InventoryProduct[]>> {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.order) params.append('order', filters.order);

  const response = await axiosInstance.get(`/inventory?${params.toString()}`);
  return response.data;
}

// New interfaces for price detail API
export interface PriceDetail {
  id: number;
  inventory_product_id: number;
  product_name: string; // Add this missing property
  usd_price: number;
  exchange_rate: number;
  adjustment_percentage: number;
  price_hb_real: number;
  hb_adjustment_price: number;
  is_manual_product_variant_price_edit: boolean;
  is_enable_volume_discount: boolean;
  is_enable_volume_discount_by_product_variant: boolean;
  customer_category_prices: CustomerCategoryPrice[];
  marketplace_category_prices?: MarketplaceCategoryPrice[];
  product_variant_prices: ProductVariantPrice[];
  global_volume_discounts: VolumeDiscount[];
  variant_volume_discounts: VariantVolumeDiscount[];
}

export interface CustomerCategoryPrice {
  id: number;
  price_category_id: number;
  price_category_name: string;
  formula: string;
  percentage: number;
  set_default: boolean;
  pre_tax_price: number;
  tax_inclusive_price: number;
  tax_id: number;
  tax_percentage: number;
  is_custom_tax_inclusive_price: boolean;
  price_category_custom_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceCategoryPrice {
  id: number;
  price_category_id: number;
  price_category_name: string;
  price_category_percentage: number;
  price_category_set_default: boolean;
  price: number;
  price_category_custom_percentage: number;
  is_custom_price_category: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariantPrice {
  variant_id: string;
  variant_name: string;
  sku_product_variant?: string;
  status?: boolean;
  price_categories: VariantPriceCategory[];
  usd_price?: number;
  exchange_rate?: number;
  adjustment_percentage?: number;
}

export interface VariantPriceCategory {
  id: number;
  price: number | null;
  price_category_name: string;
  percentage: number;
  type: string;
  set_default: boolean;
}

export interface VolumeDiscount {
  id: string;
  quantity: number;
  discount_percentage: number;
  global_volume_discount_price_categories: VolumeDiscountPriceCategory[];
  created_at: string;
  updated_at: string;
}

export interface VariantVolumeDiscount {
  id: string;
  variant_id: string;
  variant_name: string;
  variant_sku: string;
  inventory_product_volume_discount_variant_quantities: VariantVolumeDiscountQuantity[];
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface VariantVolumeDiscountQuantity {
  id: string;
  quantity: number;
  discount_percentage: number;
  inventory_product_volume_discount_variant_price_categories: VolumeDiscountPriceCategory[];
}

export interface VolumeDiscountPriceCategory {
  id: string;
  price_category_id: number;
  price_category_name: string;
  price_category_type: string;
  price_category_percentage: number;
  price_category_set_default: boolean;
  price: number;
}

// New function to get general inventory product details
export async function getInventoryProductDetail(id: string): Promise<ApiResponse<InventoryProduct>> {
  const response = await axiosInstance.get(`/inventory/${id}`);
  return response.data;
}

// New function to get price details for a specific product
export async function getPriceDetail(id: string): Promise<ApiResponse<PriceDetail>> {
  const response = await axiosInstance.get(`/inventory-price/${id}`);
  return response.data;
}