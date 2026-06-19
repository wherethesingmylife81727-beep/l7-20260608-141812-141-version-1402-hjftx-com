
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    ready(function () {
        var menuToggle = document.querySelector('[data-menu-toggle]');
        var mobileMenu = document.querySelector('[data-mobile-menu]');

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', function () {
                mobileMenu.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                var shell = image.closest('.poster-shell, .hero-poster-card');
                if (shell) {
                    shell.classList.add('is-missing');
                    if (!shell.getAttribute('data-title')) {
                        shell.setAttribute('data-title', image.getAttribute('alt') || '影视封面');
                    }
                }
                image.style.opacity = '0';
            }, { once: true });
        });

        setupHeroCarousel();
        setupCatalogFilter();
        setupSearchPage();
    });

    function setupHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
                dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupCatalogFilter() {
        var catalog = document.querySelector('[data-catalog]');
        if (!catalog) {
            return;
        }

        var keywordInput = document.querySelector('[data-catalog-keyword]');
        var regionSelect = document.querySelector('[data-catalog-region]');
        var typeSelect = document.querySelector('[data-catalog-type]');
        var countNode = document.querySelector('[data-catalog-count]');
        var cards = Array.prototype.slice.call(catalog.querySelectorAll('[data-search]'));

        function applyFilter() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var region = regionSelect ? regionSelect.value : '全部';
            var type = typeSelect ? typeSelect.value : '全部';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardRegion = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matched = (!keyword || haystack.indexOf(keyword) !== -1) &&
                    (region === '全部' || cardRegion === region) &&
                    (type === '全部' || cardType === type);

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = String(visible);
            }
        }

        [keywordInput, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    function setupSearchPage() {
        var page = document.querySelector('[data-search-page]');
        if (!page) {
            return;
        }

        var base = document.body.getAttribute('data-base') || '';
        var input = page.querySelector('[data-search-input]');
        var select = page.querySelector('[data-search-region]');
        var results = page.querySelector('[data-search-results]');
        var count = page.querySelector('[data-search-count]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var allMovies = [];

        if (input) {
            input.value = query;
        }

        fetch(base + 'assets/data/movies.json')
            .then(function (response) { return response.json(); })
            .then(function (data) {
                allMovies = data;
                render();
            })
            .catch(function () {
                if (results) {
                    results.innerHTML = '<div class="empty-state">搜索数据加载失败，请确认静态资源路径完整。</div>';
                }
            });

        function card(movie) {
            return [
                '<article class="video-card">',
                '  <a href="' + base + 'movie/' + movie.id + '.html">',
                '    <div class="poster-shell card-poster" data-title="' + escapeHtml(movie.title) + '">',
                '      <img src="' + base + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '      <span class="region-tag">' + escapeHtml(movie.regionGroup) + '</span>',
                '    </div>',
                '    <div class="card-body">',
                '      <h3>' + escapeHtml(movie.title) + '</h3>',
                '      <p>' + escapeHtml(movie.oneLine || '') + '</p>',
                '      <div class="meta-row"><span>' + escapeHtml(movie.genreRaw || '') + '</span><span>' + escapeHtml(movie.year || '') + '</span></div>',
                '    </div>',
                '  </a>',
                '</article>'
            ].join('');
        }

        function render() {
            var keyword = normalize(input && input.value);
            var region = select ? select.value : '全部';
            var filtered = allMovies.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.regionGroup,
                    movie.type,
                    movie.typeGroup,
                    movie.year,
                    movie.genreRaw,
                    (movie.tags || []).join(' '),
                    movie.oneLine,
                    movie.summary
                ].join(' '));
                return (!keyword || haystack.indexOf(keyword) !== -1) &&
                    (region === '全部' || movie.regionGroup === region);
            }).slice(0, 120);

            if (count) {
                count.textContent = String(filtered.length);
            }

            if (!results) {
                return;
            }

            if (!filtered.length) {
                results.innerHTML = '<div class="empty-state">未找到相关影片，请尝试更换关键词。</div>';
                return;
            }

            results.innerHTML = filtered.map(card).join('');
        }

        if (input) {
            input.addEventListener('input', render);
        }
        if (select) {
            select.addEventListener('change', render);
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
})();
