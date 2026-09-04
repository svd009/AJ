document.addEventListener("DOMContentLoaded", function () {
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      header.classList.toggle("nav-open");
    });
    document.querySelectorAll(".main-nav a").forEach(function (link) {
      link.addEventListener("click", function () { header.classList.remove("nav-open"); });
    });
  }

  // Hero carousel — simple, automatic crossfade.
  var slides = document.querySelectorAll(".hero-slide");
  var dots = document.querySelectorAll(".hero-dots button");
  if (slides.length > 1) {
    var current = 0;
    function showSlide(i) {
      slides.forEach(function (s, idx) { s.classList.toggle("is-active", idx === i); });
      dots.forEach(function (d, idx) { d.classList.toggle("is-active", idx === i); });
      current = i;
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () { showSlide(idx); restartTimer(); });
    });
    var timer;
    function restartTimer() {
      clearInterval(timer);
      timer = setInterval(function () { showSlide((current + 1) % slides.length); }, 5000);
    }
    restartTimer();
  }

  // Count-up stats.
  var stats = document.querySelectorAll(".stat-number[data-target]");
  if (stats.length) {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-target"), 10);
        var suffix = el.getAttribute("data-suffix") || "";
        var start = null;
        var duration = 1400;
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        statObserver.unobserve(el);
      });
    }, { threshold: 0.4 });
    stats.forEach(function (el) { statObserver.observe(el); });
  }

  // Reveal-on-scroll.
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  // Collections filter.
  var filterButtons = document.querySelectorAll(".filter-btn");
  var pieces = document.querySelectorAll(".gallery-grid .piece-card");
  var galleryGrid = document.querySelector(".gallery-grid");
  var typeBanner = document.querySelector(".type-banner");
  var typeBannerText = document.querySelector(".type-banner-text");
  var typeBannerClear = document.querySelector(".type-banner-clear");

  var typeLabels = {
    necklace: "Necklaces", ring: "Rings", earring: "Earrings",
    bangle: "Bangles", mangalsutra: "Mangalsutra", bracelet: "Bracelets",
    anklet: "Anklets", gemstone: "Gemstones"
  };

  function showMaterial(category) {
    pieces.forEach(function (card) {
      var match = category === "all" || card.getAttribute("data-category") === category;
      card.classList.toggle("is-hidden", !match);
    });
    if (galleryGrid) galleryGrid.classList.remove("type-mode");
    if (typeBanner) typeBanner.classList.remove("is-active");
  }

  // Drill into one specific product type — e.g. clicking a mangalsutra
  // photo, or landing here via collections.html?type=mangalsutra, shows
  // every mangalsutra design with full details, and nothing else.
  function showType(type) {
    pieces.forEach(function (card) {
      card.classList.toggle("is-hidden", card.getAttribute("data-type") !== type);
    });
    filterButtons.forEach(function (b) { b.classList.remove("active"); });
    if (galleryGrid) galleryGrid.classList.add("type-mode");
    if (typeBanner) {
      typeBanner.classList.add("is-active");
      if (typeBannerText) {
        typeBannerText.textContent = "Showing: " + (typeLabels[type] || type);
      }
    }
  }

  if (filterButtons.length && pieces.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        showMaterial(btn.getAttribute("data-filter"));
      });
    });

    pieces.forEach(function (card) {
      card.addEventListener("click", function () {
        showType(card.getAttribute("data-type"));
        var galleryTop = document.querySelector(".filter-bar");
        if (galleryTop) galleryTop.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    if (typeBannerClear) {
      typeBannerClear.addEventListener("click", function () {
        var allBtn = document.querySelector('.filter-btn[data-filter="all"]');
        if (allBtn) allBtn.click();
      });
    }

    // Deep link from the homepage "shop by category" circles, e.g.
    // collections.html?type=ring shows only rings, regardless of material.
    var params = new URLSearchParams(window.location.search);
    var typeParam = params.get("type");
    if (typeParam) {
      showType(typeParam);
      var galleryTop2 = document.querySelector(".filter-bar");
      if (galleryTop2) {
        window.requestAnimationFrame(function () {
          galleryTop2.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  }
});
