/**
 * Centralized pricing logic for GMK 3D Creations.
 * Change these constants in one place to update the entire app.
 */

/** Free shipping threshold in INR */
export const FREE_SHIPPING_THRESHOLD = 500;

/** Flat shipping fee in INR when below threshold (currently free for all orders) */
export const FLAT_SHIPPING_COST = 0;

/** Minimum price for any custom 3D print job (₹99) */
export const CUSTOM_PRINT_MIN_PRICE = 99;

/**
 * TEST MODE: force every order's payable total to ₹1 so the live Razorpay
 * flow can be verified for a token amount. Set back to `false` to restore
 * real pricing before going live with customers.
 */
export const TEST_ONE_RUPEE_CHECKOUT = true;

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
  // Temporary test override: charge a flat ₹1 (with no shipping) so a real
  // payment can be run cheaply. Remove by setting TEST_ONE_RUPEE_CHECKOUT=false.
  if (TEST_ONE_RUPEE_CHECKOUT) {
    return { shippingCost: 0, grandTotal: 1 };
  }

  const shippingCost = calculateShipping(subtotal);
  const grandTotal = subtotal + shippingCost;
  return { shippingCost, grandTotal };
}
