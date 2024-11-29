export function generateBrandCode(existingCodes: string[]): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code: string;
  
  do {
    code = Array.from({ length: 3 }, () => 
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
  } while (existingCodes.includes(code));
  
  return code;
}

export function validateBrandCode(code: string): boolean {
  const alphanumericRegex = /^[a-zA-Z0-9]*$/;
  return code === '' || (
    alphanumericRegex.test(code) && 
    code.length <= 10
  );
}