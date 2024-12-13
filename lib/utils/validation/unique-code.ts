/**
 * Validates a unique code according to the specified rules
 * @param code The code to validate
 * @returns boolean indicating if the code is valid
 */
export function isValidUniqueCode(code: string): boolean {
  // Check if code is empty
  if (!code) return false;
  
  // Check length (1-10 characters)
  if (code.length < 1 || code.length > 10) return false;
  
  // Check if code contains only alphanumeric characters
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(code);
}

/**
 * Formats a unique code to uppercase
 * @param code The code to format
 * @returns The formatted code
 */
export function formatUniqueCode(code: string): string {
  return code.toUpperCase();
}

/**
 * Checks if a unique code is already in use
 * @param code The code to check
 * @param existingCodes Array of existing codes
 * @returns boolean indicating if the code is unique
 */
export function isUniqueCode(code: string, existingCodes: string[]): boolean {
  return !existingCodes.includes(code.toUpperCase());
}

/**
 * Sanitizes input for unique code field
 * @param input Raw input string
 * @returns Sanitized string with only alphanumeric characters
 */
export function sanitizeUniqueCode(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
}