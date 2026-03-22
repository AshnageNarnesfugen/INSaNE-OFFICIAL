(function($) {
    $.fn.lazyImageLoader = function(options) {
        const settings = $.extend(true, {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        }, options);

        function getPathtomessagemap() {
            // Always read from INSaNE_DATA at call time.
            // Intentionally ignores settings.pathToMessageMap — main.min.js passes
            // a stale hardcoded EN-only object via options that would override the JSON.
            const raw = (window.INSaNE_DATA || {})['path-messages'];
            console.log('[lazyImageLoader] INSaNE_DATA keys:', Object.keys(window.INSaNE_DATA || {}));
            console.log('[lazyImageLoader] path-messages raw:', raw);
            const map = (raw || {}).messages || {
                downloadText: { '/': 'Download' },
                openText:     { '/': 'Open Image' },
                closeText:    { '/': 'Close Image' }
            };
            const path = window.location.pathname.replace(/\/$/, '') || '/';
            console.log('[lazyImageLoader] path:', path, '| /es entry:', map.downloadText && map.downloadText['/es']);
            return {
                downloadTextpath: map.downloadText[path] || map.downloadText['/'],
                openTextpath:     map.openText[path]     || map.openText['/'],
                closeTextpath:    map.closeText[path]    || map.closeText['/']
            };
        }

        // ── Solo pasar las opciones que IntersectionObserver entiende ────────
        // Antes se pasaba el objeto settings completo, lo que causaba que
        // IntersectionObserver recibiera keys desconocidas (pathToMessageMap, etc.)
        const observerOptions = {
            root:       settings.root,
            rootMargin: settings.rootMargin,
            threshold:  settings.threshold
        };
        const observer = new IntersectionObserver(handleIntersection, observerOptions);

        const downloadMSN = getPathtomessagemap().downloadTextpath;
        const openMSN     = getPathtomessagemap().openTextpath;
        const closeMSN    = getPathtomessagemap().closeTextpath;

        // --- Estilos necesarios para la funcionalidad ---
        if (!$('#lazy-loader-styles').length) {
            $('<style id="lazy-loader-styles">')
                .prop('type', 'text/css')
                .html(`
                    .cursor-container { position: relative; overflow: hidden; }
                    .cursor-container * { cursor: none; }
                    .custom-cursor-pill {
                        top: 0; left: 0;
                        position: absolute;
                        pointer-events: none;
                        padding: 8px 16px;
                        background: rgba(0, 0, 0, 0.6);
                        backdrop-filter: blur(4px);
                        color: #fff;
                        border-radius: 50px;
                        font-size: 14px;
                        font-weight: 500;
                        z-index: 100;
                        opacity: 0;
                        white-space: nowrap;
                        transform: translate(-50%, -50%);
                        border: 1px solid rgba(255,255,255,0.1);
                    }
                `).appendTo('head');
        }

        function loadImages() {
            return this.map((index, img) => {
                const $img       = $(img);
                const dataSrc    = $img.attr('data-src');
                const dataModule = $img.attr('data-module');
                const dataBlur   = $img.attr('data-blur');

                if (!dataSrc || (!dataModule && dataModule !== 'true')) return;

                $img.on('dragstart', () => false);

                if (dataBlur === 'true' && !$img.parent().hasClass('blur-load')) {
                    $img.wrap('<div class="blur-load"></div>');
                }

                const $container = $img.parent();
                const $cursor = $(`<div class="custom-cursor-pill">${openMSN}</div>`).appendTo($container);

                // Placeholder SVG inline mientras el observer no ha disparado
                $img.attr('src', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNTAwIDUwMCI+DQogIDxyZWN0IGZpbGw9InRyYW5zcGFyZW50IiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIvPg0KICA8dGV4dCBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDI1NS41KSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzAiIGR5PSIxMC41IiBmb250LXdlaWdodD0iYm9sZCIgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxvYWRpbmcuLi48L3RleHQ+DQo8L3N2Zz4=');

                observer.observe(img);

                if (dataModule === 'true') {
                    setupModalImage($img);
                    $container.addClass('cursor-container');
                    $container.on('mousemove', (e) => {
                        const rect = $container[0].getBoundingClientRect();
                        gsap.to($cursor, {
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                            duration: 0.3,
                            ease: 'power2.out'
                        });
                    });
                    $container.on('mouseenter', () => gsap.to($cursor, { opacity: 1, scale: 1, duration: 0.2 }));
                    $container.on('mouseleave', () => gsap.to($cursor, { opacity: 0, scale: 0.5, duration: 0.2 }));
                }

                return imageLoadPromise($img);
            }).get();
        }

        function handleIntersection(entries, obs) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    lazyLoadImage($(entry.target));
                    obs.unobserve(entry.target);
                }
            });
        }

        // ── CAMBIO CRÍTICO DE PERFORMANCE ────────────────────────────────────
        //
        // ANTES (versión anterior):
        //   fetch(src) → .blob() → URL.createObjectURL(blob) → img.src = objectURL
        //
        //   Problemas:
        //   1. El browser descarga la imagen DOS veces (fetch + render)
        //   2. Los objectURLs no se persisten en caché entre sesiones
        //   3. Consume el doble de RAM (blob en memoria + imagen decodificada)
        //   4. No aprovecha HTTP/2 multiplexing ni CDN caching headers
        //   5. El download en el modal apuntaba a un blob:// efímero
        //
        // AHORA:
        //   img.src = data-src directamente
        //
        //   Beneficios:
        //   ✓ Una sola descarga, el browser la cachea con sus headers normales
        //   ✓ HTTP/2 push y CDN funcionan correctamente
        //   ✓ Mitad de uso de RAM
        //   ✓ El download del modal usa la URL real (funciona offline con caché)
        //   ✓ LCP mejora porque el browser puede priorizar la imagen crítica
        // ─────────────────────────────────────────────────────────────────────
        function lazyLoadImage($img) {
            const src = $img.attr('data-src');
            if (!src) return;

            $img.on('load', function() {
                setImageDimensions($img, src);
                $img.parent().addClass('loaded');
            });
            $img.on('error', function() {
                console.error(`Failed to load image: ${src}`);
            });

            // Asignación directa — dispara la descarga nativa del browser
            $img.attr('src', src);
        }

        function setImageDimensions($imgElement, src) {
            // Respetar dimensiones hardcodeadas en el HTML (evitan CLS)
            // Solo calcular dinámicamente si no están definidas
            if ($imgElement.attr('width') && $imgElement.attr('height')) return;

            const img = new Image();
            img.onload = function() {
                $imgElement.attr('width', this.width);
                $imgElement.attr('height', this.height);
            };
            img.src = src;
        }

        function imageLoadPromise($img) {
            return new Promise((resolve, reject) => {
                $img.on('load',  () => resolve());
                $img.on('error', () => reject(new Error(`Failed to load image: ${$img.attr('data-src')}`)));
            });
        }

        function setupModalImage($img) {
            $img.on('click', () => {
                const src = $img.attr('src');
                const $modal = $(`
                    <div class="modal active">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <img class="modal-img img-fluid inherit" src="${src}" ondragstart="return false;">
                            </div>
                        </div>
                        <div class="modal-cursor-pill"></div>
                    </div>
                `);

                const $modalCursor = $modal.find('.modal-cursor-pill');
                const $modalImg    = $modal.find('.modal-img');

                $modalCursor.css({
                    top: 0, left: 0,
                    position: 'fixed',
                    'pointer-events': 'none',
                    padding: '8px 16px',
                    background: 'rgba(0,0,0,0.6)',
                    'backdrop-filter': 'blur(4px)',
                    '-webkit-backdrop-filter': 'blur(4px)',
                    color: '#fff',
                    'border-radius': '50px',
                    'font-size': '14px',
                    'font-weight': '500',
                    'z-index': '10001',
                    opacity: 0,
                    transform: 'translate(-50%,-50%)'
                });

                $modal.appendTo('body').show();
                $('body').css('overflow', 'hidden');

                $modal.on('mousemove', (e) => {
                    const isOverImage = $(e.target).closest('.modal-img').length > 0;
                    $modalCursor.text(isOverImage ? downloadMSN : closeMSN);
                    gsap.to($modalCursor, {
                        x: e.clientX,
                        y: e.clientY,
                        duration: 0.15,
                        ease: 'power2.out',
                        opacity: 1
                    });
                });

                $modal.css('cursor', 'none');
                $modalImg.css('cursor', 'none');

                $modal.on('click', function(e) {
                    if (!$(e.target).closest('.modal-img, .download-btn').length) {
                        $modal.remove();
                        $('body').css('overflow', 'visible');
                    }
                });

                // La URL real permite que el atributo download funcione
                // correctamente incluso con caché offline
                $modalImg.on('click', (e) => {
                    e.stopPropagation();
                    const link = document.createElement('a');
                    link.href = src;
                    link.download = '';
                    link.click();
                });
            });
        }

        return this.each(function() {
            const imagePromises = loadImages.call($(this));
            Promise.all(imagePromises)
                .then(() => console.log('All images loaded successfully'))
                .catch(error => console.error('Failed to load images:', error));
        });
    };
}(jQuery));