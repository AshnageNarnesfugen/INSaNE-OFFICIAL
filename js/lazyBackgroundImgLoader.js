(function($) {
    $.fn.lazyBackgroundLoader = function(options) {
        const settings = $.extend({
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        }, options);

        const observer = new IntersectionObserver(handleIntersection, {
            root:       settings.root,
            rootMargin: settings.rootMargin,
            threshold:  settings.threshold
        });

        function handleIntersection(entries, obs) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    lazyLoadBackground($(entry.target));
                    obs.unobserve(entry.target);
                }
            });
        }

        function lazyLoadBackground($divElement) {
            const src = $divElement.attr('data-background-img');
            if (!src) return Promise.resolve();

            // data: URIs are inline — apply immediately, no fetch needed
            if (src.startsWith('data:')) {
                $divElement.css('background-image', `url(${src})`).addClass('loaded');
                return Promise.resolve();
            }

            // Use native Image for http(s): — browser caches it correctly,
            // no blob/objectURL needed, no double-download
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    $divElement.css('background-image', `url(${src})`).addClass('loaded');
                    resolve();
                };
                img.onerror = () => {
                    console.error(`Failed to load background image: ${src}`);
                    resolve();
                };
                img.src = src;
            });
        }

        return this.each(function() {
            const $el = $(this);
            const src = $el.attr('data-background-img');
            if (src) observer.observe($el[0]);
        });
    };
}(jQuery));
