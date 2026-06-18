(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobile = document.querySelector('.mobile-nav');
    if (toggle && mobile) {
      toggle.addEventListener('click', function () {
        var opened = mobile.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-to]'));
      if (!slides.length) {
        return;
      }
      var active = 0;
      function show(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === active);
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-slide-to')) || 0);
        });
      });
      window.setInterval(function () {
        show(active + 1);
      }, 5500);
    });

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));
    searchInputs.forEach(function (input) {
      var section = input.closest('.section-block') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
      var empty = section.querySelector('.empty-state');
      var filterButtons = Array.prototype.slice.call(section.querySelectorAll('[data-filter]'));
      var currentFilter = '全部';

      function apply() {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var tags = card.getAttribute('data-tags') || '';
          var genre = card.getAttribute('data-genre') || '';
          var typeMatch = currentFilter === '全部' || tags.indexOf(currentFilter) >= 0 || genre.indexOf(currentFilter) >= 0 || haystack.indexOf(currentFilter.toLowerCase()) >= 0;
          var keywordMatch = !keyword || haystack.indexOf(keyword) >= 0;
          var match = typeMatch && keywordMatch;
          card.style.display = match ? '' : 'none';
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      input.addEventListener('input', apply);
      filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          currentFilter = button.getAttribute('data-filter') || '全部';
          filterButtons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });
      if (filterButtons[0]) {
        filterButtons[0].classList.add('is-active');
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
      apply();
    });

    document.querySelectorAll('.player-shell').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-action="play"]');
      var url = player.getAttribute('data-video');
      var initialized = false;

      function attach() {
        if (!video || !url || initialized) {
          return;
        }
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          player._hls = hls;
        } else {
          video.src = url;
        }
      }

      function play() {
        attach();
        player.classList.add('is-playing');
        if (video) {
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          play();
        });
      }
      player.addEventListener('click', function (event) {
        if (!initialized && event.target !== video) {
          play();
        }
      });
    });
  });
})();
