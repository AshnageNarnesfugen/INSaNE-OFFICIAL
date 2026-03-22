/**
 * geoip.js — INSaNE | A Broken Hero
 *
 * Shared, cached geo-IP lookup via ipapi.co.
 *
 * Problems solved:
 *   1. CORS — $.getJSON uses XHR which browsers block on ipapi.co.
 *              We use JSONP (script tag injection) which ipapi.co supports
 *              and is never blocked by CORS policy.
 *   2. 429 Too Many Requests — multiple JS files were each calling ipapi.co
 *              independently on every page load. Now there is exactly ONE call
 *              per browser session, cached in sessionStorage.
 *   3. Global cache — window.__geoip_data lets any script access the result
 *              synchronously after the first call resolves.
 *
 * Usage (from any script loaded after this one):
 *
 *   window.fetchGeoIP().then(data => {
 *       console.log(data.country_code); // 'MX', 'DE', 'JP', etc.
 *   });
 *
 *   // Or with async/await:
 *   const data = await window.fetchGeoIP();
 *
 * On failure returns: { country_code: null, country: null, _error: true }
 * Callers should treat null country_code as "unknown" and apply safe defaults.
 */

(function() {
    'use strict';

    const CACHE_KEY     = 'insane_geoip';
    const CALLBACK_NAME = '__ipapi_cb_' + Math.random().toString(36).slice(2, 7);
    const IPAPI_URL     = `https://ipapi.co/json/?callback=${CALLBACK_NAME}`;
    const TIMEOUT_MS    = 6000;

    // In-flight promise — prevents duplicate calls if fetchGeoIP() is
    // called multiple times before the first one resolves
    let _promise = null;

    /**
     * Returns a Promise that resolves with the geo-IP data object.
     * Caches result in sessionStorage for the lifetime of the browser tab.
     */
    window.fetchGeoIP = function() {
        // 1. Return in-memory cache if already resolved this session
        if (window.__geoip_data) {
            return Promise.resolve(window.__geoip_data);
        }

        // 2. Return sessionStorage cache (survives JS re-execution on same tab)
        try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                window.__geoip_data = parsed;
                return Promise.resolve(parsed);
            }
        } catch (_) { /* sessionStorage unavailable — continue */ }

        // 3. Return existing in-flight promise (prevents duplicate XHR/JSONP)
        if (_promise) return _promise;

        // 4. Make the JSONP call — bypasses CORS entirely
        _promise = new Promise((resolve) => {
            const fallback = { country_code: null, country: null, _error: true };

            // Timeout — if ipapi.co doesn't respond, default to safe fallback
            const timer = setTimeout(() => {
                cleanup();
                console.warn('[GeoIP] Request timed out — using fallback.');
                cache(fallback);
                resolve(fallback);
            }, TIMEOUT_MS);

            // Cleanup: remove script tag + global callback
            function cleanup() {
                clearTimeout(timer);
                delete window[CALLBACK_NAME];
                const el = document.getElementById('__ipapi_script');
                if (el) el.remove();
            }

            // JSONP callback — called by ipapi.co response
            window[CALLBACK_NAME] = function(data) {
                cleanup();
                window.__geoip_data = data;
                cache(data);
                resolve(data);
            };

            // Inject script tag — CORS-free
            const script = document.createElement('script');
            script.id  = '__ipapi_script';
            script.src = IPAPI_URL;
            script.onerror = function() {
                cleanup();
                console.warn('[GeoIP] Script load failed (429 or network error) — using fallback.');
                cache(fallback);
                resolve(fallback);
            };
            document.head.appendChild(script);
        });

        return _promise;
    };

    function cache(data) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (_) { /* quota exceeded or private mode — silently skip */ }
    }

})();