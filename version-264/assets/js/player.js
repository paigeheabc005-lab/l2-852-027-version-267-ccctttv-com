(function () {
  var video = document.getElementById('movie-video');
  var overlay = document.getElementById('player-overlay');
  var message = document.getElementById('player-message');
  var meta = document.querySelector('meta[name="movie-play"]');
  var playUrl = meta ? meta.getAttribute('content') : '';
  var hlsInstance = null;
  var ready = false;

  var showMessage = function (text) {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.classList.add('is-visible');
  };

  var hideOverlay = function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  };

  var load = function () {
    if (!video || !playUrl || ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playUrl;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(playUrl);
      hlsInstance.attachMedia(video);
      ready = true;
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage('播放未就绪，请稍后再试');
        }
      });
      return;
    }

    showMessage('播放未就绪，请稍后再试');
  };

  var play = function () {
    load();
    hideOverlay();
    if (video) {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          showMessage('点击视频区域继续播放');
        });
      }
    }
  };

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', hideOverlay);
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
