/**
 * Centralized pricing logic for GMK 3D Creations.
 * Change these constants in one place to update the entire app.
 */

/** Minimum price for any custom 3D print job (₹99) */
export const CUSTOM_PRINT_MIN_PRICE = 99;

// ─────────────────────────────────────────────────────────────
// Weight- and distance-based delivery charges
//
// Shipping is charged per kilogram, at a rate that increases with the
// distance of the destination from Tamil Nadu, with a minimum charge per zone.
//   shipping = max(zone.minCharge, ceil(totalKg * zone.ratePerKg))
// ─────────────────────────────────────────────────────────────

/** Home state — orders shipped here use the cheapest (local) zone. */
export const HOME_STATE = "Tamil Nadu";

/**
 * Fallback weight (grams) used for any item that has no recorded weight
 * (e.g. a legacy product or a custom upload) so shipping is never undercounted.
 */
export const DEFAULT_ITEM_WEIGHT_GRAMS = 100;

interface ShippingZone {
  /** Per-kg delivery rate in INR. */
  ratePerKg: number;
  /** Minimum delivery charge in INR for this zone. */
  minCharge: number;
}

/** Delivery zones ordered by distance from Tamil Nadu. */
export const SHIPPING_ZONES: Record<string, ShippingZone> = {
  local: { ratePerKg: 50, minCharge: 30 }, // Tamil Nadu
  south: { ratePerKg: 90, minCharge: 80 }, // neighbouring southern states
  central: { ratePerKg: 110, minCharge: 90 }, // central / west / east India
  far: { ratePerKg: 150, minCharge: 100 }, // north, north-east & remote
};

/**
 * Maps each normalized state name to a delivery zone. Any state not listed
 * (or an unknown value) falls back to the farthest, most expensive zone.
 * Names are normalized to lowercase alphanumerics, so "Tamil Nadu",
 * "TamilNadu", and "TN" all resolve the same way.
 */
const STATE_ZONE: Record<string, keyof typeof SHIPPING_ZONES> = {
  // Local
  tamilnadu: "local",
  tn: "local",

  // Nearby South
  kerala: "south",
  karnataka: "south",
  andhrapradesh: "south",
  telangana: "south",
  puducherry: "south",
  lakshadweep: "south",

  // Central / West / East
  maharashtra: "central",
  goa: "central",
  gujarat: "central",
  madhyapradesh: "central",
  chhattisgarh: "central",
  odisha: "central",
  dadraandnagarhavelianddamananddiu: "central",

  // Far North / East / remote
  punjab: "far",
  haryana: "far",
  delhi: "far",
  chandigarh: "far",
  rajasthan: "far",
  uttarpradesh: "far",
  uttarakhand: "far",
  himachalpradesh: "far",
  jammuandkashmir: "far",
  ladakh: "far",
  bihar: "far",
  jharkhand: "far",
  westbengal: "far",
  sikkim: "far",
  assam: "far",
  arunachalpradesh: "far",
  manipur: "far",
  meghalaya: "far",
  mizoram: "far",
  nagaland: "far",
  tripura: "far",
  andamanandnicobarislands: "far",
};

/** Normalize a state name to lowercase alphanumerics for reliable matching. */
function normalizeState(state?: string | null): string {
  return (state || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Whether a destination state is the home state (Tamil Nadu). */
export function isIntrastate(state?: string | null): boolean {
  return STATE_ZONE[normalizeState(state)] === "local";
}

/** Resolve the delivery zone for a destination state (defaults to farthest). */
export function getShippingZone(state?: string | null): ShippingZone {
  const key = STATE_ZONE[normalizeState(state)];
  return key ? SHIPPING_ZONES[key] : SHIPPING_ZONES.far;
}

/**
 * Calculate the delivery charge from the total order weight and destination.
 * @param totalWeightGrams Combined weight of all items, in grams
 * @param state Destination state (from the shipping address)
 * @returns Shipping cost in INR (rounded up to the nearest rupee)
 */
export function calculateShipping(
  totalWeightGrams: number,
  state?: string | null
): number {
  const zone = getShippingZone(state);
  const kg = Math.max(0, totalWeightGrams) / 1000;
  const weightCharge = Math.ceil(kg * zone.ratePerKg);
  return Math.max(zone.minCharge, weightCharge);
}

/**
 * Calculate the grand total for an order.
 * @param subtotal Order subtotal in INR
 * @param totalWeightGrams Combined weight of all items, in grams
 * @param state Destination state (from the shipping address)
 * @returns { shippingCost, grandTotal }
 */
export function calculateOrderTotals(
  subtotal: number,
  totalWeightGrams: number = 0,
  state?: string | null
) {
  const shippingCost = calculateShipping(totalWeightGrams, state);
  const grandTotal = subtotal + shippingCost;
  return { shippingCost, grandTotal };
}
