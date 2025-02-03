/**
 * Generates a location code based on the location type
 * @param type The type of location (warehouse, store, affiliate, others)
 * @returns A unique location code
 */
export function generateLocationCode(type: string): string {
  const prefix = getLocationPrefix(type);
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${timestamp}`;
}

/**
 * Gets the prefix for a location code based on its type
 * @param type The type of location
 * @returns The prefix for the location code
 */
function getLocationPrefix(type: string): string {
  const prefixes: Record<string, string> = {
    warehouse: 'WH',
    store: 'ST',
    affiliate: 'AF',
    others: 'OT',
  };

  return prefixes[type] || 'OT';
}

/**
 * Validates a location code
 * @param code The code to validate
 * @returns boolean indicating if the code is valid
 */
export function validateLocationCode(code: string): boolean {
  return /^[A-Z]{2}-\d{4}$/.test(code);
}

/**
 * Formats a location code to uppercase
 * @param code The code to format
 * @returns The formatted code
 */
export function formatLocationCode(code: string): string {
  return code.toUpperCase();
}