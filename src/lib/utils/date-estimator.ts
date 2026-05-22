export function getDeliveryEstimate(productionDays: number): string {
  const totalDays = productionDays + 3; // 3 days for transport
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + totalDays);

  return deliveryDate.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
