(() => {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('is-open');
            toggle.textContent = menu.classList.contains('is-open') ? '×' : '☰';
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        let current = 0;

        const show = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => show(index));
        });

        if (slides.length > 1) {
            setInterval(() => show(current + 1), 5600);
        }
    }

    document.querySelectorAll('[data-search-form]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = form.querySelector('input[type="search"]');
            const value = input ? input.value.trim() : '';
            const target = value ? `./search.html?q=${encodeURIComponent(value)}` : './search.html';
            window.location.href = target;
        });
    });

    const scope = document.querySelector('[data-filter-scope]');

    if (scope) {
        const input = scope.querySelector('.js-search-input');
        const region = scope.querySelector('.js-filter-region');
        const year = scope.querySelector('.js-filter-year');
        const type = scope.querySelector('.js-filter-type');
        const cards = Array.from(scope.querySelectorAll('.movie-card, .rank-item'));
        const empty = scope.querySelector('.empty-state');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        const normalize = (value) => String(value || '').toLowerCase();

        const apply = () => {
            const query = normalize(input ? input.value.trim() : '');
            const regionValue = region ? region.value : 'all';
            const yearValue = year ? year.value : 'all';
            const typeValue = type ? type.value : 'all';
            let visible = 0;

            cards.forEach((card) => {
                const text = normalize(card.dataset.search || card.textContent);
                const matchQuery = !query || text.includes(query);
                const matchRegion = regionValue === 'all' || card.dataset.region === regionValue;
                const matchYear = yearValue === 'all' || card.dataset.year === yearValue;
                const matchType = typeValue === 'all' || card.dataset.type === typeValue;
                const matched = matchQuery && matchRegion && matchYear && matchType;

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };

        [input, region, year, type].forEach((item) => {
            if (item) {
                item.addEventListener('input', apply);
                item.addEventListener('change', apply);
            }
        });

        apply();
    }
})();
