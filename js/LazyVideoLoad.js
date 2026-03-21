/*(function($) {
    $.fn.lazyVideoLoader = function(options) {
        const settings = $.extend({
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        }, options);

        const observer = new IntersectionObserver(handleIntersection, settings);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

         // Page Visibility API
         let hidden, visibilityChange;
         if (typeof document.hidden !== "undefined") {
             hidden = "hidden";
             visibilityChange = "visibilitychange";
         } else if (typeof document.msHidden !== "undefined") {
             hidden = "msHidden";
             visibilityChange = "msvisibilitychange";
         } else if (typeof document.webkitHidden !== "undefined") {
             hidden = "webkitHidden";
             visibilityChange = "webkitvisibilitychange";
         }

         let isTabActive = !document[hidden];  // Initialize based on the current visibility status

         function handleVisibilityChange(videoElement) {
            const video = $(videoElement);
            if (document[hidden]) {
                if (!video[0].paused && video.attr('data-user-started') === 'true') {
                    video[0].pause();
                    video.attr('data-paused', 'true');
                }
            } else {
                if (video.attr('data-paused') === 'true' && video.attr('data-user-started') === 'true') {
                    // Check if the video is visible before playing it again
                    const entry = observer.takeRecords().find(entry => entry.target === videoElement);
                    if (entry && entry.isIntersecting) {
                        video[0].play();
                        video.attr('data-paused', 'false');
                    }
                }
            }
        }

        if (typeof document.addEventListener === "undefined" || hidden === undefined) {
            console.log("This demo requires Page Visibility API.");
        }

        function loadVideos() {
            this.each((index, videoElement) => {
                $(videoElement).attr('id', `video-${index}`); // Assign ID to each video
                observer.observe(videoElement);
                document.addEventListener(visibilityChange, () => handleVisibilityChange(videoElement), false);
            });
        }

        function handleIntersection(entries) {
            entries.forEach(entry => {
                const video = $(entry.target);
                if (entry.isIntersecting) {
                    if (video.attr('data-loaded') !== 'true') {
                        video.data('posters', []);  // Initialize 'posters' data on each video
                        lazyLoadVideo(video);
                        lazyLoadPoster(video);
                        video.attr('data-loaded', 'true');
                    }
                    if (video.attr('data-paused') === 'true' && video.attr('data-user-started') === 'true' && isTabActive) {
                        video[0].play();
                        video.attr('data-paused', 'false');
                    }
                } else {
                    if (!video[0].paused && video.attr('data-user-started') === 'true') {
                        video[0].pause();
                        video.attr('data-paused', 'true');
                    }
                }
            });
        }

        function fetchVideoSource(src) {
            return fetch(src)
                .then(response => response.blob())
                .then(blob => URL.createObjectURL(blob))
                .catch(err => {
                    console.error(`Failed to fetch video: ${err}`);
                    return '';
                });
        }

        function lazyLoadPoster(video) {
            const posterData = video.attr('data-poster');
    
            if (posterData) {
                let posterObject;
                try {
                    posterObject = JSON.parse(posterData);
                } catch {
                    console.error(`Unable to parse poster data: ${posterData}`);
                    return;
                }
    
                const posterPriorityList = Object.keys(posterObject).sort();
                loadPostersFromPriorityList(video, posterObject, posterPriorityList, 0);
            }
        }

        function loadPostersFromPriorityList(video, posterObject, posterPriorityList, index = 0) {
            if (index >= posterPriorityList.length) {
                console.log(`All posters attempted for video`);
                return;
            }
        
            const posterPriority = posterPriorityList[index];
            const posterURL = posterObject[posterPriority];
            console.log(`Loading poster with priority ${posterPriority} from URL ${posterURL}`);
        
            fetch(posterURL)
                .then(response => response.blob())
                .then(blob => {
                    const objectURL = URL.createObjectURL(blob);
                    video.data('posters').push(objectURL);  // Store each loaded poster URL in 'posters' data
        
                    if (index === 0) {  // Set the first loaded poster as the video poster
                        video.attr('poster', objectURL);
                        if (isMobile) { // If mobile, start loading second poster right away
                            loadPostersFromPriorityList(video, posterObject, posterPriorityList, index + 1);
                        }
                    } else if (isMobile) { // If mobile and second poster has loaded, replace the first one
                        video.attr('poster', objectURL);
                    }
        
                    loadPostersFromPriorityList(video, posterObject, posterPriorityList, index + 1);
                })
                .catch(err => {
                    console.error(`Failed to load poster image from URL ${posterURL}: ${err}`);
                    loadPostersFromPriorityList(video, posterObject, posterPriorityList, index + 1);
                });
        }

        function lazyLoadVideo(video) {
            const sources = video.find('source');
            const overlay = createOverlay(video);
            video.prop('controls', false);
        
            const promises = sources.map((index, sourceElement) => {
                const source = $(sourceElement);
                const videoURL = source.attr('data-src');
        
                return fetchVideoSource(videoURL)
                    .then(videoObjectURL => {
                        if (videoObjectURL) {
                            source.attr('src', videoObjectURL);
                            return videoObjectURL;
                        } else {
                            throw new Error(`Unable to load video from source: ${videoURL}`);
                        }
                    });
            }).get();
        
            $.when.apply($, promises).then(() => {
                video[0].load();
                setupPlayButton(overlay, video);
                checkAndApplyHover(video);  // Check and apply hover effect after video sources are loaded
            });
        }

        function createOverlay(video) {
            const overlay = $('<div>', {
                class: 'video-overlay',
                text: 'Loading...'
            });
    
            video.parent().append(overlay);
            return overlay;
        }

        function setupPlayButton(overlay, video) {
            const playButtonTemplate = `
                <div class="play-button-overlay d-flex align-items-center justify-content-center">
                    <button class="play-button btn btn-danger btn-lg" aria-label="Play Button" data-video-id="${video.attr('id')}">
                        <span class="btn-iris"></span>
                    </button>
                </div>
            `;

            overlay.html(playButtonTemplate);

            video.on('loadedmetadata', () => video.prop('controls', false));

            overlay.find('.play-button').on('click', () => {
                overlay.remove();
                video.prop('controls', true);
                video[0].play();
                video.attr('data-user-started', 'true');  // Set flag when user starts playing the video
            });
    
            video.on('ended', () => {
                const posters = video.data('posters');
                video[0].load()
                video.parent().append(overlay);
                overlay.html(playButtonTemplate);
                video.prop('controls', false);
                video.attr('poster', posters[0]);
    
                overlay.find('.play-button').on('click', () => {
                    overlay.remove();
                    video.prop('controls', true);
                    video[0].play();
                    document.addEventListener(visibilityChange, () => handleVisibilityChange(video[0]), false);
                });
                if (!isMobile) {
                    checkAndApplyHover(video);
                    video.attr('poster', posters[0]);
                } else {
                    if (posters.length > 1) {
                        video.attr('poster', posters[1]);
                    } else {
                        video.attr('poster', posters[0]);
                    }
                }
                document.removeEventListener(visibilityChange, () => handleVisibilityChange(video[0]), false);
            });
        }

        function checkAndApplyHover(video) {
            const posters = video.data('posters');
    
            if (posters.length > 1) {
                if (!isMobile) {
                    // On desktop, switch poster image on hover
                    const overlay = video.siblings('.video-overlay');
                    const playButton = overlay.find('.play-button');
                    playButton.hover(
                        () => video.attr('poster', posters[1]),
                        () => video.attr('poster', posters[0])
                    );
                }
            }
        }

        return this.each(function() {
            loadVideos.call($(this));
        });
    };
}(jQuery));*/

(function($) {
    $.fn.lazyVideoLoader = function(options) {
        const settings = $.extend({
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
            // Parámetros de animación GSAP
            startWidth: "80%",
            endWidth: "100%",
            startRadius: "40px",
            endRadius: "0px",
            gsapStart: "top bottom",
            gsapEnd: "top 10%"
        }, options);

        // Registrar ScrollTrigger por si no se hizo externamente
        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);
        }

        const observer = new IntersectionObserver(handleIntersection, settings);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Page Visibility API
        let hidden, visibilityChange;
        if (typeof document.hidden !== "undefined") {
            hidden = "hidden"; visibilityChange = "visibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden"; visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden"; visibilityChange = "webkitvisibilitychange";
        }

        let isTabActive = !document[hidden];

        function handleVisibilityChange(videoElement) {
            const video = $(videoElement);
            if (document[hidden]) {
                if (!video[0].paused && video.attr('data-user-started') === 'true') {
                    video[0].pause();
                    video.attr('data-paused', 'true');
                }
            } else {
                if (video.attr('data-paused') === 'true' && video.attr('data-user-started') === 'true') {
                    const entry = observer.takeRecords().find(e => e.target === videoElement);
                    if (entry && entry.isIntersecting) {
                        video[0].play();
                        video.attr('data-paused', 'false');
                    }
                }
            }
        }

        function loadVideos($video) {
            const videoElement = $video[0];
            $video.attr('id', `video-${Math.random().toString(36).substr(2, 9)}`);

            // --- WRAPPER DINÁMICO ---
            // Envolvemos el video para que el contenedor controle el ancho y el clip del radius
            const $wrapper = $video.wrap('<div class="dynamic-video-wrapper"></div>').parent();
            $wrapper.css({
                'width': settings.startWidth,
                'border-radius': settings.startRadius,
                'margin': '0 auto',
                'overflow': 'hidden',
                'position': 'relative',
                'background': '#000'
            });

            // --- ANIMACIÓN GSAP SCROLL ---
            if (typeof gsap !== "undefined") {
                gsap.to($wrapper, {
                    width: settings.endWidth,
                    borderRadius: settings.endRadius,
                    ease: "none",
                    scrollTrigger: {
                        trigger: $wrapper,
                        start: settings.gsapStart,
                        end: settings.gsapEnd,
                        scrub: true
                    }
                });
            }

            observer.observe(videoElement);
            document.addEventListener(visibilityChange, () => handleVisibilityChange(videoElement), false);
        }

        function handleIntersection(entries) {
            entries.forEach(entry => {
                const video = $(entry.target);
                if (entry.isIntersecting) {
                    if (video.attr('data-loaded') !== 'true') {
                        video.data('posters', []);
                        lazyLoadVideo(video);
                        lazyLoadPoster(video);
                        video.attr('data-loaded', 'true');
                    }
                    if (video.attr('data-paused') === 'true' && video.attr('data-user-started') === 'true') {
                        video[0].play();
                        video.attr('data-paused', 'false');
                    }
                } else {
                    if (!video[0].paused && video.attr('data-user-started') === 'true') {
                        video[0].pause();
                        video.attr('data-paused', 'true');
                    }
                }
            });
        }

        function fetchVideoSource(src) {
            return fetch(src)
                .then(response => response.blob())
                .then(blob => URL.createObjectURL(blob))
                .catch(err => {
                    console.error(`Failed to fetch video: ${err}`);
                    return '';
                });
        }

        function lazyLoadPoster(video) {
            const posterData = video.attr('data-poster');
            if (posterData) {
                let posterObject;
                try { posterObject = JSON.parse(posterData); } catch { return; }
                const posterPriorityList = Object.keys(posterObject).sort();
                loadPostersFromPriorityList(video, posterObject, posterPriorityList, 0);
            }
        }

        function loadPostersFromPriorityList(video, posterObject, posterPriorityList, index = 0) {
            if (index >= posterPriorityList.length) return;
            const posterURL = posterObject[posterPriorityList[index]];
            fetch(posterURL)
                .then(response => response.blob())
                .then(blob => {
                    const objectURL = URL.createObjectURL(blob);
                    video.data('posters').push(objectURL);
                    if (index === 0) {
                        video.attr('poster', objectURL);
                        if (isMobile) loadPostersFromPriorityList(video, posterObject, posterPriorityList, index + 1);
                    } else if (isMobile) {
                        video.attr('poster', objectURL);
                    }
                    loadPostersFromPriorityList(video, posterObject, posterPriorityList, index + 1);
                });
        }

        function lazyLoadVideo(video) {
            const sources = video.find('source');
            const overlay = createOverlay(video);
            video.prop('controls', false);
        
            const promises = sources.map((index, sourceElement) => {
                const source = $(sourceElement);
                return fetchVideoSource(source.attr('data-src')).then(url => {
                    if (url) { source.attr('src', url); return url; }
                    throw new Error();
                });
            }).get();
        
            $.when.apply($, promises).then(() => {
                video[0].load();
                setupPlayButton(overlay, video);
            });
        }

        function createOverlay(video) {
            const overlay = $('<div>', { class: 'video-overlay', text: 'Loading...' });
            video.parent().append(overlay);
            return overlay;
        }

        function setupPlayButton(overlay, video) {
            const playButtonTemplate = `
                <div class="play-button-overlay d-flex align-items-center justify-content-center">
                    <button class="play-button btn btn-danger btn-lg" aria-label="Play Button">
                        <span class="btn-iris"></span>
                    </button>
                </div>`;

            overlay.html(playButtonTemplate);
            const $wrapper = video.parent();
            const $playBtn = overlay.find('.play-button');

            // --- LÓGICA DE CURSOR MAGNÉTICO (Solo Desktop) ---
            if (!isMobile) {
                $wrapper.css('cursor', 'none').find('*').css('cursor', 'none');

                $wrapper.on('mousemove', function(e) {
                    const rect = $wrapper[0].getBoundingClientRect();
                    const relX = e.clientX - rect.left;
                    const relY = e.clientY - rect.top;

                    gsap.to($playBtn, {
                        x: relX - ($playBtn.outerWidth() / 2),
                        y: relY - ($playBtn.outerHeight() / 2),
                        duration: 0.6,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                });

                // Play al hacer click en cualquier parte del wrapper
                $wrapper.on('click', function() {
                    if ($wrapper.find('.video-overlay').length > 0) {
                        $playBtn.trigger('click');
                    }
                });
            }

            $playBtn.on('click', function(e) {
                e.stopPropagation(); // Evitar doble activación por el click del wrapper
                overlay.remove();
                video.prop('controls', true);
                video[0].play();
                video.attr('data-user-started', 'true');
            });

            video.on('ended', function() {
                const posters = video.data('posters');
                video[0].load();
                video.parent().append(overlay);
                setupPlayButton(overlay, video);
                video.prop('controls', false);
                video.attr('poster', posters[0]);
            });
        }

        return this.each(function() {
            loadVideos($(this));
        });
    };
}(jQuery));