'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { validateProductTypeCode } from '@/lib/utils/product-type-code';
import type { ProductType, ProductTypeFormData } from '@/types/product-type';
import axiosInstance from '@/lib/api/axios';

const formSchema = z.object({
  name: z.string().min(1, 'Product type name is required'),
  code: z.string()
    .refine(
      (val) => val === '' || validateProductTypeCode(val),
      'Code must be 2 alphanumeric characters'
    ),
  description: z.string().optional(),
  status: z.boolean().default(true),
});

interface ProductTypeFormProps {
  onSubmit: (data: ProductTypeFormData) => Promise<void>;
  initialData?: ProductType;
  isSubmitting?: boolean;
  existingCodes?: string[];
}

export function ProductTypeForm({ 
  onSubmit, 
  initialData, 
  isSubmitting,
  existingCodes = []
}: Readonly<ProductTypeFormProps>) {
  const { toast } = useToast();
  const form = useForm<ProductTypeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      code: initialData?.code ?? '',
      description: initialData?.description ?? '',
      status: initialData?.status ?? true,
    },
  });

  // Helper function to check if code exists in the API with better error handling
  const checkCodeExists = async (code: string): Promise<boolean> => {
    try {
      const params = new URLSearchParams({
        search: code,
        exact_match: 'true',
        limit: '1' // Only need one result to confirm existence
      });
      const response = await axiosInstance.get(`/product-types?${params.toString()}`);
      
      // If we got data and found the exact code
      if (response.data?.data) {
        return response.data.data.some((item: any) => item.code === code);
      }
      return false;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      // Log the error for debugging purposes
      console.error("Failed to check if code exists:", error);
      // Return true as a conservative fallback (assume code might exist to avoid duplicates)
      return true;
    }
  };

  // Fetch all product types from server to check codes
  const fetchAllProductTypes = async (): Promise<ProductType[]> => {
    try {
      // Use pagination to get all product types if there are many
      let allProductTypes: ProductType[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      
      while (hasMorePages && currentPage <= 10) { // Safety limit of 10 pages
        try {
          const response = await axiosInstance.get(`/product-types?limit=100&page=${currentPage}`);
          
          if (!response.data?.data || response.data.data.length === 0) {
            break;
          }
          
          allProductTypes = [...allProductTypes, ...response.data.data];
          
          // Check if there are more pages
          hasMorePages = response.data.pagination?.hasNext === true;
          currentPage++;
        } catch (pageError) {
          console.error("Error fetching product types page:", pageError);
          break; // Stop on error but return what we have so far
        }
      }
      
      return allProductTypes;
    } catch (error) {
      console.error("Error fetching all product types:", error);
      return [];
    }
  };

  // Generate a unique code with improved logic - prioritize alphabetic codes
  const generateUniqueCode = async (): Promise<string | null> => {
    try {
      // First, get ALL existing product types from server
      const allProductTypes = await fetchAllProductTypes();
      const allCodes = allProductTypes
        .filter(item => item && typeof item.code === 'string')
        .map(item => item.code);
      
      // Extract all existing codes (we need the full codes, not just prefixes)
      const existingCodes = new Set(allCodes.map(code => code.toUpperCase()));
      
      // Get product name to use for candidate generation
      const productName = form.getValues('name').trim();
      
      // Generate alphabetic code candidates, starting with 2-char codes
      const alphabeticCandidates = generateAlphabeticCandidates(productName, existingCodes);
      
      // Try each candidate and verify with server
      for (const code of alphabeticCandidates) {
        // First check locally with our fetched data
        if (!existingCodes.has(code.toUpperCase())) {
          // Double-check with server
          try {
            const codeExists = await verifyCodeWithServer(code);
            if (!codeExists) {
              return code;
            }
          } catch (error) {
            // Log the error but continue trying other codes
            console.error(`Failed to verify code ${code} with server:`, error);
            // Mark this code as potentially existing by adding it to existingCodes
            existingCodes.add(code.toUpperCase());
            // Explicitly handle error by continuing to next candidate
            continue;
          }
        }
      }
      
      // If all candidates failed, try fallback with 4-letter code
      const fallbackCode = generateFallbackCode(existingCodes);
      return fallbackCode;
      
    } catch (error) {
      // Log the error properly before falling back
      console.error("Error generating unique code:", error);
      
      // Last resort fallback that should always work
      const timestamp = new Date().toISOString().replace(/\D/g, '').slice(-6);
      const randomChar = 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)];
      return `${randomChar}${timestamp.slice(-2)}`;
    }
  };

  // Generate alphabetic code candidates from name, with progressive length
  const generateAlphabeticCandidates = (name: string, existingCodes: Set<string>): string[] => {
    const candidates: string[] = [];
    const cleanName = name.replace(/[^A-Za-z]/g, '').toUpperCase();
    const words = name.split(/\s+/).filter(word => word.length > 0);
    
    // Add candidates from all strategies
    addTwoLetterCandidatesFromName(candidates, cleanName, words);
    addCommonTwoLetterPrefixes(candidates);
    addThreeLetterCandidatesFromName(candidates, cleanName, words);
    
    // Remove duplicates
    const uniqueCandidates = [...new Set(candidates)];
    
    // Add additional candidates if needed
    addAdditionalTwoLetterCandidates(uniqueCandidates);
    addSystematicThreeLetterCombos(uniqueCandidates);
    
    // Sort by priority
    return sortCandidatesByPriority(uniqueCandidates, existingCodes);
  };

  // Add two-letter candidates derived from the product name
  const addTwoLetterCandidatesFromName = (candidates: string[], cleanName: string, words: string[]): void => {
    // Strategy 1: First two letters
    if (cleanName.length >= 2) {
      candidates.push(cleanName.substring(0, 2));
    }
    
    // Strategy 2: First and third letter
    if (cleanName.length >= 3) {
      candidates.push(cleanName.charAt(0) + cleanName.charAt(2));
    }
    
    // Strategy 3: First and last letter
    if (cleanName.length >= 2) {
      candidates.push(cleanName.charAt(0) + cleanName.charAt(cleanName.length - 1));
    }
    
    // Strategy 4: First letters of first and second words
    if (words.length >= 2) {
      candidates.push((words[0].charAt(0) + words[1].charAt(0)).toUpperCase());
    }
    
    // Strategy 5: First two consonants
    const consonants = cleanName.split('').filter(char => !'AEIOU'.includes(char));
    if (consonants.length >= 2) {
      candidates.push(consonants[0] + consonants[1]);
    }
  };

  // Add common two-letter prefixes
  const addCommonTwoLetterPrefixes = (candidates: string[]): void => {
    const commonPrefixes = ['PT', 'ST', 'CT', 'MT', 'BT', 'AT', 'PR', 'SR', 'CR', 'BR', 'AR'];
    candidates.push(...commonPrefixes);
  };

  // Add three-letter candidates derived from the product name
  const addThreeLetterCandidatesFromName = (candidates: string[], cleanName: string, words: string[]): void => {
    if (cleanName.length >= 3) {
      // First three letters
      candidates.push(cleanName.substring(0, 3));
      
      // First letter of each word (if 3+ words)
      if (words.length >= 3) {
        candidates.push((words[0].charAt(0) + words[1].charAt(0) + words[2].charAt(0)).toUpperCase());
      }
      
      // First, middle and last letter
      if (cleanName.length >= 5) {
        const middle = Math.floor(cleanName.length / 2);
        candidates.push(cleanName.charAt(0) + cleanName.charAt(middle) + cleanName.charAt(cleanName.length - 1));
      }
    }
  };

  // Add additional two-letter combinations if needed
  const addAdditionalTwoLetterCandidates = (candidates: string[]): void => {
    if (candidates.length < 10) {
      const additionalPairs = [
        'AB', 'AC', 'AD', 'BC', 'BD', 'CD',
        'PB', 'PC', 'PD', 'SB', 'SC', 'SD'
      ];
      
      for (const pair of additionalPairs) {
        if (!candidates.includes(pair)) {
          candidates.push(pair);
        }
      }
    }
  };

  // Add systematic three-letter combinations if needed
  const addSystematicThreeLetterCombos = (candidates: string[]): void => {
    if (candidates.length < 15) {
      const threeLetterCombos = [];
      
      // Generate combinations with common first letters and vowels
      for (const first of 'PSABC') {
        for (const second of 'AEIOU') {
          threeLetterCombos.push(`${first}${second}T`);
          threeLetterCombos.push(`${first}${second}R`);
        }
      }
      
      // Add unique combinations until we reach enough candidates
      for (const combo of threeLetterCombos) {
        if (!candidates.includes(combo)) {
          candidates.push(combo);
          if (candidates.length >= 25) break;
        }
      }
    }
  };

  // Sort candidates by priority (length, existence in system, alphabetical)
  const sortCandidatesByPriority = (candidates: string[], existingCodes: Set<string>): string[] => {
    return candidates.sort((a, b) => {
      // First prioritize by length (shorter is better)
      if (a.length !== b.length) return a.length - b.length;
      
      // Then check if code already exists in the system
      const aExists = existingCodes.has(a);
      const bExists = existingCodes.has(b);
      if (!aExists && bExists) return -1;
      if (aExists && !bExists) return 1;
      
      // Finally, alphabetical order for codes of same length
      return a.localeCompare(b);
    });
  };

  // Generate fallback code when regular strategies fail
  const generateFallbackCode = (existingCodes: Set<string>): string => {
    // Try 4-letter combinations
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Skip I and O which look like numbers
    
    // First try systematic combinations
    for (let i = 0; i < 10; i++) {
      // Create readable 4-letter combinations
      const first = letters[Math.floor(Math.random() * letters.length)];
      const second = 'AEIOU'[Math.floor(Math.random() * 5)]; // A vowel for readability
      const third = letters[Math.floor(Math.random() * letters.length)];
      const fourth = 'AEIOU'[Math.floor(Math.random() * 5)]; // Another vowel
      
      const code = `${first}${second}${third}${fourth}`;
      if (!existingCodes.has(code)) {
        return code;
      }
    }
    
    // Last resort: Use timestamp-based code with letters
    const timestamp = new Date().getTime();
    const letter1 = letters[timestamp % letters.length];
    const letter2 = letters[(timestamp / 1000) % letters.length];
    const letter3 = letters[(timestamp / 1000000) % letters.length];
    
    return `${letter1}${letter2}${letter3}`;
  };

  // Primary search for code existence using prefix search
  const searchCodeByPrefix = async (code: string): Promise<boolean> => {
    const params = new URLSearchParams({
      search: code.substring(0, 2), // Just search by prefix
      limit: '50' // Get enough results to check manually
    });
    
    const response = await axiosInstance.get(`/product-types?${params.toString()}`);
    
    // If no data, the code is unique
    if (!response.data?.data || !Array.isArray(response.data.data) || response.data.data.length === 0) {
      return false;
    }
    
    // Manual check for exact code match
    return response.data.data.some((item: any) => 
      item.code?.toLowerCase() === code.toLowerCase()
    );
  };
  
  // Fallback search for code existence using direct fetch
  const searchCodeWithFallback = async (code: string): Promise<boolean> => {
    const fallbackResponse = await axiosInstance.get('/product-types?limit=100');
    if (!fallbackResponse.data?.data) return false;
    
    // Check manually in results
    return fallbackResponse.data.data.some((item: any) => 
      item.code?.toLowerCase() === code.toLowerCase()
    );
  };

  // Simplified verify code function with reduced complexity
  const verifyCodeWithServer = async (code: string): Promise<boolean> => {
    try {
      // Try the primary approach
      const exists = await searchCodeByPrefix(code);
      return exists;
    } catch (error) {
      // Handle specific error cases
      if (axios.isAxiosError(error)) {
        // 404 means not found, so code doesn't exist
        if (error.response?.status === 404) {
          return false;
        }
        
        // Try fallback approach for 400 errors
        if (error.response?.status === 400) {
          try {
            return await searchCodeWithFallback(code);
          } catch (fallbackError) {
            console.error("Error during fallback code verification:", fallbackError);
            throw fallbackError; // Re-throw to handle at caller level
          }
        }
      }
      
      console.error("Unhandled error during code verification:", error);
      throw error; // Re-throw the error for proper handling by caller
    }
  };

  // Validate user-provided code with improved checks
  const validateUserCode = async (code: string): Promise<string | null> => {
    // If we're editing and code hasn't changed, accept it
    if (code === initialData?.code) {
      return code;
    }
    
    try {
      // Check if code exists in API
      const isCodeTaken = await checkCodeExists(code);
      
      if (isCodeTaken) {
        toast({
          variant: "destructive",
          title: "Duplicate Code",
          description: "This product type code is already in use"
        });
        return null;
      }
      
      return code;
    } catch (error) {
      // Log the error for debugging and proper error handling
      console.error("Product type code validation failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to validate product type code"
      });
      return null;
    }
  };

  // Check if an item matches the search name criteria
  const isMatchingProductType = (item: any, name: string): boolean => {
    const itemName = item.name?.toLowerCase();
    // Check for deleted_at property which might not be in the type definition
    const isNotDeleted = (item as { deleted_at?: string | null }).deleted_at === null;
    const isDifferentId = item.id !== initialData?.id; // Exclude current item if editing
    
    return itemName === name.toLowerCase() && isNotDeleted && isDifferentId;
  };

  // Search for matching product types in API response data
  const searchForDuplicateNames = (data: any[], name: string): boolean => {
    if (!Array.isArray(data) || data.length === 0) {
      return false;
    }
    return data.some(item => isMatchingProductType(item, name));
  };

  // Check if product type with the same name already exists (where deleted_at is null)
  const checkNameExists = async (name: string): Promise<boolean> => {
    // Skip check if we're editing an existing product type and the name hasn't changed
    if (initialData && initialData.name === name) {
      return false;
    }
    
    try {
      // Try the primary API approach first with exact name matching
      return await checkNameExistsByAPI(name);
    } catch (error) {
      // Log the error before falling back to manual checking
      console.error("API-based name check failed, falling back to manual check:", error);
      return await checkNameExistsByManualSearch(name);
    }
  };
  
  // API-based name existence check
  const checkNameExistsByAPI = async (name: string): Promise<boolean> => {
    const params = new URLSearchParams({
      search: name,
      exact_name_match: 'true',
      limit: '10'
    });
    
    const response = await axiosInstance.get(`/product-types?${params.toString()}`);
    
    // If no data returned, no duplicate exists
    if (!response.data?.data) {
      return false;
    }
    
    return searchForDuplicateNames(response.data.data, name);
  };
  
  // Check if a product type matches with search name (for manual search)
  const matchesNameInManualSearch = (item: any, searchName: string): boolean => {
    // Check name match (case insensitive)
    const itemName = item.name?.toLowerCase() === searchName.toLowerCase();
    
    // Check if it's not deleted
    const isNotDeleted = !('deleted_at' in item) || 
                       (item as unknown as { deleted_at?: string | null }).deleted_at === null;
    
    // Make sure it's not the current item being edited
    const isDifferentId = item.id !== initialData?.id;
    
    return itemName && isNotDeleted && isDifferentId;
  };
  
  // Manual search fallback for name existence check - simplified
  const checkNameExistsByManualSearch = async (name: string): Promise<boolean> => {
    // Get all product types for manual filtering
    const allTypes = await fetchAllProductTypes().catch(() => {
      return []; // Return empty array on error
    });
    
    // Find any items matching our criteria
    return allTypes.some(item => matchesNameInManualSearch(item, name));
  };

  // Handle API errors
  const handleApiError = (error: unknown) => {
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message ?? 
                        error.response?.data?.error ?? 
                        "Failed to save product type";
      
      toast({
        variant: "destructive",
        title: error.response?.status === 409 ? "Duplicate Code" : "Error",
        description: errorMessage
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save product type"
      });
    }
  };

  // Check for existing product type with the same name
  const checkAndHandleDuplicateName = async (name: string): Promise<boolean> => {
    const nameExists = await checkNameExists(name);
    
    if (nameExists) {
      toast({
        variant: "destructive",
        title: "Duplicate Name Error",
        description: "A product type with this name already exists. Please use a different name."
      });
      
      return true;
    }
    
    return false;
  };

  // Process and validate the product code
  const processProductCode = async (userProvidedCode: string): Promise<string | null> => {
    if (userProvidedCode) {
      // Validate user-provided code
      return await validateUserCode(userProvidedCode);
    } else {
      // Generate a unique pure alphabetic code
      const generatedCode = await generateUniqueCode();
      return generatedCode;
    }
  };

  // Extracted function for a single submission attempt
  const attemptSubmit = async (values: ProductTypeFormData, code: string): Promise<{ success: boolean; error?: any; newCode?: string; requiresDelay?: boolean }> => {
    try {
      await onSubmit({ ...values, code: code });
      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          const newCode = await generateUniqueCode();
          // If new code generated, signal to retry with it. Otherwise, report error without recovery signal.
          return newCode ? { success: false, error: error, newCode: newCode } : { success: false, error: error };
        }
        if (error.response?.status === 404) {
          // Signal to retry after delay
          return { success: false, error: error, requiresDelay: true };
        }
      }
      // For other errors, just report failure
      return { success: false, error: error };
    }
  };

  // Handle submission with retry mechanism (Refactored for lower complexity)
  const submitWithRetry = async (values: ProductTypeFormData, initialCode: string): Promise<void> => {
    const MAX_RETRIES = 3;
    let retries = 0;
    let currentCode = initialCode;
    let lastError: any = null;

    while (retries < MAX_RETRIES) {
      const result = await attemptSubmit(values, currentCode);

      if (result.success) {
        return; // Success
      }

      // Submission failed
      lastError = result.error;
      retries++;

      // Decide if we should continue retrying based on the result
      if (retries >= MAX_RETRIES) {
        // Max retries reached, loop will terminate
      } else if (result.newCode) {
        currentCode = result.newCode;
        // Continue loop with new code
      } else if (result.requiresDelay) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        // Continue loop after delay
      } else {
         // Unrecoverable error for this attempt, let loop terminate if retries maxed out
         // or try again if retries < MAX_RETRIES (might fail again immediately)
      }
    }

    // If loop finished, it means all retries failed
    throw lastError;
  };

  // Main submit handler with reduced complexity
  const handleSubmit = async (values: ProductTypeFormData) => {
    try {
      // Step 1: Check for duplicate name
      const isDuplicate = await checkAndHandleDuplicateName(values.name);
      if (isDuplicate) return;
      
      // Step 2: Process the product code
      const finalCode = await processProductCode(values.code);
      if (!finalCode) return;
      
      // Step 3: Submit with retry mechanism
      await submitWithRetry(values, finalCode);
      
    } catch (error) {
      // Log the error for debugging purposes
      console.error("Error during product type submission:", error);
      // Handle API error (shows toast to user)
      handleApiError(error);
    }
  };

  // Helper function to get button text
  const getButtonText = () => {
    if (isSubmitting) {
      return initialData ? 'Updating...' : 'Creating...';
    }
    return initialData ? 'Update Type' : 'Create Type';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Type Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product type name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Type Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Leave empty for auto-generation" 
                  {...field}
                  className="uppercase"
                  maxLength={2}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^A-Za-z0/9]/g, '');
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                2 characters code - will be auto-generated if left empty
              </FormDescription>
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
                  placeholder="Enter product type description (optional)"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Active Status</FormLabel>
                <FormDescription>
                  Product type will {field.value ? 'be visible' : 'not be visible'} in the system
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

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isSubmitting}>
            {getButtonText()}
          </Button>
        </div>
      </form>
    </Form>
  );
}