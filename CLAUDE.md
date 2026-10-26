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
- Headline: "Born to be adored." (owner, 17 Oct 2026: do NOT use the parent-brand
  "Baddie Era. Made Loud." / loud-slogan style on this site — keep copy romantic, coquette, old-money.) Hot pink `--taxi:#FF4FA3` (deep `--taxi-deep`) is the accent.
- **Look (redesign 17 Oct 2026, owner: "mix Mirror Palais / LoveShackFancy / Motel Rocks / I.AM.GIA /
  Frankies / For Love & Lemons and create with freedom"):** cream paper editorial — `--paper:#F7EFDF`
  with `assets/decor/paper.jpg` texture, blush `--blush`, ink `--ink:#1B1316`; `.dark` sections flip to
  ink (story, footer). Fraunces VF thin italic display (`.sec__head h2`, hero "Baddie Era."), Fraunces
  Billboard for "Made Loud."/logo, Pinyon Script for script lines (`.script`), Inter body (Google Fonts).
  Arch-shaped photos (`--arch`), outlined marquee strip, satin section, rotating "free shipping" badge.
  Old names `--cream/--cream-dim/--panel/--line` are aliases so `app.js`/product pages keep working.
- Decor cut-outs in `assets/decor/` (bow, pearls, clips, roses, kiss = transparent WebP; satin, paper =
  jpg) were generated with Gemini `gemini-3-pro-image` (`scripts/decor/gen.sh`, prompts in
  `scripts/decor/prompts/`, rendered on pure black then keyed with `scripts/decor/key.py`). Of the owner's
  11 Gemini keys only #4 (buttfeet26 free project) can generate images; the "Tier 1" ones return
  RESOURCE_EXHAUSTED limit 0. `.decor` imgs are `position:absolute; height:auto` — keep width/height
  attrs equal to the real file size. Playwright full-page captures stretch them; judge decor from
  viewport screenshots.
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
- Each product has SEO title/description, a vibe line opening its description (rewritten 17 Oct 2026 in the
  romantic/coquette tone — no slang, no "baddie edition"), and a
  readable handle (e.g. `crystal-bow-crop-top`; old handles redirect).

## Delivery promises (must match Google Merchant Center shipping settings)
Qikink: print + pack + dispatch 2–3 working days (Mon–Sat), courier 3–5 working days → ~5–8 total.
Site copy, FAQ JSON-LD and Merchant Center (account 5871128361, timezone IST) all say this — change them together.
Two google-site-verification meta tags are in index.html (6Y3rt… = Search Console/gullybrands.in@gmail.com, r_98q30… = Merchant Center 5871128361) — never remove either.

## Product photos (Mia, AI model) — redone 17 Oct 2026
54 photos, one **per-design shoot** (owner: "each product needs its own style, match the aesthetic of the top;
adult it-girl / Pinterest / Y2K, not baby-pink"): a lifestyle scene per design + a matching studio set per
colour (Spider charcoal+lace, Radio Silence concrete, 8 Ball green, Brunette cream, Lucky Girl red, Leopard
black, Star Girl silver, Lucky 8 navy, Monaco blue-grey, National Anthem warm beige, Blonde sky-blue,
Crystal Bow greige). Mia is mid-twenties, slim hourglass; **blonde** for Life Is Better Blonde.
Made with Gemini `gemini-3-pro-image` (key #4) from the Qikink mockup + a chest crop of the print as
reference — pipeline in the session scratchpad `shoot/` (`plan.py` per-product briefs, `run.py` lifestyle →
studio per colour using the lifestyle shot as face/tee reference, `redo.py` re-runs a studio shot from a
good sibling studio shot — the fix for face/print drift, `finalize.py` → `assets/mia/` 1200x1500 + alt
manifest). Lessons: no necklaces/chains (they cover the print); ask for "no readable brand names, logos or
signage" (dive bar / Monaco first drafts had beer and Ferrari logos); white studio shots drift most — re-run
from a sibling colour; QC every render against the mockup crop (print redrawn ≈ 1 in 8).
Files: `assets/mia/<handle>__<colour>__<studio|life>.jpg`; share image via `scripts/mia/make_og.py`
(cream look). Older Krea/Qwen pipeline (`scripts/mia/*.py`, `gully-media/gully.py`) is superseded.
- Qwen-Image 2.1 licence note no longer applies (not used for the current set).
- Shopify alt-text convention drives the site gallery (`buildProducts` in `shopify.js`):
  `Mia wearing the <title> in <Colour>` (studio, first) · `… in <Colour> — <scene>` (lifestyle) ·
  `<title> in <Colour> — product photo, front|back` (Qikink mockup, other model — hidden on the site
  whenever a colour has Mia shots; still in Shopify) · size chart last.
  Every colour's variants use its Mia studio shot as variant image; Mia media are first in each gallery.
- Hero shows two lifestyle arches (crystal-bow black, national-anthem white); lookbook = 6 lifestyle tiles.
- Size chart: branded `assets/gully-sizechart.png` (`scripts/make_sizechart.py`) is the last photo on
  every product (Qikink's chart was removed) and is shown on help.html. Site keeps any `sizechart` image last.

When products/colours change: make the new shots the same way, push to `assets/mia/` (GitHub Pages hosts
them), `productCreateMedia` from the shop URLs with the alt convention, delete the old Mia media, set variant
images + reorder, then `node scripts/make-snapshot.js` and re-test (cards, colour switch, add to bag →
checkout 302, no horizontal scroll at 390px).

## Instagram
@gullybrands.clothing (creator account) — Composio connection `instagram_diddy-waiter` (NOT `instagram_inky-inn`,
that's Nakoda Gold; the Composio "account" field takes the alias "Gully brands clothing"). 17 Oct 2026: 12 new
product carousels posted with the per-design shoot (Mia lifestyle shot first, then studio shot per colour;
images from shop.gullybrands.in/assets/mia/, captions in the romantic/coquette tone). The 12 carousels from
8 Oct (old photos, DePY…/DePZ… permalinks) must be deleted by the owner in the app — the API has no media
delete, only comment delete. Linked in footer + JSON-LD `sameAs`.
Reels (18 Oct 2026): 4 beat-cut reels posted by the owner with in-app music (Espresso, Young and Beautiful,
Bed Chem, Taste) — DenKUZRuWoj, DenK0jkOhHm, DenLD3yOYUQ, DenLRXlOtbn. Clips = Veo 3.1 Lite (key #4, ~10/day
quota) + Gemini Omni (Interactions API, `input` = list of {type:image|text}) image-to-video from assets/mia;
cut to each song's BPM in ffmpeg (session scratchpad `reels/assemble.py`). Licensed songs can't be added via
API — always deliver silent reels and let the owner add audio in the app.
Caption format: evocative hook line + emoji, one-sentence description, "₹499 · Sizes XS–XXL", colours,
"Soft 180 GSM cotton. Free shipping across India.", "Shop via the link in bio ✦", ~11 hashtags
(#itgirl #baddiestyle #lanadelreyaesthetic #coquette …). The API can't edit or delete posts; the owner
does that in the app. Post one at a time (bulk calls time out).

## Meta ads
Ad account "Gully Brands" 1012183625146645 (INR), FB Page "Gully Brands" 1199817166551074.
Meta pixel "Gully Brands · Mumbai's pixel" 2541478776319465 (created by Shopify's Facebook & Instagram app, so Purchase lands on it too) on index.html + help.html. Do NOT use 1064261386377988 ("Gully Brands app") for new ads — it belongs to app.gullybrands.in.; app.js fires ViewContent (quick view),
AddToCart, InitiateCheckout (300 ms delay before the Shopify redirect). Headless test browsers are
bot-filtered by fbevents: test with --disable-blink-features=AutomationControlled + a mobile UA.
Purchase fires on Shopify checkout via the Shopify app (installed Oct 2026).
Ad copy follows the brand rules above (no slang, never mention AI).
Campaign "GB Shop | Born to be adored | Sales | Nov 2026" (52709810116634, ₹500/day CBO, live 26 Oct 2026): 8 reels + carousel
(each card → its /p/<handle>/ page) + 2 photo ads, all UTM-tagged (utm_campaign=born_to_be_adored, utm_content per ad).
**Facebook placements only** — the old IG account is banned; add the new IG page to the creatives + placements once it exists.
The pixel 2541478776319465 had to be assigned to the ad account in Business Settings → Datasets → Connected assets
(without it every publish silently stalls with "Account does not have access to pixel"). Oct 2026 campaign paused 26 Oct.
Oct 2026 campaign "GB Shop | Crop Tops | Sales | Oct 2026" (₹100/day, 9–16 Oct, 2 carousels covering all 12 tops) ended; it used the old pixel, removed from the site 17 Oct.

## Product pages + Google feed
`p/<handle>/index.html` (one real page per product, ?colour=&size= preselect, Add to bag → `/?bag=1`,
Buy now → cart permalink), `google-feed.xml` (one item per colour+size, g:id = Shopify variant id,
item_group_id = handle) and `sitemap.xml` are generated by `scripts/make-pages.js`, which
`node scripts/make-snapshot.js` runs automatically. Merchant Center fetches the feed daily — Shopify's
Google & YouTube app CAN'T sync (Shopify store is password-protected, primary domain is myshopify.com).

## Google
Merchant Center (5871128361) flagged **"Affiliates / Abuse of the network — landing pages designed to send
customers elsewhere"** on 13 Oct 2026: checkout leaves shop.gullybrands.in for 5w3pdc-k7.myshopify.com.
17 Oct: site now explains the Shopify checkout (FAQ "Where do I pay?", help.html#shipping, product note),
has About / Terms of Sale / Privacy sections on help.html linked from every footer, and no longer links out
to gullybrands.in. 18 Oct: **checkout.gullybrands.in** (Hostinger CNAME → shops.myshopify.com) is the
Shopify primary domain; `SHOPIFY_CHECKOUT` in app.js and `CHECKOUT` in scripts/make-pages.js point there
(the Storefront API in shopify.js still uses 5w3pdc-k7.myshopify.com — leave it). Merchant Center Business
info: Online store must be **shop.gullybrands.in** (product links live there; checkout.gullybrands.in there caused "Mismatched online
store URL" on all 252 items, 25 Oct) and Checkout URL `https://shop.gullybrands.in/?add={id}` (app.js adds that variant to the bag
and opens it). Owner then requests review.
Search Console: property `https://shop.gullybrands.in/` (owner gullybrands.in@gmail.com, Composio `google_search_console_labber-dis`),
verified by the meta tag, sitemap submitted Oct 2026. Homepage indexed; 12 Product rich results detected.
Product JSON-LD (make-snapshot.js) carries delivery time + MerchantReturnNotPermitted — keep in sync with Merchant Center.

## Background music
`music.js` (loaded with `defer` before `</body>` on index, help, 404 and every product page via make-pages.js) is a
port of the Nakoda Silver theme player, restyled cream/ink/pink. Same 13-song shuffled playlist, streamed from
`https://nakodasilver.com/cdn/shop/files/ns-*.mp3` (CORS open) — files are NOT copied here. Never edit the Nakoda
Silver site/theme for this; if those files are removed there, update `TRACKS` in music.js. Muted-autoplay fallback,
unmutes on first tap/key, resumes mid-song across pages (`gb_np` storage), hides while bag/quick view is open.

## Campaign "Born to be adored" (26 Oct 2026)
For the new IG page + Meta ads. `assets/campaign/`: 12 cinematic 9:16 start frames (`<handle>.jpg`, Gemini key #4 from the Mia
studio shot + mockup + print crop), 12 print close-ups 4:5 (`close/`), 12 Kling V3 Pro 5 s clips (`clips/`, Wiro
`klingai/kling-v3` mode pro, ~$0.56 each) and 8 silent reels (`reels/`: 4 scene reels + 4 "which one are you?", cuts on a
100 BPM grid, cream end card). Scripts in `scripts/campaign/` (brief.py = scenes + motion prompts). Wiro: HMAC signature auth,
needs a non-urllib User-Agent (Cloudflare 1010), 1 concurrent task at <$20 balance. Veo 3.1 on Wiro blocks these fashion
shots (safety filter); ModelsLab premium video is quota-locked, its LTX-2.3 is 512px and redraws prints — use Kling.

## Open to-dos for the owner
- 48 unused old hoodie/tee photos still sit in `assets/products/` (deletion not yet approved).
- Qikink's "Beige" looks pale yellow in mockups — confirm with a physical sample before renaming.
