(function () {
  function normalize(text) {
    return (text || "").toString().toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    setInterval(function () {
      show(index + 1);
    }, 5200);
    show(0);
  }

  function setupFilters() {
    var search = document.querySelector("[data-card-search]");
    var type = document.querySelector("[data-type-filter]");
    var year = document.querySelector("[data-year-filter]");
    var category = document.querySelector("[data-category-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-no-results]");
    if (!cards.length) {
      return;
    }

    function apply() {
      var q = normalize(search && search.value);
      var selectedType = normalize(type && type.value);
      var selectedYear = normalize(year && year.value);
      var selectedCategory = normalize(category && category.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category,
          card.dataset.tags,
          card.textContent
        ].join(" "));
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (selectedType && normalize(card.dataset.type) !== selectedType) {
          ok = false;
        }
        if (selectedYear && normalize(card.dataset.year) !== selectedYear) {
          ok = false;
        }
        if (selectedCategory && normalize(card.dataset.category) !== selectedCategory) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [search, type, year, category].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && search) {
      search.value = query;
    }
    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
