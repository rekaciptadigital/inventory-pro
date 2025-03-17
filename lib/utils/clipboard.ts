/**
 * Utility functions for clipboard operations
 */

/**
 * Copies text to clipboard and returns a promise that resolves when the operation is complete
 * @param text The text to copy to clipboard
 * @returns Promise that resolves when the text is copied
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy text: ', error);
    return false;
  }
}