/* Builds one real page per product (p/<handle>/index.html) and the Google Merchant Center
   product feed (google-feed.xml, one item per colour + size) from snapshot.js.
   make-snapshot.js runs this automatically; to run alone (from the repo root):
     node scripts/make-pages.js
   Merchant Center fetches https://shop.gullybrands.in/google-feed.xml daily. */
const fs = require("fs"), vm = require("vm");
const SITE = "https://shop.gullybrands.in/";
const ctx = {}; vm.runInNewContext(fs.readFileSync("snapshot.js", "utf8") + ";this.P = FALLBACK", ctx);
const PRODUCTS = ctx.P;

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = html => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const vibeLine = p => plain(p.d).split(" Fabric:")[0];
const img = (u, w) => u.includes("cdn.shopify.com") ? u + (u.includes("?") ? "&" : "?") + "width=" + w : u;
const photos = (p, c) => p.gallery[c].filter(u => !/sizechart/i.test(u));
const pageUrl = p => `${SITE}p/${p.h}/`;
const variantUrl = (p, c, s) => `${pageUrl(p)}?colour=${encodeURIComponent(c)}&size=${encodeURIComponent(s)}`;
const vid = v => (typeof v === "object" ? v.id : v);
const avail = v => (typeof v === "object" ? v.available !== false : true);

/* shipping + returns: keep in sync with Merchant Center and help.html (see CLAUDE.md) */
const SHIPPING = {
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "INR" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
  deliveryTime: { "@type": "ShippingDeliveryTime",
    businessDays: { "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => "https://schema.org/" + d) },
    handlingTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 3, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 5, unitCode: "DAY" } },
};
const RETURNS = { "@type": "MerchantReturnPolicy", applicableCountry: "IN",
  returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted" };

const pixel = fs.readFileSync("index.html", "utf8").match(/<!-- Meta Pixel[\s\S]*?<\/noscript>/)[0];

function page(p) {
  const desc = vibeLine(p);
  const first = photos(p, p.colors[0])[0];
  const ld = {
    "@context": "https://schema.org", "@type": "ProductGroup", name: p.t, url: pageUrl(p),
    productGroupID: p.h, description: desc, brand: { "@type": "Brand", name: "Gully Brands" },
    variesBy: ["https://schema.org/color", "https://schema.org/size"],
    hasVariant: p.colors.flatMap(c => p.sizes.filter(s => p.variants[c][s]).map(s => ({
      "@type": "Product", sku: String(vid(p.variants[c][s])), name: `${p.t} – ${c} / ${s}`,
      color: c, size: s, image: img(photos(p, c)[0], 1200),
      offers: { "@type": "Offer", url: variantUrl(p, c, s), price: String(p.price), priceCurrency: "INR",
        availability: avail(p.variants[c][s]) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition", shippingDetails: SHIPPING, hasMerchantReturnPolicy: RETURNS },
    }))),
  };
  const data = { h: p.h, t: p.t, price: p.price, colors: p.colors, sizes: p.sizes,
    gallery: Object.fromEntries(p.colors.map(c => [c, photos(p, c)])),
    variants: Object.fromEntries(p.colors.map(c => [c, Object.fromEntries(p.sizes.filter(s => p.variants[c][s])
      .map(s => [s, { id: vid(p.variants[c][s]), available: avail(p.variants[c][s]) }]))])) };
  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.t)} — ₹${p.price} | Gully Brands</title>
<meta name="description" content="${esc(desc)} ₹${p.price}, sizes ${p.sizes[0]}–${p.sizes[p.sizes.length - 1]}, free shipping across India.">
<link rel="canonical" href="${pageUrl(p)}">
<meta name="theme-color" content="#0A0A0A">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Gully Brands">
<meta property="og:title" content="${esc(p.t)} — ₹${p.price}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${pageUrl(p)}">
<meta property="og:image" content="${esc(img(first, 1200))}">
<meta property="product:price:amount" content="${p.price}">
<meta property="product:price:currency" content="INR">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://cdn.shopify.com">
<link rel="stylesheet" href="/styles.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>
  .pd{max-width:1100px;margin:0 auto;padding:clamp(1.5rem,4vw,3rem) 24px;display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(1.5rem,4vw,3.5rem)}
  .pd__main{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:18px;background:var(--panel)}
  .pd__thumbs{display:flex;gap:.6rem;margin-top:.8rem;overflow-x:auto}
  .pd__thumbs img{width:72px;aspect-ratio:4/5;object-fit:cover;border-radius:10px;opacity:.55;cursor:pointer;border:2px solid transparent}
  .pd__thumbs img.is-on{opacity:1;border-color:var(--taxi)}
  .pd h1{font-family:var(--billboard);font-weight:900;font-size:clamp(2rem,5vw,3.2rem);line-height:1;letter-spacing:-.02em}
  .pd__price{font-family:var(--disp);font-size:1.6rem;font-weight:700;color:var(--taxi);margin:.8rem 0 1rem}
  .pd__desc{color:var(--cream-dim);line-height:1.7}
  .pd__desc p{margin:.6rem 0}.pd__desc strong{color:var(--cream)}
  .pd__label{font-family:var(--disp);text-transform:uppercase;letter-spacing:.18em;font-size:.72rem;color:var(--cream-dim);margin:1.4rem 0 .6rem}
  .pd__opts{display:flex;flex-wrap:wrap;gap:.5rem}
  .pd__opts button{border:1px solid var(--line);border-radius:999px;padding:.55rem 1rem;color:var(--cream);background:transparent;font:inherit;cursor:pointer}
  .pd__opts button.is-on{border-color:var(--taxi);background:rgba(255,79,163,.12)}
  .pd__opts button:disabled{opacity:.35;text-decoration:line-through;cursor:not-allowed}
  .pd__cta{display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1.6rem}
  .pd__note{color:var(--cream-dim);font-size:.88rem;margin-top:1rem}
  .pd__note a{color:var(--taxi)}
  @media (max-width:760px){.pd{grid-template-columns:1fr}}
</style>
${pixel}
</head>
<body>
<header class="hd"><div class="wrap hd__in">
  <a href="/" class="logo">Gully <b>Brands</b></a>
  <nav class="nav"><a href="/#drop">The Drop</a><a href="/help.html#size-guide">Size Guide</a><a href="/help.html#shipping">Shipping</a></nav>
  <a class="cartbtn" href="/?bag=1">Bag <span id="bagCount"></span></a>
</div></header>
<main class="pd">
  <div>
    <img class="pd__main" id="mainImg" src="${esc(img(first, 1100))}" alt="${esc(p.t)} in ${esc(p.colors[0])}" width="928" height="1152">
    <div class="pd__thumbs" id="thumbs"></div>
  </div>
  <div>
    <div class="label">Y2K graphic crop top</div>
    <h1>${esc(p.t)}</h1>
    <div class="pd__price">₹${p.price}</div>
    <div class="pd__desc">${p.d}</div>
    <div class="pd__label">Colour <span id="colourName"></span></div>
    <div class="pd__opts" id="colours"></div>
    <div class="pd__label">Size <span id="sizeHint">— pick one</span></div>
    <div class="pd__opts" id="sizes"></div>
    <div class="pd__cta">
      <button class="btn" id="addBtn">Add to bag</button>
      <button class="btn btn--ghost" id="buyBtn">Buy now</button>
    </div>
    <p class="pd__note">Free shipping across India · Dispatched in 2–3 working days · Delivered in 5–8 days · Secure online payment.<br><a href="/help.html#size-guide">Size guide</a> · <a href="/help.html#returns">Returns</a></p>
  </div>
</main>
<footer class="ft"><div class="wrap"><div class="ft__bottom">
  <span>© Gully Brands Clothing · Made in India</span><a href="/#drop" style="color:var(--taxi)">See all 12 crop tops →</a>
</div></div></footer>
<script>
const P = ${JSON.stringify(data)};
const CHECKOUT = "https://5w3pdc-k7.myshopify.com";
const img = (u, w) => u.includes("cdn.shopify.com") ? u + (u.includes("?") ? "&" : "?") + "width=" + w : u;
const q = new URLSearchParams(location.search);
let colour = P.colors.find(c => c.toLowerCase() === (q.get("colour") || "").toLowerCase()) || P.colors[0];
let size = P.sizes.includes(q.get("size")) ? q.get("size") : null;
const track = (ev, d) => { try { window.fbq && fbq("track", ev, d); } catch (e) {} };
const $ = id => document.getElementById(id);
function show(i) {
  const pics = P.gallery[colour];
  $("mainImg").src = img(pics[i], 1100); $("mainImg").alt = P.t + " in " + colour;
  [...$("thumbs").children].forEach((t, j) => t.classList.toggle("is-on", j === i));
}
function render() {
  $("colourName").textContent = "— " + colour;
  $("colours").innerHTML = P.colors.map(c => '<button data-c="' + c + '" class="' + (c === colour ? "is-on" : "") + '">' + c + "</button>").join("");
  $("sizes").innerHTML = P.sizes.map(s => { const v = P.variants[colour][s];
    return '<button data-s="' + s + '" class="' + (s === size ? "is-on" : "") + '"' + (v && v.available ? "" : " disabled") + ">" + s + "</button>"; }).join("");
  $("thumbs").innerHTML = P.gallery[colour].map((u, i) => '<img src="' + img(u, 160) + '" alt="" data-i="' + i + '">').join("");
  show(0);
}
document.addEventListener("click", e => {
  const c = e.target.closest("[data-c]"), s = e.target.closest("[data-s]"), t = e.target.closest("[data-i]");
  if (c) { colour = c.dataset.c; render(); }
  if (s && !s.disabled) { size = s.dataset.s; $("sizeHint").textContent = ""; render(); }
  if (t) show(+t.dataset.i);
});
function pick() {
  const v = size && P.variants[colour][size];
  if (!v) { $("sizeHint").textContent = "— please pick a size"; $("sizeHint").style.color = "var(--taxi)"; return null; }
  return v;
}
$("addBtn").onclick = () => { const v = pick(); if (!v) return;
  track("AddToCart", { content_ids: [P.h], content_name: P.t, content_type: "product", value: P.price, currency: "INR" });
  let cart = []; try { cart = JSON.parse(localStorage.getItem("gb_cart") || "[]"); } catch (e) {}
  const key = P.h + "|" + colour + "|" + size, ex = cart.find(i => i.key === key);
  if (ex) ex.qty++; else cart.push({ key, h: P.h, t: P.t, price: P.price, src: img(P.gallery[colour][0], 200), color: colour, size, qty: 1, vid: v.id });
  try { localStorage.setItem("gb_cart", JSON.stringify(cart)); } catch (e) {}
  setTimeout(() => { location.href = "/?bag=1"; }, 250);
};
$("buyBtn").onclick = () => { const v = pick(); if (!v) return;
  track("InitiateCheckout", { content_ids: [P.h], num_items: 1, value: P.price, currency: "INR" });
  setTimeout(() => { location.href = CHECKOUT + "/cart/" + v.id + ":1"; }, 300);
};
try { const n = JSON.parse(localStorage.getItem("gb_cart") || "[]").reduce((a, i) => a + i.qty, 0); if (n) $("bagCount").textContent = "(" + n + ")"; } catch (e) {}
track("ViewContent", { content_ids: [P.h], content_name: P.t, content_type: "product", value: P.price, currency: "INR" });
render();
</script>
</body>
</html>
`;
}

/* ---------- write pages ---------- */
for (const p of PRODUCTS) {
  fs.mkdirSync(`p/${p.h}`, { recursive: true });
  fs.writeFileSync(`p/${p.h}/index.html`, page(p));
}

/* ---------- Google Merchant Center feed (RSS 2.0) ---------- */
const VIBE_TYPE = p => "Crop Tops" + ((p.vibes || []).length ? " > " + p.vibes[0] : "");
const items = PRODUCTS.flatMap(p => p.colors.flatMap(c => p.sizes.filter(s => p.variants[c][s]).map(s => {
  const pics = photos(p, c), v = p.variants[c][s];
  return `<item>
<g:id>${vid(v)}</g:id>
<g:item_group_id>${p.h}</g:item_group_id>
<title>${esc(`${p.t} – ${c} – ${s}`)}</title>
<description>${esc(plain(p.d))}</description>
<link>${esc(variantUrl(p, c, s))}</link>
<g:image_link>${esc(img(pics[0], 1200))}</g:image_link>
${pics.slice(1, 10).map(u => `<g:additional_image_link>${esc(img(u, 1200))}</g:additional_image_link>`).join("\n")}
<g:availability>${avail(v) ? "in_stock" : "out_of_stock"}</g:availability>
<g:price>${p.price}.00 INR</g:price>
<g:brand>Gully Brands</g:brand>
<g:condition>new</g:condition>
<g:identifier_exists>no</g:identifier_exists>
<g:google_product_category>212</g:google_product_category>
<g:product_type>${esc(VIBE_TYPE(p))}</g:product_type>
<g:gender>female</g:gender>
<g:age_group>adult</g:age_group>
<g:color>${esc(c)}</g:color>
<g:size>${esc(s)}</g:size>
<g:material>Cotton</g:material>
<g:shipping><g:country>IN</g:country><g:price>0 INR</g:price><g:min_handling_time>2</g:min_handling_time><g:max_handling_time>3</g:max_handling_time><g:min_transit_time>3</g:min_transit_time><g:max_transit_time>5</g:max_transit_time></g:shipping>
</item>`;
})));
fs.writeFileSync("google-feed.xml", `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>Gully Brands — Y2K crop tops</title>
<link>${SITE}</link>
<description>Gully Brands product feed for Google Merchant Center</description>
${items.join("\n")}
</channel>
</rss>
`);

/* ---------- sitemap ---------- */
const urls = [[SITE, "weekly", "1.0"], ...PRODUCTS.map(p => [pageUrl(p), "weekly", "0.8"]), [SITE + "help.html", "monthly", "0.5"]];
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, f, pr]) => `  <url><loc>${u}</loc><changefreq>${f}</changefreq><priority>${pr}</priority></url>`).join("\n")}
</urlset>
`);
console.log("pages", PRODUCTS.length, "feed items", items.length);
