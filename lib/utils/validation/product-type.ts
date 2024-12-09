/**
 * Validates a product type code
 * @param code The product type code to validate
 * @returns boolean indicating if the code is valid
 */
export function isValidProductTypeCode(code: string): boolean {
  // Check if code contains only alphanumeric characters
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return code.length >= 1 && alphanumericRegex.test(code);
}

/**
 * Formats a product type code to uppercase
 * @param code The product type code to format
 * @returns The formatted code
 */
export function formatProductTypeCode(code: string): string {
  return code.toUpperCase();
}