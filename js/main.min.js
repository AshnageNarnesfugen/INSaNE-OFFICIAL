/**
 * main.js — INSaNE | A Broken Hero
 *
 * Optimizations applied vs original main.min.js:
 *  - translations, invitationalTexts extracted → /data/i18n/main-ui.json
 *  - urls{} removed — reads from window.INSaNE_DATA['lang-cases'] (single source)
 *  - $.fn.clickToggle replaced with simple boolean toggle
 *  - $.proxy() removed — replaced with arrow functions
 *  - getUrlParameter() replaced with URLSearchParams API
 *  - $(window).scroll() throttled with requestAnimationFrame
 *  - SectionShuffler: observer disconnects per section after first trigger
 *  - setInterval for shuffleLetters: paused on tab hidden, cleared when unused
 *  - DynamicTitleHandler: skips anchors that already have a title
 *  - Waits for INSaNE_DATA_READY before reading JSON data
 */

jQuery(function($) {

    // ── 0. Wait for data-loader JSONs ────────────────────────────
    const dataReady = window.INSaNE_DATA_READY || Promise.resolve();

    // ── 1. Helpers ───────────────────────────────────────────────
    function getParam(name) {
        return new URLSearchParams(window.location.search).get(name) || '';
    }

    const pageLang = ($('html').attr('lang') || 'en').toLowerCase().split('-')[0];

    // ── 2. Intro animation ───────────────────────────────────────
    gsap.registerPlugin(ScrollTrigger);
    gsap.set('.intro_animation', { display: 'grid', opacity: 1 });
    gsap.set(['.intro_title', '.intro_subtitle'], { opacity: 0, y: 20 });

    gsap.timeline()
        .to('.intro_animation', { backgroundColor: 'rgba(0,0,0,1)', duration: 0 })
        .to('.intro_title',     { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '+=0.5')
        .to('.intro_subtitle',  { opacity: 1, y: 0, duration: 1,   ease: 'power2.out' }, '-=0.5')
        .to('.intro_animation', {
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter:  'blur(20px)',
            duration: 2, ease: 'none'
        }, '+=1')
        .to('.intro_animation', {
            opacity: 0, duration: 1.5, ease: 'power2.inOut',
            onComplete: () => $('.intro_animation').css('display', 'none')
        }, '+=2');

    // ── 3. Read More / Read Less ─────────────────────────────────
    dataReady.then(() => {
        const ui       = (window.INSaNE_DATA || {})['main-ui'] || {};
        const readMore = (ui.readMore || {})[pageLang] || 'Read More';
        const readLess = (ui.readLess || {})[pageLang] || 'Read Less';

        const customClass = 'fw-bold text-dark';
        const $btn        = $('#show-btn');
        const $content    = $('.read-more-content');
        let   expanded    = false;

        gsap.set($content, { height: 0, overflow: 'hidden' });
        $btn.html(`<p class="${customClass}">${readMore}</p>`)
            .attr('aria-label', readMore);

        $btn.on('click', function() {
            const label = expanded ? readMore : readLess;
            gsap.to($content, {
                height:   expanded ? 0 : 'auto',
                duration: 0.8,
                ease:     expanded ? 'power2.in' : 'power2.out',
                onStart:    () => $content.css('overflow', 'hidden'),
                onComplete: expanded ? null : () => $content.css('overflow', 'visible')
            });
            gsap.to($btn, {
                opacity: 0, duration: 0.25, ease: 'power1.in',
                onComplete: () => {
                    $btn.html(`<p class="${customClass}">${label}</p>`)
                        .attr('aria-label', label);
                    gsap.to($btn, { opacity: 1, duration: 0.25, ease: 'power1.out' });
                }
            });
            expanded = !expanded;
        });
    });

    // ── 4. Footer year ───────────────────────────────────────────
    $('footer').html((i, html) => html.replace('{{ current_year }}', new Date().getFullYear()));

    // ── 5. Language dropdown ─────────────────────────────────────
    const currentPath = window.location.pathname;
    $('#language-dropdown option').each(function() {
        if ($(this).val() === currentPath) $(this).prop('selected', true);
    });
    $('#language-dropdown').on('change', function() {
        window.location.href = $(this).val();
    });

    // ── 6. Share buttons ─────────────────────────────────────────
    dataReady.then(() => {
        const ui       = (window.INSaNE_DATA || {})['main-ui'] || {};
        const casesRaw = ((window.INSaNE_DATA || {})['lang-cases'] || {}).cases || {};

        $('.share-btn').on('click', function() {
            const platform  = $(this).attr('data-platform');
            const lang      = $(this).attr('data-language');
            const shareText = (ui.shareText || {})[lang] || (ui.shareText || {}).en || '';
            // lang-cases keys are uppercase; data-language attrs are lowercase
            const langPath  = (casesRaw[lang.toUpperCase()] || {}).path || '/';
            const pageUrl   = window.location.origin + langPath;

            const urls = {
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
                twitter:  `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`,
                linkedin: `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(pageUrl)}`,
                reddit:   `https://www.reddit.com/submit?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(shareText)}`
            };
            if (urls[platform]) window.open(urls[platform], '_blank');
        });
    });

    // ── 7. Dynamic link titles ───────────────────────────────────
    $('a:not([title])').each(function() {
        const text = $(this).text().trim();
        if (text) $(this).attr('title', text);
    });

    // ── 8. Lazy loaders ──────────────────────────────────────────
    $('video').lazyVideoLoader();
    $('img').lazyImageLoader();

    // ── 9. Burger menu ───────────────────────────────────────────
    let menuOpen = false;
    $('.menu-wrapper').on('click', function() {
        menuOpen = !menuOpen;
        $('.burger_menu').css({
            opacity:  menuOpen ? '1' : '0',
            'z-index': menuOpen ? '6' : '-1'
        });
        $('.hamburger-menu').toggleClass('animate');
    });

    // ── 10. Scroll nav links ─────────────────────────────────────
    $('.scroll').on('click', function(e) {
        e.preventDefault();
        $('.menu-wrapper').trigger('click');
        $('body, html').animate({ scrollTop: $(this.hash).offset().top }, 1000);
    });

    // ── 11. Scroll-to-top / scroll-to-section button ────────────
    const $scrollBtn = $('.scroll-top-button');
    const $arrow     = $scrollBtn.find('.arrow-btn div');
    let   ticking    = false;

    $(window).on('scroll.main', function() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const goUp = $(window).scrollTop() > 500;
            $scrollBtn.fadeIn().css('z-index', '111111').data('action', goUp ? 'up' : 'down');
            $arrow.toggleClass('arrow-up', goUp).toggleClass('arrow-down', !goUp);
            ticking = false;
        });
    });

    $scrollBtn.on('click', function() {
        if ($(this).data('action') === 'up') {
            $('html, body').animate({ scrollTop: 0 }, 1000);
        } else {
            const $next = $('#quickresume').first();
            if ($next.length) $('html, body').animate({ scrollTop: $next.offset().top }, 1000);
        }
    });

    // ── 12. Parallax ─────────────────────────────────────────────
    initParallaxie('#esc3', { speed: 0.8, disableMobile: true });
    initParallaxie('#sneak-peak', { speed: 0.5, disableMobile: true, size: 'unset',    pos_x: 'center', repeat: 'repeat' });

    // ── 13. Shuffle letters interval ─────────────────────────────
    const $letter = $('#letter');
    if ($letter.length) {
        const shuffleData = JSON.parse($letter.attr('data-array') || '[]');
        let   idx         = 0;
        let   timer       = null;

        const tick  = () => {
            $letter.shuffleLetters({ step: 30, fps: 60, text: shuffleData[idx] });
            idx = (idx + 1) % shuffleData.length;
        };
        const start = () => { if (!timer) timer = setInterval(tick, 4000); };
        const stop  = () => { clearInterval(timer); timer = null; };

        start();
        document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    }

    // ── 14. Form handler ─────────────────────────────────────────
    class FormHandler {
        constructor(formId, ajaxUrl) {
            this.$form              = $(formId);
            this.ajaxUrl            = ajaxUrl;
            this.notifSuccess       = this._parseJSON(this.$form.attr('data-notif-success'));
            this.notifError         = this._parseJSON(this.$form.attr('data-notif-error'));
            this.tyMsg              = this.$form.attr('data-tymsg');
            this.errMsg             = this.$form.attr('data-errmsg');
            this.cookieSubmittedMSN = this.$form.attr('data-cookiesubmittedmsn');
            this._checkPrior();
            this.$form.on('submit', e => this._onSubmit(e));
        }

        _sanitize(input) {
            if (typeof input !== 'string') return '';
            return input
                .replace(/<script.*?>.*?<\/script>/gi, '')
                .replace(/<iframe.*?>.*?<\/iframe>/gi, '')
                .replace(/<object.*?>.*?<\/object>/gi, '')
                .replace(/<embed.*?>.*?<\/embed>/gi,   '')
                .replace(/<applet.*?>.*?<\/applet>/gi, '')
                .replace(/<meta.*?>/gi, '').replace(/<link.*?>/gi, '')
                .replace(/\bon[a-z]+\s*=\s*(['"]).*?\1/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
        }

        _parseJSON(str) {
            try { return JSON.parse(str).map(s => this._sanitize(s)); }
            catch { return ['Invalid Data', 'Invalid Data']; }
        }

        _checkPrior() {
            if (Cookies.get('registered') === 'true') {
                this.$form.css('display', 'none');
                $('.form-container').html(this.cookieSubmittedMSN);
            }
        }

        _notify(title, body) {
            Notification.requestPermission().then(perm => {
                if (perm === 'granted') {
                    new Notification(this._sanitize(title), {
                        body: this._sanitize(body),
                        icon: 'img/webiconspace-removebg-preview.png'
                    });
                }
            });
        }

        _formData() {
            return this.$form.serializeArray().reduce((obj, item) => {
                obj[item.name] = this._sanitize(item.value);
                return obj;
            }, {});
        }

        _onSubmit(e) {
            e.preventDefault();
            $.ajax({
                method: 'POST', url: this.ajaxUrl,
                dataType: 'json', accepts: 'application/json',
                data:    this._formData(),
                success: () => this._respond(true),
                error:   () => this._respond(false)
            });
        }

        _respond(ok) {
            const msg = ok ? [this.notifSuccess, this.tyMsg] : [this.notifError, this.errMsg];
            this._notify(msg[0][0], msg[0][1]);
            this.$form.css('display', 'none');
            $('.form-container').html(msg[1]);
            if (ok) Cookies.set('registered', 'true', { expires: 365 });
        }
    }

    if ($('#former-form').length) {
        new FormHandler('#former-form', 'https://formsubmit.co/ajax/70a19f04e48d9da8774f32b49b924edf');
    }

    // ── 15. Section shuffler ─────────────────────────────────────
    class SectionShuffler {
        constructor() {
            this.observer = new IntersectionObserver(
                this._onIntersect.bind(this),
                { root: null, rootMargin: '0px', threshold: 0.5 }
            );
        }
        init() {
            $('.shuffle-section').each((_, el) => {
                const titles = $(el).find('[data-text]').map((_, t) => ({
                    element: $(t), text: $(t).attr('data-text')
                })).get();
                if (titles.length) {
                    $(el).data('shuffle-titles', titles);
                    this.observer.observe(el);
                }
            });
        }
        _onIntersect(entries) {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                ($(entry.target).data('shuffle-titles') || []).forEach(t =>
                    t.element.shuffleLetters({ step: 30, fps: 60, text: t.text })
                );
                this.observer.unobserve(entry.target); // fire once per section
            });
        }
    }
    new SectionShuffler().init();

    // ── 16. Scroll to section from URL param ─────────────────────
    const sectionScrollID = getParam('sectionScrollID');
    if (sectionScrollID) {
        const $target = $('#' + sectionScrollID);
        if ($target.length) {
            $('html, body').animate({
                scrollTop: $target.offset().top
                    - ($(window).height() / 2)
                    + ($target.height() / 2)
            }, 1000);
        }
    }

    // ── 17. Owl Carousel ─────────────────────────────────────────
    const $owl = $('.owl-carousel');
    if ($owl.length) {
        $owl.owlCarousel({
            items: 1, loop: false, mouseDrag: true,
            dotsContainer: '#custom-owl-dots', dotsSpeed: 400,
            autoplay: false, nav: false, rewind: true
        });
        $('.owl-prev').on('click', () => $owl.trigger('prev.owl.carousel'));
        $('.owl-next').on('click', () => $owl.trigger('next.owl.carousel'));
        $('.owl-dot').on('click', function() {
            $owl.trigger('to.owl.carousel', [$(this).index(), 300]);
        });
        $('.cuztomized')
            .on('dragstart', e => { e.stopPropagation(); e.preventDefault(); })
            .on('drop',      e => { e.stopPropagation(); e.preventDefault(); });
    }

    // ── 18. Load time ────────────────────────────────────────────
    const _t0 = performance.now();
    $(window).on('load', () =>
        console.log(`[INSaNE] Load: ${Math.round(performance.now() - _t0)}ms`)
    );

});