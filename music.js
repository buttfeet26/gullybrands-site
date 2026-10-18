/* Background music player — a port of the Nakoda Silver player (nakodasilver.com, theme t/59):
   same 13-track shuffled playlist, same behaviour, restyled for Gully Brands.
   - Tracks stream straight from Nakoda Silver's Shopify CDN (CORS *), nothing is copied here.
   - Browsers refuse audible autoplay, so it starts muted and unmutes on the first tap/key.
   - Queue, track and position live in session/localStorage, so the song carries on mid-track
     across page loads (this is a multi-page static site).
   - A pause holds for the session only, then resets on the next visit.
   - Hidden while the bag drawer (#drawer.is-open) or quick view (#qv.is-open) is open.
   Include on every page with <script src="/music.js" defer></script>. */
(function () {
  "use strict";
  if (window.__gbMusic) return; window.__gbMusic = true;
  var CDN = "https://nakodasilver.com/cdn/shop/files/";
  var TRACKS = [
    ["ns-01-brutal.mp3?v=6558206772674691450", "brutal", "Olivia Rodrigo"],
    ["ns-02-make-you-mine.mp3?v=17292778047653202332", "Make You Mine", "PUBLIC"],
    ["ns-03-end-of-beginning.mp3?v=8779503696832124033", "End of Beginning", "Djo"],
    ["ns-04-come-with-me.mp3?v=13374676888816767158", "Come With Me", "Surfaces"],
    ["ns-05-die-with-a-smile.mp3?v=9077723313172335486", "Die With a Smile", "Lady Gaga & Bruno Mars"],
    ["ns-06-dancing-queen.mp3?v=4001468766365904298", "Dancing Queen", "AVVA"],
    ["ns-07-life-itself.mp3?v=13505462124606007942", "Life Itself", "Glass Animals"],
    ["ns-08-sofia.mp3?v=17906398914985293805", "Sofia", "Clairo"],
    ["ns-09-acting-my-age.mp3?v=17332279538863927908", "Acting My Age", "The Academic"],
    ["ns-10-overdrive.mp3?v=1143459572534981037", "Overdrive", "Conan Gray"],
    ["ns-11-dizzy.mp3?v=11220763802663013440", "Dizzy", "chloe moriondo"],
    ["ns-12-broken.mp3?v=11092068835794918035", "Broken", "Alfie Templeman"],
    ["ns-13-complete-mess.mp3?v=15872864294170874321", "Complete Mess", "5 Seconds of Summer"]
  ].map(function (t) { return { src: CDN + t[0], title: t[1], artist: t[2] }; });

  var css =
    ".np{position:fixed;right:22px;bottom:22px;z-index:55;display:flex;align-items:center;transition:opacity .25s,transform .25s}" +
    ".np.np-away{opacity:0;transform:translateY(10px);pointer-events:none}" +
    ".np-shell{display:flex;align-items:center;height:42px;width:42px;padding:0;background:rgba(247,239,223,.92);border:1px solid rgba(27,19,22,.18);border-radius:100px;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 6px 22px -8px rgba(27,19,22,.45);overflow:hidden;cursor:pointer;position:relative;transition:width .4s cubic-bezier(.22,1,.36,1),padding .4s cubic-bezier(.22,1,.36,1)}" +
    ".np.open .np-shell{width:240px;padding:0 6px 0 10px;cursor:default}" +
    ".np-badge{flex:0 0 42px;width:42px;height:42px;display:flex;align-items:center;justify-content:center;transition:flex-basis .4s cubic-bezier(.22,1,.36,1),width .4s cubic-bezier(.22,1,.36,1)}" +
    ".np.open .np-badge{flex-basis:0;width:0;overflow:hidden}" +
    ".np-eq{display:flex;align-items:flex-end;gap:2.2px;height:12px}" +
    ".np-eq i{display:block;width:2.4px;height:3.5px;background:#FF4FA3;border-radius:1px}" +
    ".np.playing .np-eq i{animation:npbob .9s ease-in-out infinite}" +
    ".np.playing .np-eq i:nth-child(2){animation-delay:.16s}.np.playing .np-eq i:nth-child(3){animation-delay:.33s}" +
    "@keyframes npbob{0%,100%{height:3.5px}50%{height:12px}}" +
    ".np:not(.playing) .np-eq{display:none}" +
    ".np-tri{display:none;width:0;height:0;border-left:8px solid #1B1316;border-top:5.5px solid transparent;border-bottom:5.5px solid transparent;margin-left:2px}" +
    ".np:not(.playing) .np-tri{display:block}" +
    ".np.virgin .np-shell::before,.np.muted .np-shell::before{content:'';position:absolute;left:0;top:0;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,79,163,.6);animation:npring 2.6s ease-out infinite}" +
    "@keyframes npring{0%{transform:scale(1);opacity:.6}70%{transform:scale(1.55);opacity:0}100%{opacity:0}}" +
    ".np-inner{display:flex;align-items:center;gap:2px;opacity:0;transform:translateX(-6px);white-space:nowrap;pointer-events:none;transition:opacity .22s ease .12s,transform .3s cubic-bezier(.22,1,.36,1) .1s}" +
    ".np.open .np-inner{opacity:1;transform:none;pointer-events:auto}" +
    ".np-btn{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:0;background:none;padding:0;cursor:pointer;color:#1B1316;border-radius:50%;opacity:.72;transition:background .16s,opacity .16s}" +
    ".np-btn:hover{background:rgba(255,79,163,.12);opacity:1}.np-btn:focus-visible{outline:2px solid #FF4FA3;outline-offset:1px}" +
    ".np-btn svg{width:12px;height:12px;fill:currentColor;display:block}.np-btn.main{opacity:1}.np-btn.main svg{width:13.5px;height:13.5px}" +
    ".np-meta{display:flex;flex-direction:column;margin-left:6px;min-width:0;overflow:hidden;font-family:Inter,system-ui,sans-serif}" +
    ".np-t{font-family:Fraunces,Georgia,serif;font-style:italic;font-size:13px;color:#1B1316;line-height:1.2;overflow:hidden;text-overflow:ellipsis;max-width:136px}" +
    ".np-a{font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:#7A6670;line-height:1.4;overflow:hidden;text-overflow:ellipsis;max-width:136px}" +
    "@media (max-width:749px){.np{right:14px;bottom:14px}}" +
    "@media (prefers-reduced-motion:reduce){.np,.np-shell,.np-badge,.np-inner{transition-duration:.01ms}.np-eq i{animation:none}.np.virgin .np-shell::before{animation:none}}";
  var style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);

  var np = document.createElement("div");
  np.className = "np virgin"; np.id = "np"; np.setAttribute("aria-label", "Background music");
  np.innerHTML =
    '<div class="np-shell" id="npShell"><div class="np-badge"><div class="np-eq" aria-hidden="true"><i></i><i></i><i></i></div><div class="np-tri" aria-hidden="true"></div></div>' +
    '<div class="np-inner">' +
    '<button class="np-btn" id="npPrev" aria-label="Previous track"><svg viewBox="0 0 24 24"><path d="M6 5h2.5v14H6zM20 5v14L9.5 12z"/></svg></button>' +
    '<button class="np-btn main" id="npPlay" aria-label="Play"><svg id="npIcPlay" viewBox="0 0 24 24"><path d="M7 4.5v15L20 12z"/></svg><svg id="npIcPause" viewBox="0 0 24 24" style="display:none"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z"/></svg></button>' +
    '<button class="np-btn" id="npNext" aria-label="Next track"><svg viewBox="0 0 24 24"><path d="M15.5 5H18v14h-2.5zM4 5v14l10.5-7z"/></svg></button>' +
    '<div class="np-meta"><div class="np-t" id="npT">&mdash;</div><div class="np-a" id="npA"></div></div></div></div>';
  document.body.appendChild(np);
  var au = document.createElement("audio"); au.id = "npAudio"; au.preload = "none"; document.body.appendChild(au);

  var $ = function (id) { return document.getElementById(id); };
  var shell = $("npShell"), bPlay = $("npPlay"), bPrev = $("npPrev"), bNext = $("npNext");
  var icP = $("npIcPlay"), icU = $("npIcPause"), elT = $("npT"), elA = $("npA");
  var order = [], cur = 0, closeT = null, touch = matchMedia("(hover:none)").matches;

  // A pause holds for this session only (a permanent flag silenced the site forever for anyone who paused once).
  function store(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }

  function shuffle() {
    var a = TRACKS.map(function (_, i) { return i; });
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    order = a; cur = 0;
  }
  function load(auto, start) {
    var t = TRACKS[order[cur]];
    // #t= makes Safari start mid-file; iOS ignores a currentTime set on loadedmetadata.
    au.src = t.src + (start > 0.5 ? "#t=" + start.toFixed(1) : ""); elT.textContent = t.title; elA.textContent = t.artist;
    if (auto) au.play().catch(function () {});
  }
  function setPlaying(on) {
    var waiting = on && au.muted;   // running muted, waiting for the first tap
    np.classList.toggle("muted", waiting);
    shell.setAttribute("aria-label", waiting ? "Tap anywhere for sound" : "Background music");
    on = on && !au.muted;
    np.classList.toggle("playing", on);
    icP.style.display = on ? "none" : "block"; icU.style.display = on ? "block" : "none";
    bPlay.setAttribute("aria-label", on ? "Pause" : "Play");
  }
  function step(d, forcePlay) {
    pendingT = 0; cur += d;
    if (cur >= order.length) shuffle(); else if (cur < 0) cur = order.length - 1;
    load(forcePlay === undefined ? !au.paused : forcePlay); save();
  }
  function open() { np.classList.add("open"); np.classList.remove("virgin"); clearTimeout(closeT); }
  function close() { np.classList.remove("open"); }
  function later(ms) { clearTimeout(closeT); closeT = setTimeout(close, ms); }

  shell.addEventListener("mouseenter", function () { if (!touch) open(); });
  np.addEventListener("mouseleave", function () { if (!touch) later(1200); });
  shell.addEventListener("click", function (e) { if (touch && !np.classList.contains("open")) { e.stopPropagation(); open(); later(4000); } });
  np.addEventListener("click", function (e) { e.stopPropagation(); if (touch && np.classList.contains("open")) later(4000); });
  document.addEventListener("click", function () { if (touch) close(); });

  // Running-but-muted shows the Play icon, so a tap there means "give me sound", not "pause".
  bPlay.addEventListener("click", function (e) {
    e.stopPropagation();
    if (au.paused || au.muted) { if (!au.src) load(false); au.muted = false; au.play().catch(function () {}); store("gb_music", "on"); }
    else { au.pause(); store("gb_music", "off"); }
    disarm(); if (touch) later(4000);
  });
  bPrev.addEventListener("click", function (e) { e.stopPropagation(); au.muted = false; store("gb_music", "on"); disarm(); step(-1, true); if (touch) later(4000); });
  bNext.addEventListener("click", function (e) { e.stopPropagation(); au.muted = false; store("gb_music", "on"); disarm(); step(1, true); if (touch) later(4000); });

  au.addEventListener("play", function () { setPlaying(true); });
  au.addEventListener("pause", function () { setPlaying(false); });
  au.addEventListener("ended", function () { step(1, true); });   // au.paused is already true here, so force play
  au.addEventListener("volumechange", function () { setPlaying(!au.paused); });
  au.volume = 0.35;

  // Skip a genuinely bad file — but not a load cancelled by navigation (WebKit reports those as errors too).
  var skips = 0, leaving = false;
  au.addEventListener("error", function () {
    if (leaving || (au.error && au.error.code === 1)) return;
    var failed = au.src;
    setTimeout(function () {
      if (leaving || document.hidden || au.src !== failed) return;
      if (skips++ < TRACKS.length) step(1, true);
    }, 2500);
  });
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var h = a.getAttribute("href") || "";
    if (h.charAt(0) === "#" || a.origin !== location.origin) return;
    leaving = true; save();
  }, true);

  // Step aside while the bag drawer or quick view is open.
  function away() {
    var d = $("drawer"), q = $("qv");
    np.classList.toggle("np-away", !!((d && d.classList.contains("is-open")) || (q && q.classList.contains("is-open"))));
  }
  if (window.MutationObserver) ["drawer", "qv"].forEach(function (id) { var el = $(id); if (el) new MutationObserver(away).observe(el, { attributes: true, attributeFilter: ["class"] }); });

  // ---- continuity across pages ----
  var SKEY = "gb_np", pendingT = 0;
  function save() {
    var t = pendingT || au.currentTime || 0;
    var v = JSON.stringify({ o: order, c: cur, t: t, p: !au.paused, ts: +new Date() });
    try { sessionStorage.setItem(SKEY, v); } catch (e) {}
    try { localStorage.setItem(SKEY, v); } catch (e) {}   // new tabs resume the same song
  }
  function restore() {
    try {
      var raw = null;
      try { raw = sessionStorage.getItem(SKEY); } catch (e) {}
      if (!raw) { try { raw = localStorage.getItem(SKEY); } catch (e) {} }
      var s = JSON.parse(raw || "null");
      if (s && s.ts && (+new Date() - s.ts) > 1800000) return null;   // >30 min = new visit, reshuffle
      if (s && s.o && s.o.length === TRACKS.length) return s;
    } catch (e) {}
    return null;
  }
  var seekTries = 0;
  function applySeek() {
    if (!pendingT) return;
    if (Math.abs((au.currentTime || 0) - pendingT) < 1.5) { pendingT = 0; return; }
    if (au.readyState < 1 || seekTries >= 6) return;
    seekTries++; try { au.currentTime = pendingT; } catch (e) {}
  }
  ["loadedmetadata", "canplay", "playing", "seeked"].forEach(function (ev) { au.addEventListener(ev, applySeek); });
  function seekTo(t) { if (!t) return; pendingT = t; seekTries = 0; applySeek(); }

  var st = restore();
  if (st) { order = st.o; cur = st.c || 0; } else shuffle();
  au.preload = "auto";
  load(false, st ? st.t : 0); setPlaying(false);
  if (st) seekTo(st.t);

  var lastSave = 0;
  au.addEventListener("timeupdate", function () { var n = +new Date(); if (n - lastSave > 2000) { lastSave = n; save(); } });
  window.addEventListener("pagehide", function () { leaving = true; save(); });
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    leaving = false;
    var s = restore(); if (!s) return;
    var was = !au.paused;
    if (s.c !== cur || String(s.o) !== String(order)) { order = s.o; cur = s.c || 0; load(false, s.t); seekTo(s.t); }
    else if (Math.abs((au.currentTime || 0) - (s.t || 0)) > 3) seekTo(s.t);
    if (was || s.p) au.play().catch(function () {});
  });
  window.addEventListener("beforeunload", function () { leaving = true; });
  document.addEventListener("visibilitychange", function () { if (document.hidden) save(); });

  // ---- autoplay, as far as browsers allow ----
  var GEST = ["pointerdown", "pointerup", "click", "keydown", "touchend"];   // not scroll: it grants no user activation
  function disarm() { GEST.forEach(function (e) { window.removeEventListener(e, fire, true); }); }
  function fire(e) {
    if (e && e.target && np.contains(e.target)) return;   // the player's own buttons handle themselves
    if (read("gb_music") === "off") { disarm(); return; }
    au.muted = false;
    var p = au.play();
    if (p && p.then) p.then(function () { disarm(); setPlaying(true); store("gb_music", "on"); }).catch(function () {});
    else { disarm(); setPlaying(true); }
  }
  function arm() { GEST.forEach(function (e) { window.addEventListener(e, fire, { capture: true, passive: true }); }); }

  if (read("gb_music") === "off") np.classList.remove("virgin");
  else {
    // Try with sound (works for returning visitors); if refused, run muted and unmute on the first tap.
    var pr = au.play();
    if (pr && pr.then) pr.then(function () { setPlaying(true); }).catch(function () { au.muted = true; var mp = au.play(); if (mp && mp.catch) mp.catch(function () {}); arm(); });
    else arm();
    setTimeout(function () { np.classList.remove("virgin"); }, 10000);
  }
})();
