/* ============================================================
   Gully Brands Clothing — storefront logic
   Static demo. Cart persists in localStorage.
   Checkout is wired to hand off to Shopify (see checkout()).
   ============================================================ */

const ADULT = ["S", "M", "L", "XL", "XXL"];
const KIDS = ["4-6Y", "6-8Y", "8-10Y", "10-12Y"];

const PRODUCTS = [
  { h:"spider-hoodie", t:"Spider Hoodie", price:1799, cat:"Hoodie", colors:["Red","Black"], sizes:ADULT,
    gallery:{ Red:["products/sh_red_01.jpg", "products/sh_red_02.jpg", "products/sh_red_03.jpg", "products/sh_red_04.jpg", "products/sh_red_05.jpg", "products/sh_red_06.jpg", "products/sh_red_07.jpg", "products/sh_red_08.jpg", "products/sh_red_09.jpg", "products/sh_red_10.jpg"],
              Black:["products/sh_blk_01.jpg", "products/sh_blk_02.jpg", "products/sh_blk_03.jpg", "products/sh_blk_04.jpg", "products/sh_blk_05.jpg", "products/sh_blk_06.jpg", "products/sh_blk_07.jpg", "products/sh_blk_08.jpg", "products/sh_blk_09.jpg", "products/sh_blk_10.jpg"] },
    d:"The white spider, front and back, on a heavyweight pullover hoodie. Red runs loud, black runs venom. Shot on the streets of Mumbai.",
    fab:"Heavyweight brushed-fleece cotton · front + back print", tag:"THE DROP" },
  { h:"spider-oversized-tee", t:"Oversized Spider Tee", price:999, cat:"Oversized", colors:["Black","White"], sizes:ADULT,
    gallery:{ Black:["products/ot_blk_01.jpg", "products/ot_blk_02.jpg", "products/ot_blk_03.jpg", "products/ot_blk_04.jpg", "products/ot_blk_05.jpg"],
              White:["products/ot_wht_01.jpg", "products/ot_wht_02.jpg", "products/ot_wht_03.jpg", "products/ot_wht_04.jpg", "products/ot_wht_05.jpg"] },
    d:"Oversized drop-shoulder tee with the spider big on the chest and bigger on the back. Black with white spider, white with black — pick your side.",
    fab:"180 GSM cotton · oversized drop-shoulder fit · front + back print" },
  { h:"spider-girl-tee", t:"Spider Girl Tee", price:599, cat:"Kids", colors:["Black","White"], sizes:KIDS,
    gallery:{ Black:["products/kt_blk_01.jpg", "products/kt_blk_02.jpg", "products/kt_blk_03.jpg", "products/kt_blk_04.jpg", "products/kt_blk_05.jpg", "products/kt_blk_06.jpg", "products/kt_blk_07.jpg", "products/kt_blk_08.jpg", "products/kt_blk_09.jpg"],
              White:["products/kt_wht_01.jpg", "products/kt_wht_02.jpg", "products/kt_wht_03.jpg", "products/kt_wht_04.jpg", "products/kt_wht_05.jpg", "products/kt_wht_06.jpg", "products/kt_wht_07.jpg", "products/kt_wht_08.jpg", "products/kt_wht_09.jpg"] },
    d:"The spider tee, fitted and sized down. Front and back print for the youngest baddies in the gully.",
    fab:"180 GSM bio-washed cotton · kids fit · front + back print" },
];

const CATS = ["All", "Hoodie", "Oversized", "Kids"];
const inr = n => "₹" + n.toLocaleString("en-IN");
const byH = h => PRODUCTS.find(p => p.h === h);
/* resolve an image ref to a real src: gallery paths live under assets/, legacy design cards under assets/designs/ */
const srcOf = ref => ref.includes("/") ? "assets/" + ref : "assets/designs/" + ref;
/* images for a product+color: gallery if present, else the single design card */
const imgsFor = (p, color) => p.gallery ? (p.gallery[color] || p.gallery[p.colors[0]]) : [p.img];
const coverOf = p => srcOf(imgsFor(p, p.colors[0])[0]);
let cart = JSON.parse(localStorage.getItem("gb_cart") || "[]");
let activeCat = "All";

/* ---------- product grid ---------- */
function productCard(p) {
  const swatches = p.colors.map(c =>
    `<span class="sw sw--${c.toLowerCase()}" title="${c}"></span>`).join("");
  return `
    <article class="card reveal" data-h="${p.h}" tabindex="0" aria-label="${p.t}">
      <div class="card__media">
        <img class="ly is-show" src="${coverOf(p)}" alt="${p.t}" loading="lazy">
        <img class="ly" alt="" aria-hidden="true">
        ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ""}
        <button class="card__quick" data-h="${p.h}">Quick add +</button>
      </div>
      <div class="card__body">
        <h3 class="card__title">${p.t}</h3>
        <div class="card__row">
          <span class="card__price">${inr(p.price)}</span>
          <span class="card__sw">${swatches}</span>
        </div>
      </div>
    </article>`;
}

/* preloaded crossfade between the two .ly layers — never shows black */
function crossfade(mediaEl, url) {
  if (!mediaEl) return;
  const ls = mediaEl.querySelectorAll("img.ly");
  if (ls.length < 2) return;
  const showing = ls[0].classList.contains("is-show") ? ls[0] : ls[1];
  const hidden = showing === ls[0] ? ls[1] : ls[0];
  const pre = new Image();
  pre.onload = () => {
    hidden.src = url;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      hidden.classList.add("is-show");
      showing.classList.remove("is-show");
    }));
  };
  pre.src = url;
}

function renderGrid() {
  const list = activeCat === "All" ? PRODUCTS : PRODUCTS.filter(p => p.cat === activeCat);
  document.getElementById("grid").innerHTML = list.map(productCard).join("");
  observeReveals();
  initCardCycles();
}

/* each card cycles through ALL its shots on its own staggered clock */
let cardTimers = [];
function initCardCycles() {
  cardTimers.forEach(t => { clearTimeout(t); clearInterval(t); });
  cardTimers = [];
  document.querySelectorAll(".card").forEach((card, ci) => {
    const p = byH(card.dataset.h);
    if (!p) return;
    const imgs = allImgsOf(p);
    if (imgs.length < 2) return;
    let idx = 0;
    const kick = setTimeout(() => {
      const iv = setInterval(() => {
        idx = (idx + 1) % imgs.length;
        crossfade(card.querySelector(".card__media"), srcOf(imgs[idx]));
      }, 3200);
      cardTimers.push(iv);
    }, 900 + ci * 1100);
    cardTimers.push(kick);
  });
}

function renderFilters() {
  document.getElementById("filters").innerHTML = CATS.map(c =>
    `<button class="chip ${c===activeCat?"is-active":""}" data-cat="${c}">${c}</button>`).join("");
}

/* ---------- quick view (auto-scrolling gallery) ---------- */
let qvState = null, qvTimer = null;
/* every image of the product, all colourways combined */
const allImgsOf = p => p.gallery ? p.colors.flatMap(c => p.gallery[c]) : [p.img];
function qvGallery(p) {
  const imgs = qvState.imgs;
  const thumbs = imgs.length > 1 ? `<div class="qv__thumbs">` + imgs.map((im,i) =>
    `<img src="${srcOf(im)}" class="${i===0?"is-on":""}" data-i="${i}" alt="">`).join("") + `</div>` : "";
  return `<div class="qv__stage"><img class="ly is-show" src="${srcOf(imgs[0])}" alt="${p.t}"><img class="ly" alt="" aria-hidden="true"></div>${thumbs}`;
}
function qvShow(idx) {
  if (!qvState) return;
  qvState.idx = idx;
  crossfade(document.querySelector(".qv__stage"), srcOf(qvState.imgs[idx]));
  const thumbs = document.querySelectorAll(".qv__thumbs img");
  thumbs.forEach((el,i) => el.classList.toggle("is-on", i === idx));
  if (thumbs[idx]) thumbs[idx].scrollIntoView({block:"nearest", behavior:"smooth"});
}
function qvNext(){ if (qvState) qvShow((qvState.idx + 1) % qvState.imgs.length); }
function qvAuto(){ qvStop(); qvTimer = setInterval(qvNext, 2400); }
function qvStop(){ if (qvTimer) { clearInterval(qvTimer); qvTimer = null; } }
function openQuick(h) {
  const p = byH(h);
  qvState = { h, color: p.colors[0], size: null, imgs: allImgsOf(p), idx: 0 };
  const colorBtns = p.colors.map((c,i) =>
    `<button class="opt ${i===0?"is-on":""}" data-type="color" data-val="${c}">${c}</button>`).join("");
  const sizeBtns = p.sizes.map(s =>
    `<button class="opt" data-type="size" data-val="${s}">${s}</button>`).join("");
  document.getElementById("qv").innerHTML = `
    <div class="qv__panel" role="dialog" aria-modal="true" aria-label="${p.t}">
      <button class="qv__close" aria-label="Close">✕</button>
      <div class="qv__media">${qvGallery(p)}</div>
      <div class="qv__info">
        ${p.tag?`<span class="qv__tag">${p.tag}</span>`:""}
        <h2 class="qv__title">${p.t}</h2>
        <div class="qv__price">${inr(p.price)}</div>
        <p class="qv__desc">${p.d}</p>
        <p class="qv__fab">${p.fab}</p>
        <div class="qv__opts">
          <div class="qv__label">Colour</div>
          <div class="opts" data-group="color">${colorBtns}</div>
          <div class="qv__label">Size <span id="sizehint">— pick one</span></div>
          <div class="opts" data-group="size">${sizeBtns}</div>
        </div>
        <button class="btn btn--full" id="qvAdd">Add to bag — ${inr(p.price)}</button>
        <p class="qv__ship">Free prepaid shipping · COD available · Dispatch in 24–48 hrs</p>
      </div>
    </div>`;
  document.getElementById("qv").classList.add("is-open");
  document.body.classList.add("noscroll");
  qvAuto();
  const media = document.querySelector(".qv__media");
  if (media) { media.addEventListener("mouseenter", qvStop); media.addEventListener("mouseleave", qvAuto); }
}
function closeQuick(){ qvStop(); document.getElementById("qv").classList.remove("is-open"); document.body.classList.remove("noscroll"); }

/* ---------- cart ---------- */
function saveCart(){ localStorage.setItem("gb_cart", JSON.stringify(cart)); updateCartUI(); }
function addToCart(h, color, size){
  const p = byH(h);
  const key = `${h}|${color}|${size}`;
  const ex = cart.find(i => i.key === key);
  if (ex) ex.qty++;
  else cart.push({ key, h, t:p.t, price:p.price, src:srcOf(imgsFor(p, color)[0]), color, size, qty:1 });
  saveCart(); openCart(); toast(`Added — ${p.t}`);
}
function setQty(key, delta){
  const it = cart.find(i => i.key === key); if(!it) return;
  it.qty += delta; if (it.qty <= 0) cart = cart.filter(i => i.key !== key);
  saveCart();
}
function cartCount(){ return cart.reduce((n,i)=>n+i.qty,0); }
function cartTotal(){ return cart.reduce((n,i)=>n+i.qty*i.price,0); }

function updateCartUI(){
  const c = cartCount();
  const badge = document.getElementById("cartCount");
  badge.textContent = c; badge.style.display = c ? "grid" : "none";
  document.getElementById("cartBody").innerHTML = cart.length ? cart.map(i => `
    <div class="ci">
      <img src="${i.src || ("assets/designs/" + i.img)}" alt="">
      <div class="ci__mid">
        <div class="ci__t">${i.t}</div>
        <div class="ci__meta">${i.color} · ${i.size}</div>
        <div class="ci__qty">
          <button data-q="-1" data-key="${i.key}">−</button>
          <span>${i.qty}</span>
          <button data-q="1" data-key="${i.key}">+</button>
        </div>
      </div>
      <div class="ci__price">${inr(i.price*i.qty)}</div>
    </div>`).join("") : `<div class="cart__empty">Your bag is empty.<br><span>Apni gully, apna brand — go grab a fit.</span></div>`;
  document.getElementById("cartTotal").textContent = inr(cartTotal());
  document.getElementById("checkoutBtn").disabled = !cart.length;
}
function openCart(){ document.getElementById("drawer").classList.add("is-open"); document.getElementById("scrim").classList.add("is-on"); }
function closeCart(){ document.getElementById("drawer").classList.remove("is-open"); document.getElementById("scrim").classList.remove("is-on"); }

function checkout(){
  // Ready for Shopify: each item maps to its variant. When the Shopify store is live,
  // build a cart permalink: https://<shop>.myshopify.com/cart/<variantId>:<qty>,...
  // For now (no store connected yet) show a clear handoff message.
  alert("Checkout is ready to connect to Shopify.\n\nOnce the Shopify store + Storefront token are added, this bag hands off to Shopify's secure checkout (Razorpay / COD / GST).\n\nBag total: " + inr(cartTotal()) + " · " + cartCount() + " item(s).");
}

/* ---------- toast ---------- */
let toastT;
function toast(msg){
  const el = document.getElementById("toast");
  el.textContent = msg; el.classList.add("is-on");
  clearTimeout(toastT); toastT = setTimeout(()=>el.classList.remove("is-on"), 1800);
}

/* ---------- reveal on scroll ---------- */
let io;
function observeReveals(){
  io = io || new IntersectionObserver((es)=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }}), {threshold:0.12});
  document.querySelectorAll(".reveal:not(.in)").forEach(el=>io.observe(el));
}

/* ---------- events ---------- */
document.addEventListener("click", (e) => {
  const quick = e.target.closest(".card__quick");
  const card = e.target.closest(".card");
  const chip = e.target.closest(".chip");
  const opt = e.target.closest(".opt");
  const qbtn = e.target.closest("[data-q]");

  if (quick) { e.stopPropagation(); openQuick(quick.dataset.h); return; }
  if (card && !e.target.closest(".card__quick")) { openQuick(card.dataset.h); return; }
  if (chip) { activeCat = chip.dataset.cat; renderFilters(); renderGrid(); return; }
  if (opt) {
    const group = opt.closest(".opts");
    group.querySelectorAll(".opt").forEach(o=>o.classList.remove("is-on"));
    opt.classList.add("is-on");
    qvState[opt.dataset.type] = opt.dataset.val;
    if (opt.dataset.type === "size") document.getElementById("sizehint").textContent = "— " + opt.dataset.val;
    if (opt.dataset.type === "color") {
      // jump the slideshow to this colourway's first shot
      const p = byH(qvState.h);
      if (p.gallery && p.gallery[qvState.color]) {
        qvShow(qvState.imgs.indexOf(p.gallery[qvState.color][0]));
        qvAuto();
      }
    }
    return;
  }
  const thumb = e.target.closest(".qv__thumbs img");
  if (thumb) {
    qvShow(+thumb.dataset.i);
    qvAuto();
    return;
  }
  if (qbtn) { setQty(qbtn.dataset.key, +qbtn.dataset.q); return; }
  if (e.target.id === "qvAdd") {
    if (!qvState.size) { document.getElementById("sizehint").textContent = "— please pick a size"; document.getElementById("sizehint").style.color = "var(--taxi)"; return; }
    addToCart(qvState.h, qvState.color, qvState.size); closeQuick(); return;
  }
  if (e.target.closest(".qv__close") || e.target.id === "qv") closeQuick();
  if (e.target.id === "cartOpen" || e.target.closest("#cartOpen")) openCart();
  if (e.target.id === "cartClose" || e.target.id === "scrim") closeCart();
  if (e.target.id === "checkoutBtn") checkout();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeQuick(); closeCart(); }});

/* ---------- init ---------- */
renderFilters();
renderGrid();
updateCartUI();
observeReveals();
document.getElementById("year").textContent = new Date().getFullYear();
