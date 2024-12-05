export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[0-9+\-\s()]*$/;
  return phoneRegex.test(phone);
}

export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized = { ...data };
  for (const key in sanitized) {
    if (sanitized[key] === '') {
      sanitized[key] = null;
    }
  }
  return sanitized;
}