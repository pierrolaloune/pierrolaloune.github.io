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
     Files are images/profile_1.jpg ... images/profile_8.jpg
     Change PHOTO_COUNT if you add or remove photos.
     One is drawn at random for the hero; the others fill the carousel. */
  var PHOTO_BASE = "images/profile_";
  var PHOTO_EXT = ".jpg";
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
        return '<figure class="frame"><img loading="lazy" src="' + PHOTO_BASE + n + PHOTO_EXT +
               '" alt="Pierre Bouchet, photograph ' + n + '"></figure>';
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


  /* ---- Publications pulled from ORCID -----------------------------
     The public ORCID API needs no key. Works you register on your ORCID
     record appear here automatically, newest first. */
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
                 "<h3>" + it.title + "</h3>" +
                 (it.venue ? '<p class="venue">' + it.venue + "</p>" : "") +
                 links + "</div></article>";
        }).join("");
      })
      .catch(function () { box.innerHTML = ""; });
  }

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
