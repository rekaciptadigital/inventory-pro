import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getInventoryProducts, 
  deleteInventoryProduct, 
  getInventoryProduct, // Add this import
  InventoryFilters 
} from '@/lib/api/inventory';
import type { InventoryProduct } from '@/types/inventory';
import type { PaginationData } from '@/types/api';

interface UseInventoryResult {
  products: InventoryProduct[];
  pagination: PaginationData | null;
  isLoading: boolean;
  error: Error | null;
  deleteProduct: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
  getProduct: (id: string) => Promise<InventoryProduct>; // Add this function signature
}

// Fungsi untuk menghasilkan kunci pencarian yang lebih cepat untuk pencarian produk
const generateSearchableKeys = (product: InventoryProduct): string => {
  const keys = [
    product.sku,
    product.product_name,
    product.full_product_name,
    product.vendor_sku,
    // Tambahkan variant SKUs
    ...(product.product_by_variant?.map(v => [
      v.sku_product_variant,
      v.sku_vendor
    ].filter(Boolean)) || [])
  ].filter(Boolean).join('|').toLowerCase();
  
  return keys;
};

export function useInventory(filters: InventoryFilters = {}): UseInventoryResult {
  const [allProducts, setAllProducts] = useState<InventoryProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<InventoryProduct[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  
  // Refs untuk membandingkan perubahan
  const prevFiltersStringRef = useRef<string>('');
  const prevSearchTermRef = useRef<string | undefined>(undefined);
  const prevPageRef = useRef<number | undefined>(undefined);
  
  // Cache untuk hasil pencarian
  const searchCacheRef = useRef<Record<string, InventoryProduct[]>>({});
  
  // Index pencarian untuk pencarian yang lebih cepat
  const searchIndexRef = useRef<Map<string, string[]>>(new Map());
  
  // Fungsi untuk membuat index pencarian dari produk
  const buildSearchIndex = useCallback((products: InventoryProduct[]) => {
    const index = new Map<string, string[]>();
    
    // Buat indeks dengan memecah kata dalam string yang dapat dicari
    products.forEach(product => {
      const productId = product.id.toString();
      const searchableText = generateSearchableKeys(product);
      
      // Bagi menjadi kata-kata individual dan tambahkan ke indeks
      const words = searchableText.split(/[\s|]+/).filter(Boolean);
      
      words.forEach(word => {
        if (!index.has(word)) {
          index.set(word, []);
        }
        index.get(word)?.push(productId);
      });
    });
    
    searchIndexRef.current = index;
  }, []);
  
  // Fungsi pencarian yang lebih efisien menggunakan indeks
  const searchInProducts = useCallback((products: InventoryProduct[], searchTerm: string) => {
    if (!searchTerm) return products;
    
    const lowerSearch = searchTerm.trim().toLowerCase();
    const cacheKey = lowerSearch;
    
    // Periksa cache terlebih dahulu
    if (searchCacheRef.current[cacheKey]) {
      return searchCacheRef.current[cacheKey];
    }
    
    // Jika pencarian terlalu pendek, gunakan filter standar
    if (lowerSearch.length < 3) {
      const results = products.filter(product => {
        const searchableText = generateSearchableKeys(product);
        return searchableText.includes(lowerSearch);
      });
      
      // Cache hasilnya
      searchCacheRef.current[cacheKey] = results;
      return results;
    }
    
    // Jika indeks pencarian ada, gunakan untuk pencarian cepat
    if (searchIndexRef.current.size > 0) {
      // Bagi istilah pencarian menjadi kata-kata
      const searchWords = lowerSearch.split(/\s+/).filter(Boolean);
      
      // Mulai dengan semua ID produk yang cocok dengan kata pertama
      let matchingIds: string[] = [];
      
      // Untuk setiap kata dalam pencarian
      searchWords.forEach((word, index) => {
        // Cari produk yang cocok dengan kata saat ini
        const matches: string[] = [];
        
        // Periksa semua kunci dalam indeks yang berisi kata pencarian
        for (const [key, productIds] of searchIndexRef.current.entries()) {
          if (key.includes(word)) {
            matches.push(...productIds);
          }
        }
        
        // Jika ini adalah kata pertama, ini adalah set awal
        if (index === 0) {
          matchingIds = [...new Set(matches)];
        } else {
          // Jika tidak, pertahankan hanya ID yang cocok dengan semua kata sebelumnya
          matchingIds = matchingIds.filter(id => matches.includes(id));
        }
      });
      
      // Hanya pertahankan produk yang memiliki ID yang cocok
      const results = products.filter(product => 
        matchingIds.includes(product.id.toString()));
      
      // Cache hasil pencarian
      searchCacheRef.current[cacheKey] = results;
      return results;
    }
    
    // Fallback ke pencarian standar
    const results = products.filter(product => {
      const searchableText = generateSearchableKeys(product);
      return searchableText.includes(lowerSearch);
    });
    
    // Cache hasilnya
    searchCacheRef.current[cacheKey] = results;
    return results;
  }, []);
  
  // Fungsi untuk memuat semua data untuk pencarian
  const fetchAllForSearch = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    setIsSearchMode(true);
    
    try {
      // Jika kita sudah memiliki cukup data di allProducts, gunakan itu
      if (allProducts.length > 50) {
        console.log('Using cached products for search');
        const results = searchInProducts(allProducts, searchTerm);
        updateSearchResults(results, searchTerm);
        return;
      }
      
      // Ambil data dengan limit yang besar
      const response = await getInventoryProducts({
        limit: 100,
        sort: filters.sort,
        order: filters.order
      });
      
      if (response?.data) {
        const products = response.data;
        
        // Simpan semua produk
        setAllProducts(products);
        
        // Buat indeks pencarian
        buildSearchIndex(products);
        
        // Lakukan pencarian
        const results = searchInProducts(products, searchTerm);
        updateSearchResults(results, searchTerm);
      }
    } catch (err) {
      console.error('Error fetching all products for search:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [searchInProducts, filters.sort, filters.order, filters.limit, filters.page, allProducts.length, buildSearchIndex]);
  
  // Fungsi helper untuk memperbarui UI dengan hasil pencarian
  const updateSearchResults = useCallback((results: InventoryProduct[], searchTerm: string) => {
    const pageSize = filters.limit ?? 10;
    const currentPage = filters.page ?? 1;
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pagedResults = results.slice(startIdx, endIdx);
    
    setFilteredProducts(pagedResults);
    
    // Update pagination
    setPagination({
      totalItems: results.length,
      pageSize: pageSize,
      totalPages: Math.ceil(results.length / pageSize),
      currentPage: currentPage,
      hasNext: endIdx < results.length,
      hasPrevious: currentPage > 1,
      links: {
        first: "",
        previous: currentPage > 1 ? "" : null,
        current: "",
        next: endIdx < results.length ? "" : null,
        last: ""
      }
    });
    
    console.log(`Search found ${results.length} items, showing ${pagedResults.length} for page ${currentPage}`);
  }, [filters.limit, filters.page]);
  
  // Fungsi untuk memuat data normal tanpa pencarian
  const fetchNormalPage = useCallback(async () => {
    // Create a string representation of the filters to compare with previous filters
    const currentFiltersString = JSON.stringify({
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort,
      order: filters.order
    });
    
    // If the filters haven't changed and we already loaded data, don't refetch
    if (currentFiltersString === prevFiltersStringRef.current && initialLoadDone && !isSearchMode) {
      return;
    }
    
    // Save current filters for future comparison
    prevFiltersStringRef.current = currentFiltersString;
    
    setIsLoading(true);
    setIsSearchMode(false);
    
    try {
      const apiFilters = {
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
        order: filters.order
      };
      
      console.log('Fetching normal page with filters:', apiFilters);
      const response = await getInventoryProducts(apiFilters);
      
      if (response?.data) {
        const products = response.data;
        setAllProducts(prev => {
          // Kelola cache produk untuk pencarian cepat
          const existingIds = new Set(prev.map(p => p.id.toString()));
          const newProducts = products.filter(p => !existingIds.has(p.id.toString()));
          
          if (newProducts.length > 0) {
            // Hanya perbarui indeks jika ada produk baru
            const updatedProducts = [...prev, ...newProducts];
            buildSearchIndex(updatedProducts);
            return updatedProducts;
          }
          return prev;
        });
        
        setFilteredProducts(products);
        setPagination(response.pagination || null);
        console.log(`Normal page loaded: ${products.length} items`);
      } else {
        setAllProducts([]);
        setFilteredProducts([]);
        setPagination(null);
      }
      
      setInitialLoadDone(true);
    } catch (err) {
      console.error('Error fetching normal page:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [filters.page, filters.limit, filters.sort, filters.order, initialLoadDone, isSearchMode, buildSearchIndex]);
  
  // Handle initial load and search mode changes
  useEffect(() => {
    // Only make API calls when search term or page changes
    const searchTermChanged = filters.search !== prevSearchTermRef.current;
    const pageChanged = filters.page !== prevPageRef.current;
    
    // Update refs for next comparison
    prevSearchTermRef.current = filters.search;
    prevPageRef.current = filters.page;
    
    // If search term changed
    if (searchTermChanged) {
      if (filters.search) {
        fetchAllForSearch(filters.search);
      } else if (initialLoadDone) {
        // If search was cleared, return to normal mode
        fetchNormalPage();
      }
    } 
    // If in search mode and page changed, update page from cached results
    else if (isSearchMode && pageChanged && filters.search) {
      const pageSize = filters.limit ?? 10;
      const currentPage = filters.page ?? 1;
      const startIdx = (currentPage - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      
      // Filter from allProducts
      const results = searchInProducts(allProducts, filters.search);
      const pagedResults = results.slice(startIdx, endIdx);
      
      setFilteredProducts(pagedResults);
      
      // Update pagination
      setPagination(prev => {
        if (!prev) return null;
        return {
          ...prev,
          currentPage: currentPage,
          hasNext: endIdx < results.length,
          hasPrevious: currentPage > 1,
          links: {
            ...prev.links,
            previous: currentPage > 1 ? "" : null,
            next: endIdx < results.length ? "" : null
          }
        };
      });
    } 
    // If in normal mode and page changed, fetch that page
    else if (!isSearchMode && pageChanged) {
      fetchNormalPage();
    }
    // Initial load
    else if (!initialLoadDone) {
      if (filters.search) {
        fetchAllForSearch(filters.search);
      } else {
        fetchNormalPage();
      }
    }
  }, [
    filters.search, 
    filters.page, 
    initialLoadDone, 
    fetchAllForSearch, 
    fetchNormalPage, 
    isSearchMode, 
    allProducts, 
    searchInProducts, 
    filters.limit
  ]);

  const deleteProduct = async (id: number) => {
    setIsLoading(true);
    try {
      await deleteInventoryProduct(id);
      // Re-fetch based on current mode
      if (isSearchMode && filters.search) {
        await fetchAllForSearch(filters.search);
      } else {
        await fetchNormalPage();
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = useCallback(async () => {
    if (isSearchMode && filters.search) {
      await fetchAllForSearch(filters.search);
    } else {
      await fetchNormalPage();
    }
  }, [isSearchMode, filters.search, fetchAllForSearch, fetchNormalPage]);

  // Add the getProduct function implementation
  const getProduct = useCallback(async (id: string): Promise<InventoryProduct> => {
    try {
      const response = await getInventoryProduct(id);
      return response.data;
    } catch (err) {
      console.error('Error fetching product details:', err);
      throw err;
    }
  }, []);

  return {
    products: filteredProducts,
    pagination,
    isLoading,
    error,
    deleteProduct,
    refetch,
    getProduct, // Add this to the returned object
  };
}