(function () {
  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector(".movie-video");
    var cover = document.querySelector(".player-cover");
    var status = document.querySelector(".player-status");
    var hlsInstance = null;
    var attached = false;

    if (!video) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("播放失败，请稍后再试。");
          }
        });
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attachStream();
      video.controls = true;
      if (cover) {
        cover.classList.add("hidden");
      }
      setStatus("");
      video.play().catch(function () {
        setStatus("点击视频区域继续播放。");
      });
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("hidden");
      }
    });
    video.addEventListener("error", function () {
      setStatus("播放失败，请稍后再试。");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
