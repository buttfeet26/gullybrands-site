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

## Product photos (Mia, AI model) — done Oct 2026
54 photos: one studio shot per colour (blush backdrop) + one lifestyle shot per design, made with
Krea 2 + Mia LoRA (pose) then Qwen-Image 2.1 edit (puts the exact product photo on her) via
`gully-media/gully.py`. Files: `assets/mia/<handle>__<colour>__<studio|life>.jpg`; prompts in
`scripts/mia/shots.json` (`make_shots.py` builds it, `run_shots.py` runs it, `make_og.py` = share image).
- **GPU rule: ONE job at a time** (8 in parallel jammed the Modal backend and burned money).
  run_shots.py has a 15-min cap, no retries, stops on first failure. Owner is cost-sensitive.
- Qwen-Image 2.1 is a non-commercial licence — owner chose to use it anyway.
- QC every shot: print spelling/placement, colour, face in frame, nothing covering the print
  (grunge styling uses a high choker — chain necklaces covered the Radio Silence print).
- Shopify alt-text convention drives the site gallery (`buildProducts` in `shopify.js`):
  `Mia wearing the <title> in <Colour>` (studio, first) · `… in <Colour> — <scene>` (lifestyle) ·
  `<title> in <Colour> — product photo, front|back` (Qikink mockup) · size chart last.
  Every colour's variants use its Mia studio shot as variant image.
- Hero reel (5 lifestyle shots) and `assets/og.jpg` use these photos.
- Size chart: branded `assets/gully-sizechart.png` (`scripts/make_sizechart.py`) is the last photo on
  every product (Qikink's chart was removed) and is shown on help.html. Site keeps any `sizechart` image last.

When products/colours change: make the new shots the same way, upload with the alt convention,
set variant images, then `node scripts/make-snapshot.js` and re-test (cards, colour switch,
add to bag → checkout 302, no horizontal scroll at 390px).

## Open to-dos for the owner
- Submit `https://shop.gullybrands.in/sitemap.xml` in Google Search Console.
- Instagram handle → footer link + `sameAs` in the ClothingStore JSON-LD.
- 48 unused old hoodie/tee photos still sit in `assets/products/` (deletion not yet approved).
- Qikink's "Beige" looks pale yellow in mockups — confirm with a physical sample before renaming.
