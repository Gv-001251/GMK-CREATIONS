import type { Product } from "./products";

const DEFAULT_IMAGE_BY_CATEGORY: Record<string, string> = {
  art: "/images/products/organic-sculptures.png",
  trophy: "/images/products/apex-stand.png",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseNumber(value: string): number {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}

function parseCsvLine(line: string): string[] {
  return line
    .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map((part) => part.replace(/^"|"$/g, "").trim());
}

function buildProduct(row: string[]): Product {
  const [
    id,
    name,
    category,
    baselineWeight,
    baselinePrintTime,
    sellingPrice,
    discountPercent,
    discountAmount,
    discountedPrice,
    shortDescription,
    longDescription,
  ] = row;

  const normalizedCategory = category.toLowerCase();
  const image = DEFAULT_IMAGE_BY_CATEGORY[normalizedCategory] || "/images/products/organic-sculptures.png";
  const printHours = Number(baselinePrintTime) || 0;
  const weight = parseNumber(baselineWeight);
  const originalPrice = parseNumber(sellingPrice);
  const sizeVariant = weight >= 250 ? "120mm x 120mm x 200mm" : weight >= 100 ? "110mm x 110mm x 160mm" : "90mm x 90mm x 120mm";

  const cleanDescription = shortDescription.replace(/^Premium\s+/i, "");
  const formattedDescription = cleanDescription ? cleanDescription.charAt(0).toUpperCase() + cleanDescription.slice(1) : "";

  return {
    id,
    name,
    slug: slugify(name),
    description: formattedDescription,
    longDescription,
    price: originalPrice,
    priceLabel: undefined,
    category: normalizedCategory,
    image,
    images: [image],
    badge: undefined,
    materials: ["Standard PLA", "Resin (8K)", "Carbon Fiber PETG"],
    finishes: ["Matte", "Satin", "Gloss", "Metallic"],
    dimensions: normalizedCategory === "trophy" ? "100mm x 100mm x 180mm" : sizeVariant,
    layerHeight: "0.12mm (Detail)",
    infillDensity: normalizedCategory === "trophy" ? "25% Gyroid" : "20% Gyroid",
    recommendedApplication: normalizedCategory === "trophy" ? "Award / Recognition / Display" : "Devotional / Display / Collectible",
    productionDays: Math.max(1, Math.ceil(printHours / 8)),
    featured: false,
    isNew: false,
  };
}

const CSV_DATA = `Product ID,Product Name,Category,Baseline Weight (g),Baseline Print Time (hrs),Selling Price,Discount %,Discount Amount,Discounted Price,Short Description,Long Description
GMK-00001,Lord murugan with peacock miniature statue,Art,13,1.3,₹143.00,10.00%,₹13.00,₹130.00,Premium Lord murugan with peacock miniature statue,Beautiful Lord murugan with peacock miniature statue in the Art category.
GMK-00002,Bala murugan,Art,20,1.5,₹198.00,10.00%,₹18.00,₹180.00,Premium Bala murugan,Beautiful Bala murugan in the Art category.
GMK-00003,Bala Murugan with vel,Art,80,5,₹715.00,10.00%,₹65.00,₹650.00,Premium Bala Murugan with vel,Beautiful Bala Murugan with vel in the Art category.
GMK-00004,Divine Murugan Peacock companion,Art,150,10,"₹1,430.00",10.00%,₹130.00,"₹1,300.00",Premium Divine Murugan Peacock companion,Beautiful Divine Murugan Peacock companion in the Art category.
GMK-00005,Divine krishna,Art,120,1,"₹1,100.00",10.00%,₹100.00,"₹1,000.00",Premium Divine krishna,Beautiful Divine krishna in the Art category.
GMK-00006,Radha krishna,Art,80,6,₹770.00,10.00%,₹70.00,₹700.00,Premium Radha krishna,Beautiful Radha krishna in the Art category.
GMK-00007,Krishna,Art,95,6,₹880.00,10.00%,₹80.00,₹800.00,Premium Krishna,Beautiful Krishna in the Art category.
GMK-00008,Shree krishna wall mount,Art,75,7,₹825.00,10.00%,₹75.00,₹750.00,Premium Shree krishna wall mount,Beautiful Shree krishna wall mount in the Art category.
GMK-00009,Baby krishna chili statue,Art,50,3.4,₹440.00,10.00%,₹40.00,₹400.00,Premium Baby krishna chili statue,Beautiful Baby krishna chili statue in the Art category.
GMK-00010,Bala krishna flute pose,Art,120,6,₹990.00,10.00%,₹90.00,₹900.00,Premium Bala krishna flute pose,Beautiful Bala krishna flute pose in the Art category.
GMK-00011,Krishna Golden Bliss Incarnate - Regular,Art,40,2.3,₹385.00,10.00%,₹35.00,₹350.00,Premium Krishna Golden Bliss Incarnate - Regular,Beautiful Krishna Golden Bliss Incarnate - Regular in the Art category.
GMK-00012,Krishna Golden Bliss Incarnate - Small,Art,20,1.4,₹220.00,10.00%,₹20.00,₹200.00,Premium Krishna Golden Bliss Incarnate - Small,Beautiful Krishna Golden Bliss Incarnate - Small in the Art category.
GMK-00013,Krishna Golden Bliss Incarnate - Medium,Art,80,4,₹660.00,10.00%,₹60.00,₹600.00,Premium Krishna Golden Bliss Incarnate - Medium,Beautiful Krishna Golden Bliss Incarnate - Medium in the Art category.
GMK-00014,Krishna Golden Bliss Incarnate - Large,Art,163,7,"₹1,320.00",10.00%,₹120.00,"₹1,200.00",Premium Krishna Golden Bliss Incarnate - Large,Beautiful Krishna Golden Bliss Incarnate - Large in the Art category.
GMK-00015,Krishna Golden Bliss Incarnate - Extra Large,Art,380,13,"₹2,860.00",10.00%,₹260.00,"₹2,600.00",Premium Krishna Golden Bliss Incarnate - Extra Large,Beautiful Krishna Golden Bliss Incarnate - Extra Large in the Art category.
GMK-00016,Hanuman Small,Art,15,1.5,₹165.00,10.00%,₹15.00,₹150.00,Premium Hanuman Small,Beautiful Hanuman Small in the Art category.
GMK-00017,Hanuman Large,Art,100,5.5,₹880.00,10.00%,₹80.00,₹800.00,Premium Hanuman Large,Beautiful Hanuman Large in the Art category.
GMK-00018,Hanuman Medium,Art,30,2.3,₹330.00,10.00%,₹30.00,₹300.00,Premium Hanuman Medium,Beautiful Hanuman Medium in the Art category.
GMK-00019,Hanuman Blessing pose,Art,340,26,"₹3,300.00",10.00%,₹300.00,"₹3,000.00",Premium Hanuman Blessing pose,Beautiful Hanuman Blessing pose in the Art category.
GMK-00020,Lord Shiva statue,Art,115,10,"₹1,210.00",10.00%,₹110.00,"₹1,100.00",Premium Lord Shiva statue,Beautiful Lord Shiva statue in the Art category.
GMK-00021,Adiyogi (Lord shiva),Art,30,2,₹330.00,10.00%,₹30.00,₹300.00,Premium Adiyogi (Lord shiva),Beautiful Adiyogi (Lord shiva) in the Art category.
GMK-00022,Lord shiva - The supreme yogi,Art,70,2.2,₹550.00,10.00%,₹50.00,₹500.00,Premium Lord shiva - The supreme yogi,Beautiful Lord shiva - The supreme yogi in the Art category.
GMK-00023,Mahadev Lord Shiva wall mount,Art,120,7.2,"₹1,100.00",10.00%,₹100.00,"₹1,000.00",Premium Mahadev Lord Shiva wall mount,Beautiful Mahadev Lord Shiva wall mount in the Art category.
GMK-00024,Lord Ganesha seated statue,Art,120,5,"₹1,100.00",10.00%,₹100.00,"₹1,000.00",Premium Lord Ganesha seated statue,Beautiful Lord Ganesha seated statue in the Art category.
GMK-00025,Divine Lord shiva statue - 90mm Large,Art,40,2.5,₹385.00,10.00%,₹35.00,₹350.00,Premium Divine Lord shiva statue - 90mm Large,Beautiful Divine Lord shiva statue - 90mm Large in the Art category.
GMK-00026,Divine Lord shiva statue - Medium,Art,32,2.2,₹297.00,10.00%,₹27.00,₹270.00,Premium Divine Lord shiva statue - Medium,Beautiful Divine Lord shiva statue - Medium in the Art category.
GMK-00027,Divine Lord shiva statue - 180mm,Art,98,6.5,₹935.00,10.00%,₹85.00,₹850.00,Premium Divine Lord shiva statue - 180mm,Beautiful Divine Lord shiva statue - 180mm in the Art category.
GMK-00028,Lord vishnu,Art,90,7,₹880.00,10.00%,₹80.00,₹800.00,Premium Lord vishnu,Beautiful Lord vishnu in the Art category.
GMK-00029,Divine mini Temple,Art,230,4,₹715.00,10.00%,₹65.00,₹650.00,Premium Divine mini Temple,Beautiful Divine mini Temple in the Art category.
GMK-00030,Natarajan statue,Art,90,11,"₹1,870.00",10.00%,₹170.00,"₹1,700.00",Premium Natarajan statue,Beautiful Natarajan statue in the Art category.
GMK-00031,Mercy Jesus statue,Art,40,2.7,₹385.00,10.00%,₹35.00,₹350.00,Premium Mercy Jesus statue,Beautiful Mercy Jesus statue in the Art category.
GMK-00032,Jesus on the cross,Art,30,3.8,₹385.00,10.00%,₹35.00,₹350.00,Premium Jesus on the cross,Beautiful Jesus on the cross in the Art category.
GMK-00033,Ayyappa,Art,60,5,₹605.00,10.00%,₹55.00,₹550.00,Premium Ayyappa,Beautiful Ayyappa in the Art category.
GMK-00034,Divine Ganesha Veena Art,Art,85,7,₹880.00,10.00%,₹80.00,₹800.00,Premium Divine Ganesha Veena Art,Beautiful Divine Ganesha Veena Art in the Art category.
GMK-00035,Perfect Normal Woman sculptured,Art,65,4.6,₹638.00,10.00%,₹58.00,₹580.00,Premium Perfect Normal Woman sculptured,Beautiful Perfect Normal Woman sculptured in the Art category.
GMK-00036,Rearing Horse,Art,40,7.5,₹990.00,10.00%,₹90.00,₹900.00,Premium Rearing Horse,Beautiful Rearing Horse in the Art category.
GMK-00037,Divine Gopuram Temple,Art,180,7.8,"₹1,265.00",10.00%,₹115.00,"₹1,150.00",Premium Divine Gopuram Temple,Beautiful Divine Gopuram Temple in the Art category.
GMK-00038,Storage Box (Kumkum Chivil),Art,150,7,"₹1,430.00",10.00%,₹130.00,"₹1,300.00",Premium Storage Box (Kumkum Chivil),Beautiful Storage Box (Kumkum Chivil) in the Art category.
GMK-00039,Traditional toy horse,Art,100,1.8,₹330.00,10.00%,₹30.00,₹300.00,Premium Traditional toy horse,Beautiful Traditional toy horse in the Art category.
GMK-00040,Thiruvalluvar 3D model,Art,55,4.3,₹550.00,10.00%,₹50.00,₹500.00,Premium Thiruvalluvar 3D model,Beautiful Thiruvalluvar 3D model in the Art category.
GMK-00041,Hindu Temple Gopuram,Art,90,5,₹770.00,10.00%,₹70.00,₹700.00,Premium Hindu Temple Gopuram,Beautiful Hindu Temple Gopuram in the Art category.
GMK-00042,Ganesha in meditation Lantern - Small,Art,12,1.1,₹165.00,10.00%,₹15.00,₹150.00,Premium Ganesha in meditation Lantern - Small,Beautiful Ganesha in meditation Lantern - Small in the Art category.
GMK-00043,Ganesha in meditation Lantern - Medium,Art,31,2.3,₹352.00,10.00%,₹32.00,₹320.00,Premium Ganesha in meditation Lantern - Medium,Beautiful Ganesha in meditation Lantern - Medium in the Art category.
GMK-00044,Ganesha in meditation Lantern - Large,Art,170,8.8,"₹1,485.00",10.00%,₹135.00,"₹1,350.00",Premium Ganesha in meditation Lantern - Large,Beautiful Ganesha in meditation Lantern - Large in the Art category.
GMK-00045,Ganesha in meditation Lantern - Extra Large,Art,368,7.8,"₹2,475.00",10.00%,₹225.00,"₹2,250.00",Premium Ganesha in meditation Lantern - Extra Large,Beautiful Ganesha in meditation Lantern - Extra Large in the Art category.
GMK-00046,Easter Egg tealight lantern set,Art,130,8.3,"₹1,320.00",10.00%,₹120.00,"₹1,200.00",Premium Easter Egg tealight lantern set,Beautiful Easter Egg tealight lantern set in the Art category.
GMK-00047,Thailand Buddha,Art,263,13.9,"₹2,310.00",10.00%,₹210.00,"₹2,100.00",Premium Thailand Buddha,Beautiful Thailand Buddha in the Art category.
GMK-00048,The Buddha,Art,255,11.5,"₹2,035.00",10.00%,₹185.00,"₹1,850.00",Premium The Buddha,Beautiful The Buddha in the Art category.
GMK-00049,Nandi,Art,172,9,"₹1,540.00",10.00%,₹140.00,"₹1,400.00",Premium Nandi,Beautiful Nandi in the Art category.
GMK-00050,Cricket Trophy,Trophy,30,12.4,"₹2,420.00",10.00%,₹220.00,"₹2,200.00",Premium Cricket Trophy,Beautiful Cricket Trophy in the Trophy category.
GMK-00051,Buddha Bust version 2,Art,161,5.9,"₹1,210.00",10.00%,₹110.00,"₹1,100.00",Premium Buddha Bust version 2,Beautiful Buddha Bust version 2 in the Art category.
GMK-00052,Buddha V3,Art,109,4.5,₹880.00,10.00%,₹80.00,₹800.00,Premium Buddha V3,Beautiful Buddha V3 in the Art category.
GMK-00053,Buddha version 1,Art,107,5.6,₹935.00,10.00%,₹85.00,₹850.00,Premium Buddha version 1,Beautiful Buddha version 1 in the Art category.
GMK-00054,Buddha Bust version 3,Art,140,5.9,"₹1,100.00",10.00%,₹100.00,"₹1,000.00",Premium Buddha Bust version 3,Beautiful Buddha Bust version 3 in the Art category.
GMK-00055,Buddha Bust version 6,Art,71,3.8,₹660.00,10.00%,₹60.00,₹600.00,Premium Buddha Bust version 6,Beautiful Buddha Bust version 6 in the Art category.
GMK-00056,Buddha Bust version 5,Art,89,4.8,₹770.00,10.00%,₹70.00,₹700.00,Premium Buddha Bust version 5,Beautiful Buddha Bust version 5 in the Art category.
GMK-00057,Buddha Bust version 8,Art,89,4.3,₹726.00,10.00%,₹66.00,₹660.00,Premium Buddha Bust version 8,Beautiful Buddha Bust version 8 in the Art category.
GMK-00058,Buddha Bust version 7,Art,70,3,₹550.00,10.00%,₹50.00,₹500.00,Premium Buddha Bust version 7,Beautiful Buddha Bust version 7 in the Art category.
GMK-00059,Buddha Bust version 9,Art,74,3.7,₹638.00,10.00%,₹58.00,₹580.00,Premium Buddha Bust version 9,Beautiful Buddha Bust version 9 in the Art category.
GMK-00060,Buddha Bust version 10,Art,118,7.2,"₹1,100.00",10.00%,₹100.00,"₹1,000.00",Premium Buddha Bust version 10,Beautiful Buddha Bust version 10 in the Art category.
GMK-00061,Head Buddha V.2,Art,85,7.9,₹902.00,10.00%,₹82.00,₹820.00,Premium Head Buddha V.2,Beautiful Head Buddha V.2 in the Art category.
GMK-00062,Baby Buddha v.1,Art,116,6.1,₹968.00,10.00%,₹88.00,₹880.00,Premium Baby Buddha v.1,Beautiful Baby Buddha v.1 in the Art category.
GMK-00063,Trophy customizable award Set of 3 pieces,Trophy,125,3.3,₹902.00,10.00%,₹82.00,₹820.00,Premium Trophy customizable award Set of 3 pieces,Beautiful Trophy customizable award Set of 3 pieces in the Trophy category.
GMK-00064,Customizable trophy base with name plate,Trophy,200,7,"₹1,540.00",10.00%,₹140.00,"₹1,400.00",Premium Customizable trophy base with name plate,Beautiful Customizable trophy base with name plate in the Trophy category.
GMK-00065,Poker Tournament Trophy,Trophy,217,7.3,"₹1,595.00",10.00%,₹145.00,"₹1,450.00",Premium Poker Tournament Trophy,Beautiful Poker Tournament Trophy in the Trophy category.
GMK-00066,Customizable Award cup,Trophy,281,8,"₹2,035.00",10.00%,₹185.00,"₹1,850.00",Premium Customizable Award cup,Beautiful Customizable Award cup in the Trophy category.
GMK-00067,Trophy awards first second third,Trophy,279,1.3,₹220.00,10.00%,₹20.00,₹200.00,Premium Trophy awards first second third,Beautiful Trophy awards first second third in the Trophy category.
GMK-00068,medal for first second third,Trophy,78,3.3,₹660.00,10.00%,₹60.00,₹600.00,Premium medal for first second third,Beautiful medal for first second third in the Trophy category.
GMK-00069,movie award Trophy,Trophy,34,1.8,₹330.00,10.00%,₹30.00,₹300.00,Premium movie award Trophy,Beautiful movie award Trophy in the Trophy category.
GMK-00070,Custom Name plate,Trophy,83,2.9,₹660.00,10.00%,₹60.00,₹600.00,Premium Custom Name plate,Beautiful Custom Name plate in the Trophy category.`;

export const csvProducts: Product[] = CSV_DATA.trim()
  .split(/\r?\n/)
  .slice(1)
  .map((line) => buildProduct(parseCsvLine(line)));
