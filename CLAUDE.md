# Gully Brands storefront — working notes

Static site on GitHub Pages (`master` → https://shop.gullybrands.in). Products, prices,
stock and checkout come live from Shopify (store `5w3pdc-k7.myshopify.com`, "Gully Brands
Clothing Headless" channel) via the Storefront API in `shopify.js`.

## Brand
- Y2K crop tops for **baddies & it girls**, Lana Del Rey vibes: cinematic, romantic, coquette,
  old-money glamour, a little dark. Tone: polished, confident, short evocative lines.
- **Owner rules (Oct 2026):** NO "gully"/tapri/Hinglish street slang or anything that reads cheap
  (the brand name "Gully Brands" itself is fine). NEVER mention AI / that Mia is an AI model in any
  public copy (captions, site, ads).
- Look: black + hot pink (`--taxi:#FF4FA3`) with a pink-chrome gradient (`--chrome`),
  ✦ sparkles. Headline: "Baddie Era. Made Loud."
- Artist/brand references in copy are OK (owner approved, e.g. "Lana Del Rey inspired").

## Catalogue (as of Oct 2026)
12 "… Crop Top" products, ₹499, sizes XS–XXL, fulfilled by **Qikink**. Each design keeps only
the colours the print looks good on (black-on-black etc. were deleted).
- **Never** tell the owner to re-sync/push products from the Qikink dashboard — it re-adds
  all 60 variants. Trim variants in Shopify only; kept variant IDs/SKUs must not change.
- New products need Shopify category **Apparel & Accessories > Clothing > Clothing Tops > T-Shirts**
  (`aa-1-13-8`) and metafield `mm-google-shopping.custom_product = true`, or Google & YouTube won't sync them.
- New products must be **published** to the Headless + Online Store channels or the site
  can't see them (and cart permalinks fail).
- Tags drive the site's "shop by vibe" chips (`VIBES` in `shopify.js`): `y2k`, `coquette`/`bow`,
  `slogan`, `grunge`/`vintage`/`retro`, `leopard`. Every product should hit at least one.
- Each product has SEO title/description, a vibe line opening its description, and a
  readable handle (e.g. `crystal-bow-crop-top`; old handles redirect).

## Delivery promises (must match Google Merchant Center shipping settings)
Qikink: print + pack + dispatch 2–3 working days (Mon–Sat), courier 3–5 working days → ~5–8 total.
Site copy, FAQ JSON-LD and Merchant Center (account 5871128361, timezone IST) all say this — change them together.
Two google-site-verification meta tags are in index.html (6Y3rt… = Search Console/gullybrands.in@gmail.com, r_98q30… = Merchant Center 5871128361) — never remove either.

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
  `<title> in <Colour> — product photo, front|back` (Qikink mockup, other model — hidden on the site
  whenever a colour has Mia shots; still in Shopify) · size chart last.
  Every colour's variants use its Mia studio shot as variant image.
- Hero reel (5 lifestyle shots) and `assets/og.jpg` use these photos.
- Size chart: branded `assets/gully-sizechart.png` (`scripts/make_sizechart.py`) is the last photo on
  every product (Qikink's chart was removed) and is shown on help.html. Site keeps any `sizechart` image last.

When products/colours change: make the new shots the same way, upload with the alt convention,
set variant images, then `node scripts/make-snapshot.js` and re-test (cards, colour switch,
add to bag → checkout 302, no horizontal scroll at 390px).

## Instagram
@gullybrands.clothing (creator account) — Composio connection `instagram_diddy-waiter` (NOT `instagram_inky-inn`,
that's Nakoda Gold). Oct 2026: 12 product carousels posted (Mia lifestyle shot first, then studio shot per
colour; images from shop.gullybrands.in/assets/mia/). Linked in footer + JSON-LD `sameAs`.
Caption format: evocative hook line + emoji, one-sentence description, "₹499 · Sizes XS–XXL", colours,
"Soft 180 GSM cotton. Free shipping across India.", "Shop via the link in bio ✦", ~11 hashtags
(#itgirl #baddiestyle #lanadelreyaesthetic #coquette …). The API can't edit or delete posts; the owner
does that in the app. Post one at a time (bulk calls time out).

## Meta ads
Ad account "Gully Brands" 1012183625146645 (INR), FB Page "Gully Brands" 1199817166551074.
Meta pixel "Gully Brands · Mumbai's pixel" 2541478776319465 (created by Shopify's Facebook & Instagram app, so Purchase lands on it too) on index.html + help.html. Do NOT use 1064261386377988 ("Gully Brands app") for new ads — it belongs to app.gullybrands.in. It is TEMPORARILY also initialised on the site until the Oct crop-top campaign ends (16 Oct 2026; its ad set is locked to that pixel) — remove that fbq init line after; app.js fires ViewContent (quick view),
AddToCart, InitiateCheckout (300 ms delay before the Shopify redirect). Headless test browsers are
bot-filtered by fbevents: test with --disable-blink-features=AutomationControlled + a mobile UA.
Purchase fires on Shopify checkout via the Shopify app (installed Oct 2026).
Ad copy follows the brand rules above (no slang, never mention AI).

## Product pages + Google feed
`p/<handle>/index.html` (one real page per product, ?colour=&size= preselect, Add to bag → `/?bag=1`,
Buy now → cart permalink), `google-feed.xml` (one item per colour+size, g:id = Shopify variant id,
item_group_id = handle) and `sitemap.xml` are generated by `scripts/make-pages.js`, which
`node scripts/make-snapshot.js` runs automatically. Merchant Center fetches the feed daily — Shopify's
Google & YouTube app CAN'T sync (Shopify store is password-protected, primary domain is myshopify.com).

## Google
Search Console: property `https://shop.gullybrands.in/` (owner gullybrands.in@gmail.com, Composio `google_search_console_labber-dis`),
verified by the meta tag, sitemap submitted Oct 2026. Homepage indexed; 12 Product rich results detected.
Product JSON-LD (make-snapshot.js) carries delivery time + MerchantReturnNotPermitted — keep in sync with Merchant Center.

## Open to-dos for the owner
- 48 unused old hoodie/tee photos still sit in `assets/products/` (deletion not yet approved).
- Qikink's "Beige" looks pale yellow in mockups — confirm with a physical sample before renaming.
