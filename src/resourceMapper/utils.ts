// Utilities for sanitizing resource names and tag keys for Terraform

/**
 * Sanitizes a resource name for Terraform: only letters, digits, -, _
 * Converts to lowercase, replaces all other characters with _
 */
export function sanitizeResourceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/^([^a-z_])/, '_$1'); // name must start with a letter or _
}

/**
 * Sanitizes a tag key: only letters, digits, -, _
 * Converts to lowercase, replaces all other characters with _
 */
export function sanitizeTagKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
} 