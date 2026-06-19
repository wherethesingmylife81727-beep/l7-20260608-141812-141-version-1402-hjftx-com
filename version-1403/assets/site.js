document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
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

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide') || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('.page-filter-input');
  var filterSelect = document.querySelector('.page-filter-select');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.category-movie-grid .movie-card'));

  function applyPageFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterSelect ? filterSelect.value : '';
    var shown = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesYear = !year || card.getAttribute('data-year') === year;
      var visible = matchesKeyword && matchesYear;
      card.classList.toggle('is-hidden', !visible);
      if (visible) {
        shown += 1;
      }
    });

    var grid = document.querySelector('.category-movie-grid');
    var existing = document.querySelector('.no-results');

    if (grid && shown === 0 && !existing) {
      var message = document.createElement('div');
      message.className = 'no-results';
      message.textContent = '没有找到相关影片';
      grid.appendChild(message);
    }

    if (existing && shown > 0) {
      existing.remove();
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyPageFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyPageFilter);
  }
});
