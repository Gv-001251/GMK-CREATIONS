/**
 * Centralized pricing logic for GMK 3D Creations.
 * Change these constants in one place to update the entire app.
 */

/** Free shipping threshold in INR */
export const FREE_SHIPPING_THRESHOLD = 500;

/** Flat shipping fee in INR when below threshold */
export const FLAT_SHIPPING_COST = 49;

/** Minimum price for any custom 3D print job (₹99) */
export const CUSTOM_PRINT_MIN_PRICE = 99;

/**
 * Calculate the shipping cost based on the order subtotal.
 * @param subtotal Order subtotal in INR
 * @returns Shipping cost in INR (0 if free shipping applies)
 */
export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
}

/**
 * Calculate the grand total for an order.
 * @param subtotal Order subtotal in INR
 * @returns { shippingCost, grandTotal }
 */
export function calculateOrderTotals(subtotal: number) {
  const shippingCost = calculateShipping(subtotal);
  const grandTotal = subtotal + shippingCost;
  return { shippingCost, grandTotal };
}
