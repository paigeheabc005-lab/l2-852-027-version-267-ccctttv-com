(function () {
  "use strict";

  function getAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = getAll("[data-hero-slide]", hero);
    var dots = getAll("[data-hero-dot]", hero);
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentIndex);
      });
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(currentIndex - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(currentIndex + 1);
        restartTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        restartTimer();
      });
    });

    showSlide(0);
    restartTimer();
  }

  function initMissingImageFallback() {
    getAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("missing-cover");
      }, { once: true });
    });
  }

  function getQueryParameter(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-filter-grid]");

    if (!panel || !grid) {
      return;
    }

    var searchInput = panel.querySelector("[data-filter-search]");
    var chips = getAll("[data-filter-chip]", panel);
    var status = panel.querySelector("[data-filter-status]");
    var emptyState = document.querySelector("[data-empty-state]");
    var cards = getAll("[data-movie-card]", grid);
    var activeChip = "all";
    var initialQuery = getQueryParameter("q");

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function cardMatches(card, query, chip) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesChip = chip === "all" || haystack.indexOf(normalize(chip)) !== -1;

      return matchesQuery && matchesChip;
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : "");
      var visibleCount = 0;

      cards.forEach(function (card) {
        var isVisible = cardMatches(card, query, activeChip);
        card.hidden = !isVisible;

        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (status) {
        status.textContent = "当前显示 " + visibleCount + " 部影片";
      }

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeChip = chip.dataset.filterChip || "all";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        applyFilters();
      });
    });

    applyFilters();
  }

  function loadScript(src) {
    return new Promise(function (resolve) {
      var existing = document.querySelector("script[src='" + src + "']");

      if (existing) {
        existing.addEventListener("load", function () {
          resolve(true);
        });
        existing.addEventListener("error", function () {
          resolve(false);
        });
        return;
      }

      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = function () {
        resolve(true);
      };
      script.onerror = function () {
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  function initPlayer() {
    var player = document.querySelector("[data-player]");

    if (!player) {
      return;
    }

    var video = player.querySelector("video");
    var startButton = player.querySelector("[data-player-start]");
    var playButton = player.querySelector("[data-player-play]");
    var muteButton = player.querySelector("[data-player-mute]");
    var fullscreenButton = player.querySelector("[data-player-fullscreen]");
    var loading = player.querySelector("[data-player-loading]");
    var errorBox = player.querySelector("[data-player-error]");
    var source = player.dataset.videoUrl;
    var hlsInstance = null;
    var prepared = false;
    var preparing = false;

    if (!video || !source) {
      return;
    }

    function setError(message) {
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = message;
      }
      if (loading) {
        loading.hidden = true;
      }
    }

    function setReady() {
      prepared = true;
      preparing = false;
      if (loading) {
        loading.hidden = true;
      }
    }

    function prepareStream() {
      if (prepared || preparing) {
        return Promise.resolve(prepared);
      }

      preparing = true;
      if (loading) {
        loading.hidden = false;
        loading.textContent = "正在准备高清播放源…";
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", setReady, { once: true });
        return Promise.resolve(true);
      }

      var useHls = function () {
        if (!window.Hls || !window.Hls.isSupported()) {
          setError("当前浏览器暂不支持 HLS 播放，请更换浏览器或稍后重试。");
          return false;
        }

        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, setReady);
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
            setError("网络加载暂时异常，播放器正在重试。");
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
            setError("媒体解码异常，播放器正在恢复。");
          } else {
            setError("无法加载视频播放源。");
          }
        });
        return true;
      };

      if (window.Hls) {
        return Promise.resolve(useHls());
      }

      return loadScript("https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js").then(function (loaded) {
        if (!loaded) {
          setError("HLS 播放组件加载失败，请检查网络后重试。");
          return false;
        }
        return useHls();
      });
    }

    function togglePlay() {
      prepareStream().then(function () {
        var playPromise;

        if (video.paused) {
          playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
              setError("播放被浏览器阻止，请再次点击播放按钮。");
            });
          }
        } else {
          video.pause();
        }
      });
    }

    if (startButton) {
      startButton.addEventListener("click", togglePlay);
    }

    if (playButton) {
      playButton.addEventListener("click", togglePlay);
    }

    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "取消静音" : "静音";
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (player.requestFullscreen) {
          player.requestFullscreen();
        }
      });
    }

    video.addEventListener("play", function () {
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (startButton) {
        startButton.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });

    prepareStream();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initMissingImageFallback();
    initFilters();
    initPlayer();
  });
})();
