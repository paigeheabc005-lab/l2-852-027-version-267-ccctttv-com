(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    if (slides.length) {
      showSlide(0);
      var prev = document.querySelector("[data-hero-prev]");
      var next = document.querySelector("[data-hero-next]");
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          showSlide(i);
        });
      });
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    var searchInput = document.querySelector("[data-search-input]");
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-field]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".js-card"));
    var empty = document.querySelector("[data-empty]");

    function getQueryValue() {
      try {
        return new URLSearchParams(window.location.search).get("q") || "";
      } catch (e) {
        return "";
      }
    }

    if (searchInput) {
      var initial = getQueryValue();
      if (initial) {
        searchInput.value = initial;
      }
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }
      var text = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var matched = true;
        if (text) {
          matched = (card.getAttribute("data-search") || "").toLowerCase().indexOf(text) !== -1;
        }
        selects.forEach(function (select) {
          if (!matched) {
            return;
          }
          var value = select.value;
          if (!value) {
            return;
          }
          var field = select.getAttribute("data-filter-field");
          matched = (card.getAttribute("data-" + field) || "") === value;
        });
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });
    applyFilters();
  });
})();
