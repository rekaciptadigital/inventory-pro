import { generateRandomDigits } from './sku/random-generator';

/**
 * Generates a unique product type code
 * @param existingCodes Array of existing product type codes
 * @returns A unique 2-character code
 */
export function generateProductTypeCode(existingCodes: string[]): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code: string;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    // Try sequential pattern first (AA, AB, AC, etc)
    if (attempts < 26) {
      code = characters[0] + characters[attempts];
    } else if (attempts < 52) {
      // Then try second letter sequence (BA, BB, BC, etc)
      code = characters[1] + characters[attempts - 26];
    } else {
      // Finally, use random generation as fallback
      code = Array.from({ length: 2 }, () => 
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join('');
    }
    attempts++;

    // Prevent infinite loop
    if (attempts >= maxAttempts) {
      code = characters[0] + generateRandomDigits(1);
      break;
    }
  } while (existingCodes.includes(code));

  return code;
}

/**
 * Validates a product type code
 * @param code The code to validate
 * @returns boolean indicating if the code is valid
 */
export function validateProductTypeCode(code: string): boolean {
  // Must be 2 characters, alphanumeric only
  return /^[A-Z0-9]{2}$/.test(code.toUpperCase());
}

/**
 * Formats a product type code to uppercase
 * @param code The code to format
 * @returns The formatted code
 */
export function formatProductTypeCode(code: string): string {
  return code.toUpperCase();
}