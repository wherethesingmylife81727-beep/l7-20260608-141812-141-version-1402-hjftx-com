(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function uniqueValues(items, attr) {
    var values = [];
    items.forEach(function (item) {
      var value = item.getAttribute(attr) || '';
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      var numA = Number(a);
      var numB = Number(b);
      if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
        return numB - numA;
      }
      return a.localeCompare(b, 'zh-CN');
    });
  }

  function addOptions(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var list = document.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    var items = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-filter-year]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var empty = document.querySelector('[data-empty-state]');

    addOptions(year, uniqueValues(items, 'data-year'));
    addOptions(region, uniqueValues(items, 'data-region'));
    addOptions(type, uniqueValues(items, 'data-type'));

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (input && q) {
      input.value = q;
    }

    function apply() {
      var keyword = normalizeText(input ? input.value : '');
      var selectedYear = year ? year.value : '';
      var selectedRegion = region ? region.value : '';
      var selectedType = type ? type.value : '';
      var visible = 0;
      items.forEach(function (item) {
        var text = normalizeText(item.getAttribute('data-search'));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesYear = !selectedYear || item.getAttribute('data-year') === selectedYear;
        var matchesRegion = !selectedRegion || item.getAttribute('data-region') === selectedRegion;
        var matchesType = !selectedType || item.getAttribute('data-type') === selectedType;
        var ok = matchesKeyword && matchesYear && matchesRegion && matchesType;
        item.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, region, type].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
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
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('[data-movie-player]');
      var overlay = shell.querySelector('[data-player-overlay]');
      var stream = shell.getAttribute('data-stream');
      var controls = shell.parentElement || document;
      var playButton = controls.querySelector('[data-player-play]');
      var muteButton = controls.querySelector('[data-player-mute]');
      var fullscreenButton = controls.querySelector('[data-player-fullscreen]');
      var hlsInstance = null;
      var initialized = false;

      if (!video || !stream) {
        return;
      }

      function init() {
        if (initialized) {
          return;
        }
        initialized = true;
        video.controls = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        init();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      function toggle() {
        init();
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      if (playButton) {
        playButton.addEventListener('click', toggle);
      }
      if (muteButton) {
        muteButton.addEventListener('click', function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? '取消静音' : '静音';
        });
      }
      if (fullscreenButton) {
        fullscreenButton.addEventListener('click', function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (shell.requestFullscreen) {
            shell.requestFullscreen();
          }
        });
      }
      video.addEventListener('click', toggle);
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        if (playButton) {
          playButton.textContent = '暂停';
        }
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          shell.classList.remove('is-playing');
        }
        if (playButton) {
          playButton.textContent = '播放';
        }
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
        if (playButton) {
          playButton.textContent = '播放';
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
      init();
    });
  }

  ready(function () {
    setupMobileMenu();
    setupFilters();
    setupHero();
    setupPlayers();
  });
})();
