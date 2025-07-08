// Утилиты для очистки имён ресурсов и ключей tags для Terraform

/**
 * Очищает имя ресурса для Terraform: только буквы, цифры, -, _
 * Приводит к нижнему регистру, заменяет все остальные символы на _
 */
export function sanitizeResourceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/^([^a-z_])/, '_$1'); // имя должно начинаться с буквы или _
}

/**
 * Очищает ключ для tags: только буквы, цифры, -, _
 * Приводит к нижнему регистру, заменяет все остальные символы на _
 */
export function sanitizeTagKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
} 