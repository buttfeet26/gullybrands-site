# @gullybrands.clothing — profile setup (≈5 minutes, in the Instagram app)

Instagram doesn't let apps change the photo, name or bio, so do these in the app:
**Profile → Edit profile**.

## 1. Profile photo
Upload `profile-photo.jpg` (pink-chrome GB on black, matches the site).

## 2. Name (this field is searchable, so use keywords)
```
Gully Brands | Y2K Crop Tops
```

## 3. Bio (fits Instagram's 150-character limit)
```
Y2K crop tops for the it girl 🎀
Coquette · leopard · grunge · ₹499
Free shipping across India ✦
Shop the drop ↓
```

## 4. Link
Edit profile → Links → Add external link
- URL: `https://shop.gullybrands.in`
- Title: `Shop the drop`

## 5. Category & contact
Edit profile → Category: **Clothing (Brand)** · turn **Display category** on.
Contact options → Email: `gullybrands.in@gmail.com`.

## 6. Highlights (Shop · Sizes · Shipping · FAQ · New)
Highlights are made from stories:
1. Post each story slide (`story-shop.jpg`, `story-sizes.jpg`, `story-shipping.jpg`, `story-faq.jpg`)
   as a story. Claude can post these for you.
2. On your profile tap **+ New** under the bio → pick the story → name it → **Edit cover** →
   choose the matching `highlight-cover-*.jpg` from your photos.

| Highlight | Story | Cover |
|---|---|---|
| Shop | story-shop.jpg | highlight-cover-shop.jpg |
| Sizes | story-sizes.jpg | highlight-cover-sizes.jpg |
| Shipping | story-shipping.jpg | highlight-cover-shipping.jpg |
| FAQ | story-faq.jpg | highlight-cover-faq.jpg |
| New | (add new-drop stories later) | highlight-cover-new.jpg |

## 7. Nice to have
- Settings → Account type → stay on **Creator** or switch to **Business** (both work with ads).
- Later: connect Instagram Shopping via Shopify's Facebook & Instagram app so posts can tag products.

Regenerate the images any time: `python3 scripts/make_ig_kit.py` (from the repo root).
