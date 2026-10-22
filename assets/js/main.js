/* Shared behaviour: theme, mobile menu, reveals, interactive keywords. */

(function () {
  var root = document.documentElement;
  var saved = localStorage.getItem("theme");
  root.setAttribute("data-theme", saved || "dark");

  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }

  var menuBtn = document.querySelector(".menu-btn");
  var tabs = document.querySelector(".tabs");
  if (menuBtn && tabs) {
    menuBtn.addEventListener("click", function () {
      var open = tabs.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  /* Keywords: label + sentence (data-text) + tags (data-tags, comma separated). */
  var kws = document.querySelectorAll(".kw");
  var panel = document.querySelector(".kw-panel");
  var tagbox = document.querySelector(".kw-tags");

  if (kws.length && panel) {
    var select = function (btn) {
      kws.forEach(function (b) { b.setAttribute("aria-selected", b === btn ? "true" : "false"); });
      panel.style.opacity = 0;
      window.setTimeout(function () {
        panel.textContent = btn.getAttribute("data-text");
        if (tagbox) {
          tagbox.innerHTML = (btn.getAttribute("data-tags") || "")
            .split(",")
            .filter(function (t) { return t.trim(); })
            .map(function (t) { return "<b>" + t.trim() + "</b>"; })
            .join("");
        }
        panel.style.opacity = 1;
      }, 140);
    };

    kws.forEach(function (btn) {
      btn.addEventListener("click", function () { select(btn); });
      btn.addEventListener("mouseenter", function () { select(btn); });
      btn.addEventListener("focus", function () { select(btn); });
    });
    select(kws[0]);
  }



  /* ---- Photos ----------------------------------------------------
     Files are images/profile_1.webp ... images/profile_8.webp
     (1280x1600). Change PHOTO_COUNT if you add or remove photos.
     One is drawn at random for the hero; the others fill the carousel. */
  var PHOTO_BASE = "images/profile_";
  var PHOTO_EXT = ".webp";
  var PHOTO_COUNT = 8;

  var heroImg = document.getElementById("hero-photo");
  var carTrack = document.querySelector(".car-track");

  if (heroImg || carTrack) {
    var all = [];
    for (var n = 1; n <= PHOTO_COUNT; n++) all.push(n);

    var pick = all[Math.floor(Math.random() * all.length)];

    if (heroImg) {
      heroImg.src = PHOTO_BASE + pick + PHOTO_EXT;
      heroImg.alt = "Pierre Bouchet";
    }

    if (carTrack) {
      var rest = heroImg ? all.filter(function (n) { return n !== pick; }) : all;
      carTrack.innerHTML = rest.map(function (n) {
        return '<figure class="frame"><img loading="lazy" decoding="async" width="1280" height="1600" src="' +
               PHOTO_BASE + n + PHOTO_EXT + '" alt="Pierre Bouchet, photograph ' + n + '"></figure>';
      }).join("");
    }
  }

  /* About carousel: scroll-snap track, dots, arrows, gentle autoplay. */
  var car = document.querySelector(".carousel");
  if (car) {
    var track = car.querySelector(".car-track");
    var slides = track.querySelectorAll(".frame");
    var dotBox = car.querySelector(".car-dots");
    var idx = 0;

    slides.forEach(function (s, i) {
      var d = document.createElement("button");
      d.setAttribute("aria-label", "Photo " + (i + 1));
      d.addEventListener("click", function () { go(i); });
      dotBox.appendChild(d);
    });
    var dots = dotBox.querySelectorAll("button");

    function paint() {
      dots.forEach(function (d, i) { d.setAttribute("aria-current", i === idx ? "true" : "false"); });
    }
    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.scrollTo({ left: slides[idx].offsetLeft - track.offsetLeft, behavior: "smooth" });
      paint();
    }
    car.querySelector(".car-prev").addEventListener("click", function () { go(idx - 1); });
    car.querySelector(".car-next").addEventListener("click", function () { go(idx + 1); });

    track.addEventListener("scroll", function () {
      var near = Math.round(track.scrollLeft / track.clientWidth);
      if (near !== idx && near >= 0 && near < slides.length) { idx = near; paint(); }
    });
    paint();

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && slides.length > 1) {
      var timer = window.setInterval(function () { go(idx + 1); }, 5200);
      car.addEventListener("mouseenter", function () { window.clearInterval(timer); });
    }
  }


  /* ---- My publications (assets/js/publications.js) ----------------
     Newest first. The first one feeds the "New paper" block on the home
     page; it reads "New paper" for a year, then "Latest paper". */
  var PUBS = (window.PUBLICATIONS || []).slice().sort(function (a, b) {
    return (b.date || "").localeCompare(a.date || "");
  });

  function pubLinks(p) {
    var scholar = p.scholar ||
      "https://scholar.google.com/scholar?q=" + encodeURIComponent('"' + p.title + '"');
    var l = [];
    if (p.doi) l.push('<a href="https://doi.org/' + p.doi + '" target="_blank" rel="noopener">Article</a>');
    if (p.pdf) l.push('<a href="' + p.pdf + '" target="_blank" rel="noopener">PDF</a>');
    if (p.code) l.push('<a href="' + p.code + '" target="_blank" rel="noopener">' + (p.codeAndData ? "Code &amp; Data" : "Code") + "</a>");
    if (p.data) l.push('<a href="' + p.data + '" target="_blank" rel="noopener">Data</a>');
    l.push('<a href="' + scholar + '" target="_blank" rel="noopener">Google Scholar</a>');
    return '<div class="pub-links">' + l.join("") + "</div>";
  }

  function codeNote(p) {
    if (!p.code) return "";
    var host = /github\.com/.test(p.code) ? "GitHub" : "an open repository";
    return '<p class="code-note"><span aria-hidden="true">&lt;/&gt;</span> Code' +
           (p.data || p.codeAndData ? " &amp; data" : "") + ' openly available on <a href="' + p.code +
           '" target="_blank" rel="noopener">' + host + "</a>" +
           (p.data ? ' &middot; archived on <a href="' + p.data + '" target="_blank" rel="noopener">Zenodo</a>' : "") +
           "</p>";
  }

  function venue(p) {
    return '<p class="venue">' + (p.journal || "") + (p.volume ? " &middot; " + p.volume : "") +
           (p.date ? " &middot; " + p.date.slice(0, 4) : "") + "</p>";
  }

  var feat = document.getElementById("new-paper");
  if (feat) {
    if (!PUBS.length) {
      feat.hidden = true;
    } else {
      var p = PUBS[0];
      var ageDays = (Date.now() - new Date(p.date)) / 864e5;
      feat.innerHTML =
        '<div class="np-card' + (p.pdf ? " np-has-page" : "") + '">' +
          (p.pdf
            ? '<a class="np-page" href="' + p.pdf + '" target="_blank" rel="noopener" aria-label="Open the PDF"><img alt="First page of the article"></a>'
            : (p.image ? '<figure class="np-img"><img src="' + p.image + '" alt="' + (p.imageAlt || "") + '" loading="lazy"></figure>' : "")) +
          '<div class="np-body">' +
            '<span class="np-badge">' + (ageDays < 365 ? "New paper" : "Latest paper") + "</span>" +
            "<h3>" + p.title + "</h3>" +
            '<p class="authors">' + p.authors + "</p>" +
            venue(p) +
            (p.summary ? '<p class="np-summary">' + p.summary + "</p>" : "") +
            codeNote(p) +
            pubLinks(p) +
          "</div>" +
        "</div>";

      /* The image is the first page of the PDF; the featured image
         is used if the page cannot be drawn. */
      var cover = feat.querySelector(".np-page");
      if (cover) {
        var coverImg = cover.querySelector("img");
        pdfCover(p.pdf).then(function (src) { coverImg.src = src; }, function () {
          if (p.image) cover.outerHTML = '<figure class="np-img"><img src="' + p.image + '" alt="' + (p.imageAlt || "") + '"></figure>';
          else cover.remove();
          feat.querySelector(".np-card").classList.remove("np-has-page");
        });
      }
    }
  }

  /* ---- Reading the PDF of a paper ---------------------------------
     pdf.js is loaded only when needed. The drawn page is kept in the
     browser, so each visitor reads the PDF only once. */
  function pdfPage1(url) {
    var pdfPages = pdfPage1.cache || (pdfPage1.cache = {});
    if (pdfPages[url]) return pdfPages[url];
    var PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
    pdfPages[url] = new Promise(function (resolve, reject) {
      if (window.pdfjsLib) return resolve();
      var s = document.createElement("script");
      s.src = PDFJS + "pdf.min.js";
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    }).then(function () {
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js";
      return pdfjsLib.getDocument(url).promise;
    }).then(function (doc) {
      return doc.getPage(1);
    });
    return pdfPages[url];
  }

  function cached(key, make) {
    try { var hit = localStorage.getItem(key); if (hit) return Promise.resolve(hit); } catch (e) {}
    return make().then(function (v) {
      if (v) { try { localStorage.setItem(key, v); } catch (e) {} }
      return v;
    });
  }

  /* First page drawn as a JPEG, 900 px wide. */
  function pdfCover(url) {
    return cached("cover:" + url, function () {
      return pdfPage1(url).then(function (page) {
        var vp = page.getViewport({ scale: 900 / page.getViewport({ scale: 1 }).width });
        var canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        return page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise
          .then(function () { return canvas.toDataURL("image/jpeg", 0.82); });
      });
    });
  }

  /* Title linked to the article (DOI, else the PDF). */
  function pubTitle(title, url) {
    return "<h3>" + (url ? '<a href="' + url + '" target="_blank" rel="noopener">' + title + "</a>" : title) + "</h3>";
  }

  /* The summary lives on the home page; here, just the paper. */
  var mine = document.getElementById("my-pubs");
  if (mine) {
    mine.innerHTML = PUBS.map(function (p) {
      return '<article class="pub pub-rich">' +
               '<div class="yr">' + (p.date || "").slice(0, 4) + "</div>" +
               "<div>" +
                 pubTitle(p.title, p.doi ? "https://doi.org/" + p.doi : p.pdf) +
                 '<p class="authors">' + p.authors + "</p>" +
                 venue(p) +
                 pubLinks(p) +
               "</div>" +
               (p.image ? '<figure class="pub-img"><img src="' + p.image + '" alt="' + (p.imageAlt || "") + '" loading="lazy"></figure>' : "") +
             "</article>";
    }).join("");
  }

  /* ---- Publications pulled from ORCID -----------------------------
     The public ORCID API needs no key. Works you register on your ORCID
     record appear here automatically, newest first. Papers already in
     publications.js are skipped. */
  var known = PUBS.map(function (p) { return (p.doi || "").toLowerCase(); });
  var box = document.getElementById("orcid-works");
  if (box) {
    var id = box.getAttribute("data-orcid");

    fetch("https://pub.orcid.org/v3.0/" + id + "/works", { headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        var groups = (data && data.group) || [];

        var items = groups.map(function (g) {
          var s = g["work-summary"][0];
          var year = s["publication-date"] && s["publication-date"].year
            ? s["publication-date"].year.value : "";
          var title = s.title && s.title.title ? s.title.title.value : "Untitled";
          var venue = s["journal-title"] ? s["journal-title"].value : "";
          var doi = "";
          (g["external-ids"] && g["external-ids"]["external-id"] || []).forEach(function (e) {
            if (e["external-id-type"] === "doi") doi = e["external-id-value"];
          });
          return { year: year, title: title, venue: venue, doi: doi };
        }).filter(function (it) {
          return known.indexOf(it.doi.toLowerCase()) === -1;
        }).sort(function (a, b) { return (b.year || 0) - (a.year || 0); });

        if (!items.length) {
          box.innerHTML = "";
          return;
        }

        box.innerHTML = items.map(function (it) {
          var links = it.doi
            ? '<div class="pub-links"><a href="https://doi.org/' + it.doi + '" target="_blank" rel="noopener">DOI</a></div>'
            : "";
          return '<article class="pub"><div class="yr">' + it.year + '</div><div>' +
                 pubTitle(it.title, it.doi ? "https://doi.org/" + it.doi : "") +
                 (it.venue ? '<p class="venue">' + it.venue + "</p>" : "") +
                 links + "</div></article>";
        }).join("");
      })
      .catch(function () { box.innerHTML = ""; });
  }

  /* ---- Topographic background --------------------------------------
     A contour map, drawn from a noise "terrain", sits behind the page
     and drifts slowly as you scroll (parallax).
     Under the mouse, the contour line at that altitude is faintly
     tinted. With reduced motion asked, only the still map is drawn.
     Tuning: SCALE size of the relief, STEP spacing of the contours,
     INDEX every n-th line is drawn heavier, PARALLAX scroll drift,
     LINE / MAJOR / HOVER opacity of the lines. */
  (function () {
  var SCALE = 460, STEP = 0.042, INDEX = 5, CELL = 12, PARALLAX = 0.3;
  var LINE = 0.032, MAJOR = 0.07, HOVER = 0.13;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Classic Perlin noise with a fixed seed, so the map never changes. */
  var perm = new Uint8Array(512);
  (function () {
    var p = [], s = 7;
    for (var i = 0; i < 256; i++) p[i] = i;
    for (i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      var j = s % (i + 1), tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }
    for (i = 0; i < 512; i++) perm[i] = p[i & 255];
  })();
  var fade = function (t) { return t * t * t * (t * (t * 6 - 15) + 10); };
  var grad = function (h, x, y) { return ((h & 1) ? -x : x) + ((h & 2) ? -y : y); };
  function perlin(x, y) {
    var X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    var u = fade(x), v = fade(y), a = perm[X] + Y, b = perm[X + 1] + Y;
    var l1 = grad(perm[a], x, y) + u * (grad(perm[b], x - 1, y) - grad(perm[a], x, y));
    var l2 = grad(perm[a + 1], x, y - 1) + u * (grad(perm[b + 1], x - 1, y - 1) - grad(perm[a + 1], x, y - 1));
    return l1 + v * (l2 - l1);
  }
  /* Terrain height in 0..1 at a point of the map */
  function height(mx, my) {
    var x = mx / SCALE, y = my / SCALE, h = 0, amp = 0.55, f = 1;
    for (var o = 0; o < 4; o++) { h += amp * perlin(x * f + o * 17.3, y * f - o * 9.1); amp *= 0.5; f *= 2.03; }
    return Math.max(0, Math.min(1, h * 0.9 + 0.5));
  }

  var makeCanvas = function (cls) {
    var c = document.createElement("canvas");
    c.className = cls; c.setAttribute("aria-hidden", "true");
    document.body.appendChild(c);
    return c;
  };
  var tc = makeCanvas("topo-canvas"), tx = tc.getContext("2d");
  var tdpr = 1, W = 0, H = 0, ink, amber, paths = [];
  var offY = 0, base = 0, hover = -1, glow = {}, busy = false;

  var readInk = function () {
    var css = getComputedStyle(document.documentElement);
    ink = css.getPropertyValue("--ink").trim();
    amber = css.getPropertyValue("--orange").trim();
  };

  /* Performance: the map is drawn once on a canvas twice the height of
     the screen (half a screen above, half below). Scrolling only slides
     that canvas; it is redrawn when the slide nears its edge, i.e.
     about every 1.5 screens of map, and never while idle. */
  var mapTop = function () { return base - H / 2; };     // map y of canvas row 0

  /* Marching squares: one Path2D per contour level. */
  function build() {
    base = offY;
    var cols = Math.ceil(W / CELL) + 1, rows = Math.ceil(2 * H / CELL) + 1, top = mapTop();
    var g = new Float32Array(cols * rows);
    for (var j = 0; j < rows; j++)
      for (var i = 0; i < cols; i++) g[j * cols + i] = height(i * CELL, j * CELL + top);

    var nLev = Math.floor(1 / STEP);
    paths = [];
    for (var l = 0; l <= nLev; l++) paths.push(new Path2D());

    for (j = 0; j < rows - 1; j++) {
      for (i = 0; i < cols - 1; i++) {
        var a = g[j * cols + i], b = g[j * cols + i + 1];
        var c = g[(j + 1) * cols + i + 1], d = g[(j + 1) * cols + i];
        var lo = Math.min(a, b, c, d), hi = Math.max(a, b, c, d);
        var x0 = i * CELL, y0 = j * CELL;
        for (l = Math.ceil(lo / STEP); l * STEP <= hi; l++) {
          var Lv = l * STEP, pts = [];
          if ((a < Lv) !== (b < Lv)) pts.push(x0 + CELL * (Lv - a) / (b - a), y0);
          if ((b < Lv) !== (c < Lv)) pts.push(x0 + CELL, y0 + CELL * (Lv - b) / (c - b));
          if ((d < Lv) !== (c < Lv)) pts.push(x0 + CELL * (Lv - d) / (c - d), y0 + CELL);
          if ((a < Lv) !== (d < Lv)) pts.push(x0, y0 + CELL * (Lv - a) / (d - a));
          var P = paths[l];
          for (var k = 0; k + 3 < pts.length; k += 4) { P.moveTo(pts[k], pts[k + 1]); P.lineTo(pts[k + 2], pts[k + 3]); }
        }
      }
    }
    slide();
    paint();
  }

  function slide() {
    tc.style.transform = "translate3d(0," + (base - offY) + "px,0)";
  }

  function paint() {
    tx.setTransform(tdpr, 0, 0, tdpr, 0, 0);
    tx.clearRect(0, 0, W, 2 * H);
    tx.strokeStyle = ink;
    paths.forEach(function (P, l) {
      var major = l % INDEX === 0;
      tx.globalAlpha = major ? MAJOR : LINE;
      tx.lineWidth = major ? 1 : 0.6;
      tx.stroke(P);
    });
    tx.strokeStyle = amber;
    tx.lineWidth = 0.8;
    for (var l in glow) {
      if (glow[l] < 0.01 || !paths[l]) continue;
      tx.globalAlpha = glow[l] * HOVER;
      tx.stroke(paths[l]);
    }
    tx.globalAlpha = 1;
  }

  function tick() {
    var moving = false;
    for (var l in glow) {
      var target = +l === hover ? 1 : 0;
      glow[l] += (target - glow[l]) * 0.12;
      if (Math.abs(target - glow[l]) > 0.01) moving = true;
      else if (!target) delete glow[l];
    }
    paint();
    if (moving) requestAnimationFrame(tick);
    else busy = false;
  }
  function kick() { if (!busy) { busy = true; requestAnimationFrame(tick); } }

  var tsize = function () {
    tdpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    tc.width = W * tdpr; tc.height = 2 * H * tdpr;
    tc.style.width = W + "px"; tc.style.height = 2 * H + "px"; tc.style.top = -H / 2 + "px";
    offY = still ? 0 : window.scrollY * PARALLAX;
    build();
  };

  readInk();
  tsize();
  /* Redraw on a real resize only: phones change the height a little
     when the address bar shows or hides. */
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (innerWidth !== W || Math.abs(innerHeight - H) > 120) tsize();
    }, 150);
  });
  new MutationObserver(function () { readInk(); paint(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  if (!still) {
    var scrollQueued = false;
    window.addEventListener("scroll", function () {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(function () {
        scrollQueued = false;
        offY = window.scrollY * PARALLAX;
        if (Math.abs(offY - base) > H * 0.45) build(); else slide();
      });
    }, { passive: true });

    var CARDS = ".np-card, .teach, .pub-rich";
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType === "mouse") {
        var lev = Math.round(height(e.clientX, e.clientY + offY) / STEP);
        if (lev !== hover) { hover = lev; if (!(lev in glow)) glow[lev] = 0; kick(); }
      }
      var card = e.target.closest && e.target.closest(CARDS);
      if (card) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      }
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", function () { hover = -1; kick(); });
  }

  })();

  /* Rotating keywords under the name.
     Edit the WORDS list below to change what cycles. */
  var rot = document.querySelector(".rotator");
  if (!rot) return;

  var WORDS = (rot.getAttribute("data-words") || "").split(",").map(function (w) { return w.trim(); });
  if (WORDS.length < 2) return;

  var slot = document.createElement("span");
  rot.appendChild(slot);
  slot.textContent = WORDS[0];

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    slot.classList.add("in");
    return;
  }

  var k = 0;
  slot.classList.add("in");
  window.setInterval(function () {
    slot.classList.remove("in");
    window.setTimeout(function () {
      k = (k + 1) % WORDS.length;
      slot.textContent = WORDS[k];
      slot.classList.add("in");
    }, 450);
  }, 2600);
})();
