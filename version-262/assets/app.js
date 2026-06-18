(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 320) {
        backTop.classList.add('is-visible');
      } else {
        backTop.classList.remove('is-visible');
      }
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function setHero(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setHero(current + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-page-search]');

  if (searchInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var status = document.querySelector('[data-search-status]');

    searchInput.addEventListener('input', function () {
      var keyword = searchInput.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search-text') || '').toLowerCase();
        var match = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('is-filtered-out', !match);

        if (match) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = keyword ? '已筛选出 ' + visible + ' 部影片。' : '输入关键词即可筛选当前页面影片。';
      }
    });
  }

  var player = document.querySelector('[data-player]');
  var trigger = document.querySelector('[data-player-trigger]');
  var message = document.querySelector('[data-player-message]');

  function setPlayerMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');

      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        if (window.Hls) {
          resolve();
        }
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function startPlayer() {
    if (!player) {
      return;
    }

    var source = player.getAttribute('data-video');

    if (!source) {
      setPlayerMessage('当前影片未配置播放源。');
      return;
    }

    if (trigger) {
      trigger.classList.add('is-hidden');
    }

    function playVideo() {
      player.play().catch(function () {
        setPlayerMessage('浏览器阻止了自动播放，请再次点击视频播放按钮。');
      });
    }

    if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = source;
      player.addEventListener('loadedmetadata', playVideo, { once: true });
      setPlayerMessage('正在使用浏览器原生 HLS 播放能力。');
      return;
    }

    function attachHls() {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(player);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setPlayerMessage('播放源加载完成，正在播放。');
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setPlayerMessage('播放源加载失败，请刷新页面或稍后重试。');
          }
        });
      } else {
        setPlayerMessage('当前浏览器不支持 HLS 播放。');
      }
    }

    if (window.Hls) {
      attachHls();
      return;
    }

    setPlayerMessage('正在加载 HLS 播放组件。');
    loadScript('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js')
      .then(attachHls)
      .catch(function () {
        player.src = source;
        setPlayerMessage('播放组件加载失败，已尝试使用原始 m3u8 地址播放。');
        playVideo();
      });
  }

  if (trigger) {
    trigger.addEventListener('click', startPlayer);
  }
})();
