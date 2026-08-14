// Temp: compare fitness product image paths in DB vs files on disk.
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const dir = "public/images/products/fitness";
const filesOnDisk = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => !f.startsWith("."))
  : [];
console.log("=== Files on disk in", dir, "===");
console.log(filesOnDisk.length ? filesOnDisk.join("\n") : "(none)");

const { data, error } = await supabase
  .from("products")
  .select("id, name, image")
  .like("id", "GMK-FIT-%")
  .order("id");
if (error) { console.error(error.message); process.exit(1); }

console.log("\n=== DB fitness products: image path -> file exists on disk? ===");
for (const r of data) {
  const expected = (r.image || "").replace("/images/products/fitness/", "");
  const onDisk = filesOnDisk.includes(expected);
  console.log(`${r.id} | ${r.name}\n    image=${r.image}\n    fileOnDisk=${onDisk ? "YES" : "NO  <-- will 404"}`);
}
