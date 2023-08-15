(function($) {
    $.fn.lazyImageLoader = function(options) {
        const settings = $.extend({
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
            pathToMessageMap: {
                '/': 'Download',
                '/es': 'Descarga',
                '/ja': 'ダウンロード',
                '/pt': 'Baixar',
                '/fr': 'Télécharger',
                '/de': 'Herunterladen',
                '/it': 'Scarica',
                '/ru': 'Скачать',
                '/cn': '下载',
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

                $img.on('dragstart', false); // Simplified dragstart prevention

                if (dataBlur === 'true' && !$img.parent().hasClass('blur-load')) {
                    $img.wrap('<div class="blur-load"></div>');
                }

                observer.observe(img);

                if (dataModule === 'true') {
                    setupModalImage($img);
                }

                return imageLoadPromise($img);
            }).get();
        }

        function handleIntersection(entries) {
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

            if (/^(data:|http:\/\/|https:\/\/)/.test(src)) {
                $imgElement.parent().addClass('loaded');
                return Promise.resolve();
            }

            return $.ajax({
                url: src,
                xhrFields: {
                    responseType: 'blob'
                },
                success: (blob) => {
                    const blobURL = URL.createObjectURL(blob);
                    $imgElement.attr('src', blobURL);
                    setImageDimensions($imgElement, src);
                    $imgElement.parent().addClass('loaded');
                    $imgElement.on('load', () => {
                        // Revoke the blob URL after the image has fully loaded
                        URL.revokeObjectURL(blobURL);
                    });
                },
                error: () => console.error(`Failed to load image: ${src}`)
            });
        }

        function setImageDimensions($imgElement, src) {
            let img = new Image();
            img.onload = function() {
                $imgElement.attr('width', this.width);
                $imgElement.attr('height', this.height);
            };
            img.src = src;
        }

        function imageLoadPromise($img) {
            return new Promise((resolve, reject) => {
                $img.on('load', function onLoad() {
                    $img.off('load', onLoad);
                    resolve();
                });
                $img.on('error', function onError() {
                    $img.off('error', onError);
                    reject(new Error(`Failed to load image: ${$img.attr('src')}`));
                });
            });
        }

        function setupModalImage($img) {
            $img.on('click', () => {
                const src = $img.attr('src');
                const $modal = $(
                    `<div class="modal">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <img class="modal-img img-fluid inherit" src="${src}" ondragstart="return false;">
                                <a class="download-btn" href="${src}" download>${downloadMSN}</a>
                            </div>
                        </div>
                    </div>`
                );

                $modal.appendTo('body').show();
                $('body').addClass('modal-open'); // Use class instead of direct style manipulation

                $modal.on('click', () => {
                    $modal.hide().remove();
                    $('body').removeClass('modal-open');
                });
            });
        }

        function getDownloadMSN() {
            const path = new URL(window.location.href).pathname;
            return settings.pathToMessageMap[path] || settings.defaultDownloadMessage;
        }

        return this.each(function() {
            const imagePromises = loadImages.call($(this));

            Promise.all(imagePromises)
                .then(() => console.log('All images loaded successfully'))
                .catch(error => console.error('Failed to load images:', error));
        });
    };
}(jQuery));

// CSS (you should include this in your styles)
/* .modal-open { overflow: hidden; } */
