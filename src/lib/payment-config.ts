/**
 * Payment feature flags.
 *
 * Online payment (Razorpay) is enabled. Set this to `false` to fall back to
 * Cash on Delivery only across the checkout UI and the order API.
 */
export const ONLINE_PAYMENT_ENABLED = true;

/**
 * Cash on Delivery is only offered for destinations within ~10km of
 * Peelamedu, Coimbatore. A precise radius would need address geocoding, so we
 * gate COD by PIN code instead: the codes below are the Coimbatore PINs treated
 * as local/serviceable for COD.
 *
 * ⚠️ REVIEW THIS LIST for your exact delivery area — add or remove PIN codes as
 * needed. Any PIN not listed here will only be offered online payment.
 */
export const COD_PINCODES = new Set<string>([
  "641004", // Peelamedu
  "641014", // Hope College / Avinashi Road
  "641006", // Ganapathy
  "641005", // Coimbatore (central)
  "641012", // Coimbatore
  "641035", // Ramanathapuram
  "641045", // Singanallur
  "641037", // Sowripalayam / Singanallur
  "641025", // Vilankurichi
  "641024", // Coimbatore
  "641047", // Kalapatti
  "641048", // SITRA
  "641038", // Coimbatore
  "641009", // Ram Nagar
  "641015", // Coimbatore
  "641028", // Coimbatore
  "641011", // Coimbatore
  "641018", // R.S. Puram
]);

/**
 * Whether Cash on Delivery is available for a given destination PIN code.
 * Returns false for unknown/empty PINs (they only get online payment).
 */
export function isCodAvailable(pincode?: string | null): boolean {
  if (!pincode) return false;
  return COD_PINCODES.has(pincode.trim());
}
