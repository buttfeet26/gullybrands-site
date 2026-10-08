# Gully Brands storefront — working notes

Static site on GitHub Pages (`master` → https://shop.gullybrands.in). Products, prices,
stock and checkout come live from Shopify (store `5w3pdc-k7.myshopify.com`, "Gully Brands
Clothing Headless" channel) via the Storefront API in `shopify.js`.

## Brand
- Y2K crop tops for **baddies & it girls**. Tone: playful, confident, a bit of Hinglish
  gully flavour ("Yeh fast fashion nahi hai. Yeh gully fashion hai.").
- Look: black + hot pink (`--taxi:#FF4FA3`) with a pink-chrome gradient (`--chrome`),
  ✦ sparkles. Headline: "Baddie Era. Made Loud."
- Artist/brand references in copy are OK (owner approved, e.g. "Lana Del Rey inspired").

## Catalogue (as of Oct 2026)
12 "… Crop Top" products, ₹499, sizes XS–XXL, fulfilled by **Qikink**. Each design keeps only
the colours the print looks good on (black-on-black etc. were deleted).
- **Never** tell the owner to re-sync/push products from the Qikink dashboard — it re-adds
  all 60 variants. Trim variants in Shopify only; kept variant IDs/SKUs must not change.
- New products must be **published** to the Headless + Online Store channels or the site
  can't see them (and cart permalinks fail).
- Tags drive the site's "shop by vibe" chips (`VIBES` in `shopify.js`): `y2k`, `coquette`/`bow`,
  `slogan`, `grunge`/`vintage`/`retro`, `leopard`. Every product should hit at least one.
- Each product has SEO title/description, a vibe line opening its description, and a
  readable handle (e.g. `crystal-bow-crop-top`; old handles redirect).

## Delivery promises (must match Google Merchant Center shipping settings)
Qikink: print + pack + dispatch 2–3 working days (Mon–Sat), courier 3–5 working days → ~5–8 total.
Site copy, FAQ JSON-LD and Merchant Center (account 5871128361, timezone IST) all say this — change them together.
Merchant Center site verification meta tag is in index.html — never remove it.

## When new photos arrive (e.g. Mia wearing the tops) — update ALL of these
Current images are Qikink mockups (`Front_1_c_<n>` / `Back_2_c_<n>` + size chart), and the
site picks each colour's front/back by that filename. Real photos change that, so:

1. **Shopify product media** — upload Mia's photos to each product and attach them to the
   right colour variant (variant image = first photo for that colour). Decide whether to
   keep the mockups after them or remove them.
2. **Site gallery logic** (`buildProducts` in `shopify.js`) — it pairs `Front_1_c_<n>` with
   `Back_2_c_<n>`. If the new files are named differently, either add the photos to the
   colour gallery (variant image + extra lifestyle shots) or add a `GROUPS` entry with
   campaign photos in `assets/products/`. Card cover = first image of the first colour.
3. **Share image** `assets/og.jpg` (1200×630) — rebuild with Mia photos instead of the three
   mockup tiles (Fraunces Billboard font in `assets/fonts/`, pink chrome "Made Loud.").
4. **Hero** — currently text-only; with real photos, add a model shot/collage to the hero.
5. **Regenerate** `node scripts/make-snapshot.js` (from repo root) → refreshes `snapshot.js`
   (offline fallback) and the product JSON-LD images in `index.html`.
6. **Alt text** — describe the model shots (e.g. "Mia wearing the Crystal Bow crop top in
   black"), not just the product name.
7. Re-run a browser check: all cards render, colour switch shows the right photos,
   add to bag → checkout URL 302s to a Shopify checkout, no horizontal scroll at 390px.

Also re-run step 5 whenever products, colours, prices or handles change.

## Open to-dos for the owner
- Submit `https://shop.gullybrands.in/sitemap.xml` in Google Search Console.
- Instagram handle → footer link + `sameAs` in the ClothingStore JSON-LD.
- 48 unused old hoodie/tee photos still sit in `assets/products/` (deletion not yet approved).
- Qikink's "Beige" looks pale yellow in mockups — confirm with a physical sample before renaming.
