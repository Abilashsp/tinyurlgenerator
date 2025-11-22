// Generate a random short code of 6-8 characters
export function generateShortCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Validate short code format
export function validateShortCode(code: string): boolean {
  const regex = /^[A-Za-z0-9]{6,8}$/;
  return regex.test(code);
}

// Validate URL format
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
