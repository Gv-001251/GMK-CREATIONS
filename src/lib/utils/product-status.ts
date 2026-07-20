/**
 * Product status helpers.
 */

/**
 * Number of days a product is automatically shown as "New" after it was added
 * (based on the product's created_at timestamp). Change this in one place to
 * adjust the window everywhere.
 */
export const NEW_PRODUCT_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whether a product should be treated as "New" based on when it was created.
 * Returns false when there's no valid creation date.
 * @param createdAt ISO timestamp string (products.created_at)
 */
export function isNewProduct(createdAt?: string | null): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created <= NEW_PRODUCT_DAYS * DAY_MS;
}
