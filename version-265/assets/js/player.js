(function () {
  function init(videoId, overlayId, errorId, url) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var error = document.getElementById(errorId);
    var hlsInstance = null;
    var started = false;

    function showError() {
      if (error) {
        error.classList.add("is-visible");
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          showError();
        });
      }
    }

    function start() {
      if (!video || !url) {
        showError();
        return;
      }
      hideOverlay();
      if (started) {
        playVideo();
        return;
      }
      started = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        playVideo();
      } else {
        showError();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  }

  window.MoviePlayer = { init: init };
})();
