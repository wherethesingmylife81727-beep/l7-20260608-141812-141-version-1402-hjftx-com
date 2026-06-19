document.addEventListener('DOMContentLoaded', function () {
  var video = document.querySelector('.movie-player');
  var start = document.querySelector('.player-start');
  var status = document.querySelector('.player-status');

  if (!video) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var playerReady = false;
  var hlsInstance = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message || '';
    }
  }

  function hideStart() {
    if (start) {
      start.classList.add('is-hidden');
    }
  }

  function loadAndPlay(autoplay) {
    if (!stream) {
      setStatus('播放线路暂时不可用');
      return;
    }

    if (!playerReady) {
      playerReady = true;
      setStatus('正在载入...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
          if (autoplay) {
            video.play().catch(function () {});
          }
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放线路暂时不可用');
          }
        });
      } else {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          setStatus('');
        }, { once: true });
        if (autoplay) {
          video.play().catch(function () {});
        }
      }
    } else if (autoplay) {
      video.play().catch(function () {});
    }
  }

  if (start) {
    start.addEventListener('click', function () {
      loadAndPlay(true);
      hideStart();
    });
  }

  video.addEventListener('play', hideStart);
  video.addEventListener('click', function () {
    if (!playerReady) {
      loadAndPlay(true);
      hideStart();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
});
