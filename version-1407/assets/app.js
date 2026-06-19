(function () {
  var menuButton = document.querySelector('.menu-toggle');
  if (menuButton) {
    menuButton.addEventListener('click', function () {
      var open = !document.body.classList.contains('menu-open');
      document.body.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll('.js-search-input'));
  inputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-tags') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden-by-search', q && haystack.indexOf(q) === -1);
      });
    });
  });

  var video = document.getElementById('moviePlayer');
  var start = document.getElementById('playerStart');
  if (video) {
    var initialized = false;
    var initPlayer = function () {
      if (initialized) {
        return;
      }
      initialized = true;
      var source = video.getAttribute('data-stream');
      if (!source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };
    var playNow = function () {
      initPlayer();
      var promise = video.play();
      if (promise && promise.then) {
        promise.then(function () {
          if (start) {
            start.classList.add('hidden');
          }
        }).catch(function () {});
      } else if (start) {
        start.classList.add('hidden');
      }
    };
    if (start) {
      start.addEventListener('click', playNow);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        playNow();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      if (start) {
        start.classList.add('hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (start && video.currentTime === 0) {
        start.classList.remove('hidden');
      }
    });
  }
})();
