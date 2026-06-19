document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('search-page-input');
  var results = document.getElementById('search-results');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (input) {
    input.value = query;
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '<a href="' + escapeHtml(movie.url) + '" class="card-link">',
      '<div class="poster-wrap">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-chip">' + escapeHtml(movie.region) + '</span>',
      '</div>',
      '<div class="card-body">',
      '<h2>' + escapeHtml(movie.title) + '</h2>',
      '<p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '<div class="movie-meta">',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '<span>' + escapeHtml(movie.type) + '</span>',
      '<span>' + escapeHtml(movie.genre) + '</span>',
      '</div>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function render() {
    if (!results || typeof SEARCH_MOVIES === 'undefined') {
      return;
    }

    var keyword = input ? input.value.trim().toLowerCase() : '';
    var items = SEARCH_MOVIES.filter(function (movie) {
      if (!keyword) {
        return true;
      }

      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();

      return haystack.indexOf(keyword) !== -1;
    }).slice(0, 96);

    if (!items.length) {
      results.innerHTML = '<div class="no-results">没有找到相关影片</div>';
      return;
    }

    results.innerHTML = items.map(card).join('');
  }

  if (input) {
    input.addEventListener('input', render);
  }

  render();
});
