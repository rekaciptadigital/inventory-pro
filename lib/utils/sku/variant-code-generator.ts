import { generateRandomDigits } from './random-generator';

export interface VariantCode {
  mainSku: string;
  uniqueCode: string;
}

export function generateSequentialCode(index: number): string {
  // Update to match the old format - 4 digits with zero padding
  return String(index + 1).padStart(4, '0');
}

export function generateVariantCode(
  mainSku: string, 
  existingCodes: string[] = [],
  index?: number,
  customCode?: string
): VariantCode {
  let uniqueCode: string;

  // Use custom code if provided and valid
  if (customCode && validateVariantCode(customCode) && !existingCodes.includes(customCode)) {
    uniqueCode = customCode;
  }
  // Use sequential code if index is provided
  else if (typeof index === 'number') {
    uniqueCode = generateSequentialCode(index);
  }
  // Generate random code as fallback
  else {
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      uniqueCode = generateRandomDigits(4);
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique variant code after maximum attempts');
      }
    } while (existingCodes.includes(uniqueCode));
  }

  return {
    mainSku,
    uniqueCode,
  };
}

export function formatVariantSku(variantCode: VariantCode): string {
  return `${variantCode.mainSku}-${variantCode.uniqueCode}`;
}

export function validateVariantCode(code: string): boolean {
  // Make sure validation accepts 4 digit format
  return /^\d{1,10}$/.test(code);
}

export function isUniqueVariantCode(
  code: string,
  mainSku: string,
  existingVariants: Array<{ sku: string }>
): boolean {
  return !existingVariants.some(variant => {
    const [variantMainSku, variantCode] = variant.sku.split('-');
    return variantMainSku === mainSku && variantCode === code;
  });
}