(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    start();
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    inputs.forEach(function (input) {
      var targetSelector = input.getAttribute("data-search-target") || "body";
      var target = document.querySelector(targetSelector);
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll("[data-movie-card]"));
      var empty = target.querySelector("[data-no-results]");

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-meta") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          var matched = keyword === "" || text.indexOf(keyword) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      });
    });
  }

  window.initPlayer = function (sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var shell = document.getElementById("moviePlayerBox");
    var overlay = document.querySelector("[data-player-overlay]");
    if (!video || !sourceUrl) {
      return;
    }

    var hls = null;
    var bound = false;
    var requested = false;

    function bindSource() {
      if (bound) {
        return;
      }
      bound = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requested) {
            video.play().catch(function () {});
          }
        });
      } else {
        video.src = sourceUrl;
        video.load();
      }
    }

    function start() {
      requested = true;
      bindSource();
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });

    video.addEventListener("pause", function () {
      if (shell) {
        shell.classList.remove("is-playing");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
