(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');
    if (!slides.length) {
      return;
    }
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(index + 1);
      });
    }
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(index - 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function filterCards(container, query) {
    var normalized = String(query || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
    cards.forEach(function (card) {
      var text = [card.getAttribute('data-title'), card.getAttribute('data-meta'), card.textContent].join(' ').toLowerCase();
      card.classList.toggle('hidden', normalized && text.indexOf(normalized) === -1);
    });
  }

  function initFilters() {
    var containers = Array.prototype.slice.call(document.querySelectorAll('[data-card-container]'));
    if (!containers.length) {
      return;
    }
    containers.forEach(function (container) {
      var scope = container.closest('section') || document;
      var input = scope.querySelector('[data-local-filter], [data-global-search]');
      if (input) {
        input.addEventListener('input', function () {
          filterCards(container, input.value);
        });
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input.hasAttribute('data-global-search')) {
          input.value = q;
          filterCards(container, q);
        }
      }
      var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-word]'));
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var word = button.getAttribute('data-filter-word') || '';
          if (input) {
            input.value = word;
          }
          filterCards(container, word);
        });
      });
    });
  }

  function prepareVideo(video) {
    if (!video || video.getAttribute('data-ready') === '1') {
      return;
    }
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    video.setAttribute('data-ready', '1');
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else {
      video.src = stream;
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.video-player[data-stream]'));
    players.forEach(function (video) {
      prepareVideo(video);
      var shell = video.closest('[data-player]');
      var button = shell ? shell.querySelector('[data-play-button]') : null;

      function playVideo() {
        prepareVideo(video);
        video.play().catch(function () {});
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          playVideo();
        });
      }
      if (shell) {
        shell.addEventListener('click', function (event) {
          if (event.target.closest('button') || event.target === video) {
            return;
          }
          playVideo();
        });
        video.addEventListener('play', function () {
          shell.classList.add('playing');
        });
        video.addEventListener('pause', function () {
          shell.classList.remove('playing');
        });
        video.addEventListener('ended', function () {
          shell.classList.remove('playing');
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
