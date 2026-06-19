(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var links = document.querySelector('[data-nav-links]');
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener('click', function () {
            links.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
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

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || '0'));
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
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initSearchPanels() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            var typeFilter = scope.querySelector('[data-type-filter]');
            var yearFilter = scope.querySelector('[data-year-filter]');
            var counter = scope.querySelector('[data-result-count]');
            var container = scope.nextElementSibling || document;
            var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));

            function applyFromUrl() {
                if (!input) {
                    return;
                }
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q');
                if (q) {
                    input.value = q;
                }
            }

            function matches(card, query, typeValue, yearValue) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var cardType = (card.getAttribute('data-type') || '').toLowerCase();
                var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                if (query && haystack.indexOf(query) === -1) {
                    return false;
                }
                if (typeValue && cardType.indexOf(typeValue) === -1) {
                    return false;
                }
                if (yearValue && cardYear !== yearValue) {
                    return false;
                }
                return true;
            }

            function update() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var typeValue = typeFilter ? typeFilter.value.trim().toLowerCase() : '';
                var yearValue = yearFilter ? yearFilter.value.trim().toLowerCase() : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = matches(card, query, typeValue, yearValue);
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });
                if (counter) {
                    counter.textContent = String(visible);
                }
            }

            applyFromUrl();
            [input, typeFilter, yearFilter].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', update);
                    control.addEventListener('change', update);
                }
            });
            update();
        });
    }

    function attachHls(video, source, message) {
        if (!source) {
            if (message) {
                message.textContent = '播放源暂不可用';
            }
            return Promise.reject(new Error('missing source'));
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video._hlsInstance) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.src) {
                video.src = source;
            }
        } else {
            if (message) {
                message.textContent = '当前浏览器需要 HLS 支持后播放';
            }
        }
        return video.play();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var message = player.querySelector('[data-player-message]');
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-src');

            function play() {
                player.classList.add('is-playing');
                if (message) {
                    message.textContent = '正在加载高清播放源...';
                }
                attachHls(video, source, message).then(function () {
                    if (message) {
                        message.textContent = '';
                    }
                }).catch(function () {
                    player.classList.remove('is-playing');
                    if (message && !message.textContent) {
                        message.textContent = '视频启动失败，请检查网络后重试';
                    }
                });
            }

            if (button) {
                button.addEventListener('click', play);
            }
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    player.classList.remove('is-playing');
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initSearchPanels();
        initPlayers();
    });
}());
