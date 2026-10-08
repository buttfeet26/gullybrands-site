/* Rebuilds the offline snapshot + Google product data from live Shopify.
   Run from the repo root whenever products, colours or prices change:
     node scripts/make-snapshot.js
   Writes snapshot.js and refreshes the product JSON-LD inside index.html. */
const fs = require("fs"), vm = require("vm");
const SITE = "https://shop.gullybrands.in/";
const code = fs.readFileSync("shopify.js", "utf8") + "\n;globalThis.__run = async () => buildProducts(await fetchShopify());";
const ctx = vm.createContext({ fetch, console });
vm.runInContext(code, ctx);

const plain = html => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

ctx.__run().then(list => {
  const body = "/* Snapshot of the live Shopify catalogue, used ONLY if Shopify can't be reached.\n" +
    "   Regenerate whenever products/colours change: node scripts/make-snapshot.js */\n" +
    "const FALLBACK = " + JSON.stringify(list.map(({ isNew, ...p }) => p)) + ";\n";
  fs.writeFileSync("snapshot.js", body);

  const items = list.map((p, i) => {
    const anyAvailable = p.colors.some(c => Object.values(p.variants[c]).some(v => v.available));
    return {
      "@type": "ListItem", position: i + 1,
      item: {
        "@type": "Product", name: p.t, url: SITE + "#" + p.h,
        image: p.colors.map(c => p.gallery[c][0]),
        description: plain(p.d).split(" Fabric:")[0],
        brand: { "@type": "Brand", name: "Gully Brands" },
        category: "Apparel & Accessories > Clothing > Shirts & Tops",
        color: p.colors.join(", "), size: p.sizes.join(", "),
        audience: { "@type": "PeopleAudience", suggestedGender: "female" },
        offers: {
          "@type": "Offer", url: SITE + "#" + p.h, priceCurrency: "INR", price: String(p.price),
          availability: anyAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          shippingDetails: { "@type": "OfferShippingDetails",
            shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "INR" },
            shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" } },
        },
      },
    };
  });
  const ld = { "@context": "https://schema.org", "@type": "ItemList", name: "Y2K baddie crop tops", itemListElement: items };
  const html = fs.readFileSync("index.html", "utf8").replace(
    /<!--ld:products-->[\s\S]*?<!--\/ld:products-->/,
    `<!--ld:products--><script type="application/ld+json">${JSON.stringify(ld)}</script><!--/ld:products-->`);
  fs.writeFileSync("index.html", html);
  console.log("products", list.length, "snapshot bytes", body.length);
});
