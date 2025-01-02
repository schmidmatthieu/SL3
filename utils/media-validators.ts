export interface MediaValidationOptions {
  maxSize?: number; // en bytes
  allowedTypes?: string[];
}

const defaultOptions: MediaValidationOptions = {
  maxSize: 20 * 1024 * 1024, // 20MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
};

export const validateMediaFile = (file: File, options: MediaValidationOptions = defaultOptions) => {
  const { maxSize, allowedTypes } = { ...defaultOptions, ...options };

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    throw new Error(`Type de fichier non autorisé. Types acceptés : ${allowedTypes.join(', ')}`);
  }

  if (maxSize && file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    throw new Error(`Fichier trop volumineux. Taille maximum : ${maxSizeMB}MB`);
  }

  return true;
};
