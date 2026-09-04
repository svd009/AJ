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

  // Subtle parallax on the hero background while scrolling past it.
  var heroSection = document.querySelector(".hero");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (heroSection && slides.length && !reduceMotion) {
    var onHeroScroll = function () {
      var rect = heroSection.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      var offset = window.scrollY * 0.25;
      slides.forEach(function (el) {
        el.style.transform = "translateY(" + offset + "px) scale(1.12)";
      });
    };
    window.addEventListener("scroll", onHeroScroll, { passive: true });
    onHeroScroll();
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
    var filterBar = document.querySelector(".filter-bar");
    if (filterBar) filterBar.classList.remove("is-dimmed");
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
    var filterBar = document.querySelector(".filter-bar");
    if (filterBar) filterBar.classList.add("is-dimmed");
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

  // Floating WhatsApp button, present on every page.
  var waLink = document.createElement("a");
  waLink.href = "https://wa.me/919822880996?text=" + encodeURIComponent("Hi, I'm interested in your jewellery collection.");
  waLink.className = "whatsapp-float";
  waLink.target = "_blank";
  waLink.rel = "noopener";
  waLink.setAttribute("aria-label", "Chat with us on WhatsApp");
  waLink.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.41-1.42a9.87 9.87 0 004.63 1.18h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.1c-.24.68-1.4 1.31-1.93 1.36-.5.05-1.03.28-3.46-.72-2.93-1.2-4.78-4.15-4.93-4.34-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.81 2 .88 2.15.07.15.12.32.02.51-.09.2-.14.32-.28.49-.14.17-.29.38-.42.51-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.37-.23.63-.14.26.09 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.68-.17 1.36z"/></svg>';
  document.body.appendChild(waLink);

  // Gently prevent picking a Monday for showroom visits (closed that day).
  var visitDate = document.querySelector("#visit-date");
  if (visitDate) {
    visitDate.addEventListener("change", function () {
      if (!visitDate.value) return;
      var picked = new Date(visitDate.value + "T00:00:00");
      if (picked.getDay() === 1) {
        alert("We're closed on Mondays \u2014 please pick another day.");
        visitDate.value = "";
      }
    });
  }

  // Product detail modal — opened via the small info button on each card,
  // without interfering with the card's own click-to-filter behavior.
  var productModal = document.querySelector(".product-modal");
  if (productModal) {
    var modalImg = productModal.querySelector(".product-modal-media img");
    var modalTitle = productModal.querySelector("h3");
    var modalSpec = productModal.querySelector(".product-modal-spec");
    var modalWhatsapp = productModal.querySelector(".product-modal-whatsapp");
    var modalClose = productModal.querySelector(".product-modal-close");

    document.querySelectorAll(".card-detail-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var card = btn.closest(".piece-card");
        if (!card) return;
        var img = card.querySelector("img");
        var nameEl = card.querySelector("figcaption");
        var specEl = card.querySelector("figcaption small");
        var name = "";
        if (nameEl) {
          name = nameEl.childNodes[0] ? nameEl.childNodes[0].textContent.trim() : nameEl.textContent.trim();
        }
        var spec = specEl ? specEl.textContent.trim() : "";

        if (img) { modalImg.src = img.src; modalImg.alt = img.alt; }
        modalTitle.textContent = name;
        modalSpec.textContent = spec;
        modalWhatsapp.href = "https://wa.me/919822880996?text=" +
          encodeURIComponent("Hi, I'm interested in the " + name + ".");
        productModal.classList.add("is-open");
      });
    });

    function closeProductModal() { productModal.classList.remove("is-open"); }
    modalClose.addEventListener("click", closeProductModal);
    productModal.addEventListener("click", function (e) {
      if (e.target === productModal) closeProductModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeProductModal();
    });
  }
});
