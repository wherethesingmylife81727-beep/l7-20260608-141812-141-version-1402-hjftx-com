(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const carousels = document.querySelectorAll('[data-carousel]');

  carousels.forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-dot]'));
    const prev = carousel.querySelector('[data-prev]');
    const next = carousel.querySelector('[data-next]');
    let current = 0;
    let timer;

    function show(index) {
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

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    show(0);
    start();
  });

  const players = document.querySelectorAll('[data-player]');

  players.forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    let hlsInstance = null;

    function prepare() {
      if (!video || video.getAttribute('data-ready') === '1') {
        return;
      }

      const stream = video.getAttribute('data-stream');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', '1');
    }

    function play() {
      prepare();
      if (!video) {
        return;
      }
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
      player.classList.add('is-playing');
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
  });

  const searchMount = document.querySelector('[data-search-page]');

  if (searchMount && Array.isArray(window.SEARCH_ITEMS)) {
    const form = searchMount.querySelector('[data-search-form]');
    const input = searchMount.querySelector('[data-search-input]');
    const type = searchMount.querySelector('[data-search-type]');
    const region = searchMount.querySelector('[data-search-region]');
    const year = searchMount.querySelector('[data-search-year]');
    const result = searchMount.querySelector('[data-search-results]');
    const count = searchMount.querySelector('[data-search-count]');
    const params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function card(item) {
      const tags = item.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '' +
        '<article class="movie-card">' +
        '<a class="poster-wrap" href="video/' + item.id + '.html">' +
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + ' 封面" loading="lazy">' +
        '<span class="poster-badge">' + escapeHtml(item.duration) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<a class="movie-title" href="video/' + item.id + '.html">' + escapeHtml(item.title) + '</a>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '<div class="meta-row"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function matches(item, query) {
      if (!query) {
        return true;
      }

      const haystack = [
        item.title,
        item.region,
        item.type,
        item.genre,
        item.oneLine,
        item.tags.join(' ')
      ].join(' ').toLowerCase();

      return haystack.indexOf(query.toLowerCase()) !== -1;
    }

    function update() {
      const query = input.value.trim();
      const selectedType = type.value;
      const selectedRegion = region.value;
      const selectedYear = year.value;
      const items = window.SEARCH_ITEMS.filter(function (item) {
        if (!matches(item, query)) {
          return false;
        }

        if (selectedType && item.type !== selectedType) {
          return false;
        }

        if (selectedRegion && item.region !== selectedRegion) {
          return false;
        }

        if (selectedYear && String(item.year) !== selectedYear) {
          return false;
        }

        return true;
      }).slice(0, 160);

      count.textContent = String(items.length);

      if (!items.length) {
        result.className = '';
        result.innerHTML = '<div class="search-result-empty">没有找到匹配的内容，可以尝试更换关键词或浏览分类页。</div>';
        return;
      }

      result.className = 'movie-grid';
      result.innerHTML = items.map(card).join('');
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const params = new URLSearchParams();
        if (input.value.trim()) {
          params.set('q', input.value.trim());
        }
        const queryString = params.toString();
        const nextUrl = queryString ? 'search.html?' + queryString : 'search.html';
        window.history.replaceState(null, '', nextUrl);
        update();
      });
    }

    [input, type, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', update);
        control.addEventListener('change', update);
      }
    });

    update();
  }
})();
