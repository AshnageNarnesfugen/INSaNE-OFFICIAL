/*(function($) {
    $.fn.lazyImageLoader = function(options) {
        const settings = $.extend({
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
            pathToMessageMap: {
                '/': 'Download',
                '/es': 'Descarga',
                '/jp': 'ダウンロード',
                '/pt': 'Baixar',
                '/fr': 'Télécharger',
                '/de': 'Herunterladen',
                '/it': 'Scarica',
                '/ru': 'Скачать',
                '/zh': '下载',
                '/kr': '다운로드'
            },
            defaultDownloadMessage: 'Download'
        }, options);

        const observer = new IntersectionObserver(handleIntersection, settings);
        const downloadMSN = getDownloadMSN();

        function loadImages() {
            return this.map((index, img) => {
                const $img = $(img);
                const dataSrc = $img.attr('data-src');
                const dataModule = $img.attr('data-module');
                const dataBlur = $img.attr('data-blur');
    
                if (!dataSrc || (!dataModule && dataModule !== 'true')) {
                    return;
                }
    
                $img.on('dragstart', function() {
                    return false;
                })
    
                if (dataBlur === 'true' && !$img.parent().hasClass('blur-load')) {
                    $img.wrap('<div class="blur-load"></div>');
                }
    
                $img.attr('src', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNTAwIDUwMCI+DQogIDxyZWN0IGZpbGw9InRyYW5zcGFyZW50IiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIvPg0KICA8dGV4dCBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDI1NS41KSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzAiIGR5PSIxMC41IiBmb250LXdlaWdodD0iYm9sZCIgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxvYWRpbmcuLi48L3RleHQ+DQo8L3N2Zz4=')
    
                observer.observe(img);
    
                if (dataModule === 'true') {
                    setupModalImage($img);
                }
    
                return imageLoadPromise($img);
            }).get();
        }

        function handleIntersection(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const imgElement = entry.target;
                    lazyLoadImage($(imgElement));
                    observer.unobserve(imgElement);
                }
            });
        }

        function lazyLoadImage($imgElement) {
            const src = $imgElement.attr('data-src');
    
            if (src && (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://'))) {
                $imgElement.parent().addClass('loaded');
                return Promise.resolve();
            }
    
            return $.ajax({
                url: src,
                xhrFields: {
                    responseType: 'blob'
                },
                success: (blob) => {
                    $imgElement.attr('src', URL.createObjectURL(blob));
                    setImageDimensions($imgElement, src); // Call the function to set dimensions
                    $imgElement.parent().addClass('loaded');
                },
                error: () => console.error(`Failed to load image: ${src}`)
            });
        }

        function setImageDimensions($imgElement, src) {
            let img = new Image();
            img.onload = function() {
                $imgElement.attr('width', this.width);
                $imgElement.attr('height', this.height);
            }
            img.src = src;
        }

        function imageLoadPromise($img) {
            return new Promise((resolve, reject) => {
                $img.on('load', () => resolve());
                $img.on('error', () => reject(new Error(`Failed to load image: ${$img.src}`)));
            });
        }

        function setupModalImage($img) {
            $img.on('click', () => {
                const src = $img.attr('src');
                const $modal = $(
                    `<div class="modal active">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                <img class="modal-img img-fluid inherit" src="${src}" ondragstart="return false;">
                                <a class="download-btn" href="${src}" download>${downloadMSN}</a>
                                </div>
                            </div>
                        </div>`
                );
    
                $modal.appendTo('body').show();
                $('body').css('overflow', 'hidden');
    
                $modal.on('click', () => {
                    $modal.hide().remove();
                    $('body').css('overflow', 'visible');
                });
            });
        }

        function getDownloadMSN() {
            const url = new URL(window.location.href);
            const path = url.pathname;
            return settings.pathToMessageMap[path] || settings.defaultDownloadMessage;              
        }

        return this.each(function() {
            const imagePromises = loadImages.call($(this));

            Promise.all(imagePromises)
                .then(() => console.log('All images loaded successfully'))
                .catch(error => console.error('Failed to load images:', error));
        });
    };
}(jQuery));*/

(function($) {
    $.fn.lazyImageLoader = function(options) {
        const settings = $.extend({
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
            pathToMessageMap: {
                '/': 'Download',
                '/es': 'Descarga',
                '/jp': 'ダウンロード',
                '/pt': 'Baixar',
                '/fr': 'Télécharger',
                '/de': 'Herunterladen',
                '/it': 'Scarica',
                '/ru': 'Скачать',
                '/zh': '下载',
                '/kr': '다운로드'
            },
            defaultDownloadMessage: 'Download',
            // Nuevo: Texto para el cursor flotante
            cursorText: 'Open Image'
        }, options);

        const observer = new IntersectionObserver(handleIntersection, settings);
        const downloadMSN = getDownloadMSN();

        // --- Estilos necesarios para la funcionalidad ---
        if (!$('#lazy-loader-styles').length) {
            $('<style id="lazy-loader-styles">')
                .prop('type', 'text/css')
                .html(`
                    .blur-load { position: relative; overflow: hidden; cursor: none; }
                    .custom-cursor-pill {
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
                const $img = $(img);
                const dataSrc = $img.attr('data-src');
                const dataModule = $img.attr('data-module');
                const dataBlur = $img.attr('data-blur');
    
                if (!dataSrc || (!dataModule && dataModule !== 'true')) {
                    return;
                }
    
                $img.on('dragstart', () => false);
    
                // Asegurar contenedor y añadir la "pildorita"
                if (!$img.parent().hasClass('blur-load')) {
                    $img.wrap('<div class="blur-load"></div>');
                }
                
                const $container = $img.parent();
                const $cursor = $('<div class="custom-cursor-pill">' + settings.cursorText + '</div>').appendTo($container);

                // --- Lógica de GSAP para el seguimiento ---
                $container.on('mousemove', (e) => {
                    const rect = $container[0].getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    gsap.to($cursor, {
                        x: x,
                        y: y,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                });

                $container.on('mouseenter', () => {
                    gsap.to($cursor, { opacity: 1, scale: 1, duration: 0.2 });
                });

                $container.on('mouseleave', () => {
                    gsap.to($cursor, { opacity: 0, scale: 0.5, duration: 0.2 });
                });

                $img.attr('src', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNTAwIDUwMCI+DQogIDxyZWN0IGZpbGw9InRyYW5zcGFyZW50IiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIvPg0KICA8dGV4dCBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDI1NS41KSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzAiIGR5PSIxMC41IiBmb250LXdlaWdodD0iYm9sZCIgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxvYWRpbmcuLi48L3RleHQ+DQo8L3N2Zz4=');
                observer.observe(img);
    
                if (dataModule === 'true') {
                    setupModalImage($img);
                }
    
                return imageLoadPromise($img);
            }).get();
        }

        // ... (Resto de funciones: handleIntersection, lazyLoadImage, etc. se mantienen igual)

        function handleIntersection(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    lazyLoadImage($(entry.target));
                    observer.unobserve(entry.target);
                }
            });
        }

        function lazyLoadImage($imgElement) {
            const src = $imgElement.attr('data-src');
            if (src && (src.startsWith('data:') || src.startsWith('http'))) {
                $imgElement.parent().addClass('loaded');
                return Promise.resolve();
            }
            return $.ajax({
                url: src,
                xhrFields: { responseType: 'blob' },
                success: (blob) => {
                    $imgElement.attr('src', URL.createObjectURL(blob));
                    setImageDimensions($imgElement, src);
                    $imgElement.parent().addClass('loaded');
                }
            });
        }

        function setImageDimensions($imgElement, src) {
            let img = new Image();
            img.onload = function() {
                $imgElement.attr('width', this.width).attr('height', this.height);
            }
            img.src = src;
        }

        function imageLoadPromise($img) {
            return new Promise((resolve, reject) => {
                $img.on('load', resolve).on('error', reject);
            });
        }

        function setupModalImage($img) {
            $img.on('click', () => {
                const src = $img.attr('src');
                const $modal = $(
                    `<div class="modal active">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <img class="modal-img img-fluid inherit" src="${src}" ondragstart="return false;">
                                <a class="download-btn" href="${src}" download>${downloadMSN}</a>
                            </div>
                        </div>
                    </div>`
                );
                $modal.appendTo('body').show();
                $('body').css('overflow', 'hidden');
                $modal.on('click', () => {
                    $modal.remove();
                    $('body').css('overflow', 'visible');
                });
            });
        }

        function getDownloadMSN() {
            const path = window.location.pathname;
            return settings.pathToMessageMap[path] || settings.defaultDownloadMessage;              
        }

        return this.each(function() {
            const imagePromises = loadImages.call($(this));
            Promise.all(imagePromises).catch(err => console.error(err));
        });
    };
}(jQuery));