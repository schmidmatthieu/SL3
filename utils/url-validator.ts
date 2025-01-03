/**
 * Validates if a string is a valid URL
 * @param url - The URL string to validate
 * @returns boolean - True if the URL is valid or empty, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
