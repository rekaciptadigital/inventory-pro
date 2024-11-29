export function generateTypeCode(existingCodes: string[]): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code: string;
  
  do {
    // Generate a random 3-character code
    code = Array.from({ length: 3 }, () => 
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
  } while (existingCodes.includes(code));
  
  return code;
}

export function validateTypeCode(code: string): boolean {
  // Allow only 3 characters of letters and numbers
  const validCodeRegex = /^[A-Z0-9]{3}$/;
  return code === '' || validCodeRegex.test(code);
}

export function formatTypeCode(code: string): string {
  return code.toUpperCase();
}