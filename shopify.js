/* ============================================================
   Gully Brands — LIVE Shopify sync (Storefront API)
   Products, prices, sizes and stock are pulled from Shopify on
   every page load, so the site can never drift from the store.

   SETUP: paste your Storefront API token below (public/read-only,
   safe to ship in browser code).
   ============================================================ */

const SHOPIFY = {
  domain: "5w3pdc-k7.myshopify.com",
  token: "f0ddd5f9408c94607acd278d72b203c0",  // public Storefront token (read-only, browser-safe)
  version: "2026-07",
};

/* Display grouping: several Shopify products shown as ONE card with
   colour swatches, plus our own campaign photography per colourway.
   Any Shopify product NOT listed here is auto-added as its own card,
   so new products appear on the site by themselves.                */
const GROUPS = [
  /* example — merge separate Shopify products into one card with our own photos:
  { key: "my-card", title: "Card title", cat: "Crop Top", tag: "NEW",
    d: "Description", fab: "Fabric line",
    colors: { Black: "shopify-handle-black", White: "shopify-handle-white" },
    gallery: { Black: ["photo_01"], White: ["photo_02"] } },   // files in assets/products/<name>.jpg
  */
];

const SF_QUERY = `query GullyProducts {
  products(first: 50) {
    nodes {
      id handle title availableForSale productType description descriptionHtml tags
      featuredImage { url }
      images(first: 50) { nodes { url altText } }
      variants(first: 100) {
        nodes {
          id title availableForSale
          selectedOptions { name value }
          image { url }
          price { amount currencyCode }
        }
      }
    }
  }
}`;

/* "Shop by vibe" filter chips, driven by Shopify product tags (in this order) */
const VIBES = [
  { label: "Y2K",              tags: ["y2k"] },
  { label: "Coquette",         tags: ["coquette", "bow"] },
  { label: "Slogan",           tags: ["slogan"] },
  { label: "Grunge & Vintage", tags: ["grunge", "vintage", "retro"] },
  { label: "Leopard",          tags: ["leopard"] },
];

/* sizes we know sort smallest -> largest; unknown sizes keep Shopify's order */
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL", "30", "32", "34", "36"];

/* Shopify description HTML -> simple tags only (drops the editor's inline colours,
   which would be black-on-black on our dark site) */
const cleanHtml = html => (html || "")
  .replace(/<(\/?)(?!(?:p|strong|b|em|i|br|ul|ol|li)\b)[a-z][^>]*>/gi, "")
  .replace(/<(\/?)(p|strong|b|em|i|br|ul|ol|li)\b[^>]*>/gi, "<$1$2>")
  .trim();

/* numeric id out of gid://shopify/ProductVariant/123 */
const numId = gid => String(gid).split("/").pop();

async function fetchShopify() {
  if (!SHOPIFY.token || SHOPIFY.token === "REPLACE_WITH_STOREFRONT_TOKEN") {
    console.warn("[gully] Storefront token not set — using built-in snapshot.");
    return null;
  }
  const res = await fetch(`https://${SHOPIFY.domain}/api/${SHOPIFY.version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY.token,
    },
    body: JSON.stringify({ query: SF_QUERY }),
  });
  if (!res.ok) throw new Error("Shopify " + res.status);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data.products.nodes;
}

/* Shopify nodes -> the display model the storefront renders */
function buildProducts(nodes) {
  const byHandle = Object.fromEntries(nodes.map(n => [n.handle, n]));
  const used = new Set();
  const out = [];

  for (const g of GROUPS) {
    const colors = [], variants = {}, gallery = {}, sizesSet = [];
    let price = null;

    for (const [colour, handle] of Object.entries(g.colors)) {
      const node = byHandle[handle];
      if (!node || !node.availableForSale) continue;   // hidden/archived in Shopify -> hidden here
      used.add(handle);
      colors.push(colour);

      variants[colour] = {};
      for (const v of node.variants.nodes) {
        variants[colour][v.title] = { id: numId(v.id), available: v.availableForSale };
        if (!sizesSet.includes(v.title)) sizesSet.push(v.title);
        const amt = parseFloat(v.price.amount);
        if (price === null || amt < price) price = amt;
      }
      // our campaign photos if we have them, else Shopify's own images
      gallery[colour] = (g.gallery && g.gallery[colour])
        ? g.gallery[colour].map(n => `assets/products/${n}.jpg`)
        : node.images.nodes.map(i => i.url);
    }

    if (!colors.length) continue;   // whole group gone from Shopify
    out.push({ h: g.key, t: g.title, cat: g.cat, tag: g.tag, d: g.d, fab: g.fab,
               price: Math.round(price), colors, sizes: sizesSet, gallery, variants });
  }

  /* any Shopify product we haven't grouped -> its own card, automatically.
     Variants are split on their Colour / Size options so each colour gets a
     swatch and its own photos (front mockup, matching back mockup, size chart). */
  for (const n of nodes) {
    if (used.has(n.handle) || !n.availableForSale) continue;
    const colors = [], sizes = [], variants = {}, gallery = {};
    const allImgs = n.images.nodes.map(i => i.url);
    const sizeChart = allImgs.filter(u => /sizechart/i.test(u));
    let price = null;
    for (const v of n.variants.nodes) {
      const opt = name => (v.selectedOptions.find(o => o.name.toLowerCase() === name) || {}).value;
      const colour = opt("color") || opt("colour") || "Default";
      const size = opt("size") || v.title;
      if (!variants[colour]) { variants[colour] = {}; colors.push(colour); }
      variants[colour][size] = { id: numId(v.id), available: v.availableForSale };
      if (!sizes.includes(size)) sizes.push(size);
      if (!gallery[colour] && v.image) {
        // Qikink mockups: Front_1_c_<n> pairs with Back_2_c_<n> for the same colour
        const m = v.image.url.match(/Front_1_c_(\d+)[_.]/);
        const back = m ? allImgs.filter(u => new RegExp(`Back_2_c_${m[1]}[_.]`).test(u)) : [];
        gallery[colour] = [v.image.url, ...back, ...sizeChart];
      }
      const amt = parseFloat(v.price.amount);
      if (price === null || amt < price) price = amt;
    }
    /* Photos labelled in Shopify (alt text) win over the Qikink filename pairing:
         "Mia wearing the <title> in <Colour>"                  model shot (first)
         "Mia wearing the <title> in <Colour> — <scene>"        lifestyle shot
         "<title> in <Colour> — product photo, front|back"      plain product photo (last) */
    for (const c of colors) {
      const esc = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const mine = n.images.nodes.filter(i => new RegExp(` in ${esc}( —|$)`).test(i.altText || ""));
      if (!mine.length) continue;
      const rank = alt => /^Mia/.test(alt) ? (alt.includes("—") ? 1 : 0) : /front/.test(alt) ? 2 : 3;
      mine.sort((x, y) => rank(x.altText) - rank(y.altText));
      gallery[c] = [...mine.map(i => i.url), ...sizeChart];
    }
    for (const c of colors) if (!gallery[c]) gallery[c] = allImgs;
    sizes.sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
    out.push({
      h: n.handle, t: n.title, cat: n.productType || "More", d: cleanHtml(n.descriptionHtml) || n.description || "", fab: "",
      price: Math.round(price), colors, sizes, gallery, variants, isNew: true,
      vibes: VIBES.filter(v => v.tags.some(t => n.tags.includes(t))).map(v => v.label),
    });
  }
  return out;
}

/* Loads live data, falls back to the built-in snapshot so the shop
   is never empty if Shopify is unreachable. */
async function loadProducts(fallback) {
  try {
    const nodes = await fetchShopify();
    if (!nodes) return { products: fallback, live: false };
    const built = buildProducts(nodes);
    if (!built.length) return { products: fallback, live: false };
    return { products: built, live: true };
  } catch (e) {
    console.warn("[gully] live sync failed, using snapshot:", e.message);
    return { products: fallback, live: false };
  }
}
