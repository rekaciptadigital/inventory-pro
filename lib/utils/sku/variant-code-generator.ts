import { generateRandomDigits } from './random-generator';

export interface VariantCode {
  mainSku: string;
  uniqueCode: string;
}

export function generateVariantCode(
  mainSku: string, 
  existingCodes: string[] = [],
  defaultCode?: string
): VariantCode {
  let uniqueCode: string;

  // Use default code if provided and not already taken
  if (defaultCode && !existingCodes.includes(defaultCode)) {
    uniqueCode = defaultCode;
  } else {
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
  return /^\d{4}$/.test(code);
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