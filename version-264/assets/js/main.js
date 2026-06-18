(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[type="search"]');
      if (input && !input.value.trim()) {
        event.preventDefault();
        input.focus();
      }
    });
  });

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    var show = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    var start = function () {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    var stop = function () {
      if (timer) {
        window.clearInterval(timer);
      }
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  }

  var panel = document.querySelector('[data-filter-panel]');
  var list = document.querySelector('[data-filter-list]');
  if (panel && list) {
    var keyword = panel.querySelector('[data-filter-keyword]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    var apply = function () {
      var key = keyword ? keyword.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var okKeyword = !key || text.indexOf(key) !== -1;
        var okType = !typeValue || card.getAttribute('data-type') === typeValue;
        var okYear = !yearValue || card.getAttribute('data-year') === yearValue;
        card.style.display = okKeyword && okType && okYear ? '' : 'none';
      });
    };

    [keyword, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }
})();
