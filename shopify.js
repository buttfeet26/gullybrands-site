/* ============================================================
   Gully Brands — LIVE Shopify sync (Storefront API)
   Products, prices, sizes and stock are pulled from Shopify on
   every page load, so the site can never drift from the store.

   SETUP: paste your Storefront API token below (public/read-only,
   safe to ship in browser code).
   ============================================================ */

const SHOPIFY = {
  domain: "5w3pdc-k7.myshopify.com",
  token: "REPLACE_WITH_STOREFRONT_TOKEN",   // <-- paste token here
  version: "2026-01",
};

/* Display grouping: several Shopify products shown as ONE card with
   colour swatches, plus our own campaign photography per colourway.
   Any Shopify product NOT listed here is auto-added as its own card,
   so new products appear on the site by themselves.                */
const GROUPS = [
  {
    key: "spider-hoodie",
    title: "Spider Hoodie",
    cat: "Hoodie",
    tag: "THE DROP",
    d: "The white spider, front and back, on a heavyweight pullover hoodie. Red runs loud, black runs venom. Shot on the streets of Mumbai.",
    fab: "320 GSM heavyweight non-zipper hoodie · front + back print",
    colors: { Red: "spidey-crimson-hoodie", Black: "venom-black-hoodie" },
    gallery: {
      Red:   ["sh_red_01","sh_red_02","sh_red_03","sh_red_04","sh_red_05","sh_red_06","sh_red_07","sh_red_08","sh_red_09","sh_red_10"],
      Black: ["sh_blk_01","sh_blk_02","sh_blk_03","sh_blk_04","sh_blk_05","sh_blk_06","sh_blk_07","sh_blk_08","sh_blk_09","sh_blk_10"],
    },
  },
  {
    key: "spider-oversized-tee",
    title: "Oversized Spider Tee",
    cat: "Oversized",
    d: "Oversized drop-shoulder tee with the spider big on the chest and bigger on the back. Black with white spider, white with black — pick your side.",
    fab: "Heavyweight oversized unisex tee · front + back print",
    colors: { Black: "spidey-black-oversized-tee", White: "spidey-white-oversized-tee" },
    gallery: {
      Black: ["ot_blk_01","ot_blk_02","ot_blk_03","ot_blk_04","ot_blk_05"],
      White: ["ot_wht_01","ot_wht_02","ot_wht_03","ot_wht_04","ot_wht_05"],
    },
  },
  {
    key: "spider-girl-tee",
    title: "Spider Girl Tee",
    cat: "Girls",
    d: "The spider tee, fitted and sized down. Front and back print for the youngest baddies in the gully.",
    fab: "Fitted girls tee · front + back print · sizes 30–36 (7–14 yrs)",
    colors: { Black: "spider-girl-baddie-tee", White: "spider-girl-white-baddie-tee" },
    gallery: {
      Black: ["kt_blk_01","kt_blk_02","kt_blk_03","kt_blk_04","kt_blk_05","kt_blk_06","kt_blk_07","kt_blk_08","kt_blk_09"],
      White: ["kt_wht_01","kt_wht_02","kt_wht_03","kt_wht_04","kt_wht_05","kt_wht_06","kt_wht_07","kt_wht_08","kt_wht_09"],
    },
  },
];

const SF_QUERY = `query GullyProducts {
  products(first: 50) {
    nodes {
      id handle title availableForSale productType
      featuredImage { url }
      images(first: 12) { nodes { url } }
      variants(first: 60) {
        nodes {
          id title availableForSale
          price { amount currencyCode }
        }
      }
    }
  }
}`;

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

  /* any Shopify product we haven't grouped -> its own card, automatically */
  for (const n of nodes) {
    if (used.has(n.handle) || !n.availableForSale) continue;
    const sizes = [], variants = { Default: {} };
    let price = null;
    for (const v of n.variants.nodes) {
      variants.Default[v.title] = { id: numId(v.id), available: v.availableForSale };
      sizes.push(v.title);
      const amt = parseFloat(v.price.amount);
      if (price === null || amt < price) price = amt;
    }
    out.push({
      h: n.handle, t: n.title, cat: n.productType || "More", d: "", fab: "",
      price: Math.round(price), colors: ["Default"], sizes,
      gallery: { Default: n.images.nodes.map(i => i.url) },
      variants, isNew: true,
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
