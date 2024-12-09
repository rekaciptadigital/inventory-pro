/**
 * Generates a 2-character variant code based on the value name
 * @param valueName The name of the variant value
 * @param existingCodes Array of existing codes to check uniqueness against
 * @returns A unique 2-character code
 */
export function generateVariantCode(valueName: string, existingCodes: string[]): string {
  // Clean and uppercase the value name
  const cleanName = valueName.trim().toUpperCase();
  
  // Common word mappings for better code generation
  const commonMappings: Record<string, string> = {
    'BLACK': 'BK',
    'BLUE': 'BL',
    'RED': 'RD',
    'GREEN': 'GN',
    'WHITE': 'WT',
    'YELLOW': 'YL',
    'PURPLE': 'PR',
    'ORANGE': 'OR',
    'BROWN': 'BR',
    'GREY': 'GY',
    'GRAY': 'GY',
    'SILVER': 'SL',
    'GOLD': 'GD',
    'LEFT': 'LH',
    'RIGHT': 'RH',
    'SMALL': 'SM',
    'MEDIUM': 'MD',
    'LARGE': 'LG',
    'EXTRA': 'XL',
  };

  // Try predefined mapping first
  let code = commonMappings[cleanName] || '';
  
  // If no mapping exists, generate code
  if (!code) {
    // Split into words
    const words = cleanName.split(/[\s-]+/);
    
    if (words.length > 1) {
      // For multi-word values, use first letter of each word
      code = words.slice(0, 2).map(word => word[0]).join('');
    } else {
      // For single words, use first and last distinctive character
      const word = words[0];
      if (word.length > 1) {
        const distinctChars = [...new Set(word)];
        code = distinctChars.length > 1 
          ? distinctChars[0] + distinctChars[distinctChars.length - 1]
          : word.slice(0, 2);
      } else {
        code = word.padEnd(2, 'X');
      }
    }
  }

  // If code already exists, try alternatives
  if (existingCodes.includes(code)) {
    // Try using first letter + incremental number
    let counter = 1;
    let tempCode = code;
    while (existingCodes.includes(tempCode) && counter <= 9) {
      tempCode = cleanName[0] + counter.toString();
      counter++;
    }
    
    // If still not unique, use random code as last resort
    if (existingCodes.includes(tempCode)) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      do {
        code = Array.from({ length: 2 }, () => 
          characters.charAt(Math.floor(Math.random() * characters.length))
        ).join('');
      } while (existingCodes.includes(code));
    } else {
      code = tempCode;
    }
  }
  
  return code;
}

/**
 * Validates a variant code
 * @param code The code to validate
 * @returns boolean indicating if the code is valid
 */
export function validateVariantCode(code: string): boolean {
  // Check if code is exactly 2 characters and contains only uppercase letters and numbers
  const validCodeRegex = /^[A-Z0-9]{2}$/;
  return validCodeRegex.test(code);
}