/*
(function($) {
    $.fn.lazyBackgroundLoader = function(options) {
        const settings = $.extend({
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        }, options);

        const observer = new IntersectionObserver(handleIntersection, settings);

        function loadBackgrounds() {
            return this.map((index, div) => {
                const $div = $(div);
                const dataBackgroundImg = $div.attr('data-background-img');

                if (!dataBackgroundImg) {
                    return;
                }

                observer.observe(div);

                return backgroundLoadPromise($div);
            }).get();
        }

        function handleIntersection(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const divElement = entry.target;
                    lazyLoadBackground($(divElement));
                    observer.unobserve(divElement);
                }
            });
        }

        function lazyLoadBackground($divElement) {
            const src = $divElement.attr('data-background-img');

            if (src && (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://'))) {
                $divElement.addClass('loaded');
                return Promise.resolve();
            }

            return $.ajax({
                url: src,
                xhrFields: {
                    responseType: 'blob'
                },
                success: (blob) => {
                    $divElement.css('background-image', `url(${URL.createObjectURL(blob)})`);
                    $divElement.addClass('loaded');
                },
                error: () => console.error(`Failed to load background image: ${src}`)
            });
        }

        function backgroundLoadPromise($div) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => reject(new Error(`Failed to load background image: ${$div.css('background-image')}`));
                img.src = $div.attr('data-background-img');
            });
        }

        return this.each(function() {
            const backgroundPromises = loadBackgrounds.call($(this));

            Promise.all(backgroundPromises)
                .then(() => console.log('All backgrounds loaded successfully'))
                .catch(error => console.error('Failed to load backgrounds:', error));
        });
    };
}(jQuery));
*/
(function($) {
    $.fn.lazyBackgroundLoader = function(options) {
        const defaultSettings = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        };

        const settings = $.extend(defaultSettings, options);
        const observer = new IntersectionObserver(handleIntersection, settings);

        function isValidURL(src) {
            return /^(data:|https?:\/\/)/.test(src);
        }

        function loadBackgrounds() {
            return this.map((index, divElement) => {
                const $divElement = $(divElement);
                const dataBackgroundImg = $divElement.attr('data-background-img');

                if (!dataBackgroundImg) return;

                observer.observe(divElement);
                return backgroundLoadPromise($divElement);
            }).get();
        }

        function handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const divElement = entry.target;
                    lazyLoadBackground($(divElement));
                    observer.unobserve(divElement);
                }
            });
        }

        function lazyLoadBackground($divElement) {
            const src = $divElement.attr('data-background-img');

            if (!isValidURL(src)) return Promise.resolve();

            if (src.startsWith('data:')) {
                $divElement.css('background-image', `url(${src})`).addClass('loaded');
                return Promise.resolve();
            }

            return $.ajax({
                url: src,
                xhrFields: {
                    responseType: 'blob'
                }
            })
            .then((blob) => {
                $divElement.css('background-image', `url(${URL.createObjectURL(blob)})`).addClass('loaded');
            })
            .catch(() => console.error(`Failed to load background image: ${src}`));
        }

        function backgroundLoadPromise($divElement) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = () => reject(new Error(`Failed to load background image: ${$divElement.attr('data-background-img')}`));
                img.src = $divElement.attr('data-background-img');
            });
        }

        return this.each(function() {
            const backgroundPromises = loadBackgrounds.call($(this));

            Promise.all(backgroundPromises)
                .then(() => console.log('All backgrounds loaded successfully'))
                .catch(error => console.error('Failed to load backgrounds:', error));
        });
    };
}(jQuery));