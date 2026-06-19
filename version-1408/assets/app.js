(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function() {
    var menuButton = document.querySelector('.mobile-menu-button');
    var menu = document.querySelector('.mobile-menu');
    if (menuButton && menu) {
      menuButton.addEventListener('click', function() {
        menu.classList.toggle('hidden');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length) {
      var current = 0;
      var show = function(index) {
        current = index;
        slides.forEach(function(slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      };
      dots.forEach(function(dot, i) {
        dot.addEventListener('click', function() {
          show(i);
        });
      });
      setInterval(function() {
        show((current + 1) % slides.length);
      }, 5000);
    }

    var searchBox = document.querySelector('.site-search');
    if (searchBox) {
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      searchBox.addEventListener('input', function() {
        var key = searchBox.value.trim().toLowerCase();
        cards.forEach(function(card) {
          var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '') + ' ' + card.textContent).toLowerCase();
          card.classList.toggle('is-hidden', key && text.indexOf(key) === -1);
        });
      });
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function(box) {
      var video = box.querySelector('.film-video');
      var layer = box.querySelector('.play-layer');
      if (!video || !layer) {
        return;
      }
      var attached = false;
      var hlsInstance = null;
      var begin = function() {
        if (!attached) {
          var stream = video.getAttribute('data-stream');
          if (stream) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
              hlsInstance = new window.Hls();
              hlsInstance.loadSource(stream);
              hlsInstance.attachMedia(video);
              hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
                video.play().catch(function() {});
              });
            } else {
              video.src = stream;
            }
          }
          attached = true;
        }
        layer.classList.add('is-hidden');
        video.play().catch(function() {});
      };
      layer.addEventListener('click', begin);
      video.addEventListener('click', function() {
        if (video.paused) {
          begin();
        }
      });
      video.addEventListener('ended', function() {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
          hlsInstance = null;
          attached = false;
        }
      });
    });
  });
})();
