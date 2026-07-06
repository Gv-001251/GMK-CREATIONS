import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "GMK 3D Creations <noreply@gmk3d.com>";

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  grandTotal: number;
  items: { name: string; quantity: number; price: number; material?: string }[];
}

// ─── Order Confirmed ──────────────────────────────────────────────────────────
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!resend) return; // Silently skip if not configured

  const itemRows = data.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${i.name}${i.material ? ` (${i.material})` : ""}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">₹${(i.price * i.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Order Confirmed — ${data.orderId} | GMK 3D Creations`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h1 style="color:#6d5cff">Order Confirmed! 🎉</h1>
        <p>Hi ${data.customerName},</p>
        <p>Your 3D print order <strong>${data.orderId}</strong> has been confirmed and is being prepared.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px 12px;text-align:left">Item</th>
              <th style="padding:8px 12px;text-align:center">Qty</th>
              <th style="padding:8px 12px;text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:8px 12px;font-weight:bold">Total</td>
              <td style="padding:8px 12px;text-align:right;font-weight:bold">₹${data.grandTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <p>We'll notify you when your order ships. Thank you for choosing GMK 3D Creations!</p>
        <p style="color:#888;font-size:12px">GMK 3D Creations • Precision 3D Printing</p>
      </div>
    `,
  });
}

// ─── Order Shipped ────────────────────────────────────────────────────────────
export async function sendOrderShippedEmail(data: Pick<OrderEmailData, "orderId" | "customerName" | "customerEmail">) {
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Your order has shipped! — ${data.orderId} | GMK 3D Creations`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h1 style="color:#6d5cff">Your order has shipped! 🚚</h1>
        <p>Hi ${data.customerName},</p>
        <p>Great news — your order <strong>${data.orderId}</strong> is on its way to you.</p>
        <p>You should receive it within the estimated delivery window. Keep an eye on your door!</p>
        <p style="color:#888;font-size:12px">GMK 3D Creations • Precision 3D Printing</p>
      </div>
    `,
  });
}

// ─── Order Delivered ──────────────────────────────────────────────────────────
export async function sendOrderDeliveredEmail(data: Pick<OrderEmailData, "orderId" | "customerName" | "customerEmail">) {
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Order Delivered — ${data.orderId} | GMK 3D Creations`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h1 style="color:#6d5cff">Order Delivered! ✅</h1>
        <p>Hi ${data.customerName},</p>
        <p>Your order <strong>${data.orderId}</strong> has been delivered. We hope you love your 3D prints!</p>
        <p>If you have any issues, reply to this email and we'll sort it out right away.</p>
        <p style="color:#888;font-size:12px">GMK 3D Creations • Precision 3D Printing</p>
      </div>
    `,
  });
}
