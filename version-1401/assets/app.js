(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var navPanel = document.querySelector("[data-nav-panel]");

    if (menuButton && navPanel) {
      menuButton.addEventListener("click", function () {
        navPanel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
          slide.classList.toggle("is-active", itemIndex === current);
        });
        dots.forEach(function (dot, itemIndex) {
          dot.classList.toggle("is-active", itemIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5600);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-filterable-grid]"));
    var localInputs = Array.prototype.slice.call(document.querySelectorAll("[data-local-search]"));
    var emptyStates = Array.prototype.slice.call(document.querySelectorAll("[data-empty-state]"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    function filterCards(value) {
      var needle = normalize(value);
      grids.forEach(function (grid, gridIndex) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-title"));
          var matched = !needle || haystack.indexOf(needle) !== -1;
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (emptyStates[gridIndex]) {
          emptyStates[gridIndex].classList.toggle("is-visible", visible === 0);
        }
      });
    }

    localInputs.forEach(function (input) {
      if (query) {
        input.value = query;
      }
      input.addEventListener("input", function () {
        filterCards(input.value);
      });
    });

    if (query && grids.length) {
      filterCards(query);
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-quick-filter]")).forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-quick-filter") || "";
        localInputs.forEach(function (input) {
          input.value = value;
        });
        filterCards(value);
      });
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-sort-select]")).forEach(function (select) {
      select.addEventListener("change", function () {
        grids.forEach(function (grid) {
          var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
          var original = new Map();
          cards.forEach(function (card, index) {
            original.set(card, index);
          });
          cards.sort(function (a, b) {
            var mode = select.value;
            if (mode === "year-desc") {
              return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
            }
            if (mode === "year-asc") {
              return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
            }
            if (mode === "title-asc") {
              return normalize(a.getAttribute("data-title")).localeCompare(normalize(b.getAttribute("data-title")), "zh-Hans-CN");
            }
            return original.get(a) - original.get(b);
          });
          cards.forEach(function (card) {
            grid.appendChild(card);
          });
        });
      });
    });
  });

  window.MovieSitePlayer = function (url) {
    ready(function () {
      var video = document.querySelector("[data-player-video]");
      var cover = document.querySelector("[data-player-cover]");
      var button = document.querySelector("[data-player-button]");
      var started = false;
      var hls = null;

      if (!video || !url) {
        return;
      }

      function bind() {
        if (started) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        bind();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }
      if (button) {
        button.addEventListener("click", play);
      }
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  };
}());
