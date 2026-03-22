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
 *              per page load, shared via a single in-flight Promise.
 *
 * NOTE: We intentionally do NOT use sessionStorage for caching.
 * sessionStorage persists across page reloads within the same tab, which
 * causes stale country data when users switch VPNs or travel between
 * countries mid-session. One fresh call per page load is correct — it's
 * a single lightweight JSON request that resolves in ~200ms.
 *
 * window.__geoip_data lets any script access the result synchronously
 * after the first call resolves within the current page load.
 *
 * Usage (from any script loaded after this one):
 *
 *   window.fetchGeoIP().then(data => {
 *       console.log(data.country_code); // 'MX', 'DE', 'JP', etc.
 *   });
 *
 * On failure returns: { country_code: null, country: null, _error: true }
 */

(function() {
    'use strict';

    const CALLBACK_NAME = '__ipapi_cb_' + Math.random().toString(36).slice(2, 7);
    const IPAPI_URL     = `https://ipapi.co/json/?callback=${CALLBACK_NAME}`;
    const TIMEOUT_MS    = 6000;

    // In-flight promise — shared across all callers within one page load.
    // If fetchGeoIP() is called 5 times before the network response arrives,
    // all 5 get the same Promise and only one JSONP request is made.
    let _promise = null;

    window.fetchGeoIP = function() {
        // Return resolved in-memory result if already done this page load
        if (window.__geoip_data) {
            return Promise.resolve(window.__geoip_data);
        }

        // Return existing in-flight promise — no duplicate requests
        if (_promise) return _promise;

        // Make the JSONP call — bypasses CORS entirely
        _promise = new Promise((resolve) => {
            const fallback = { country_code: null, country: null, _error: true };

            const timer = setTimeout(() => {
                cleanup();
                console.warn('[GeoIP] Request timed out — defaulting to safe fallback.');
                resolve(fallback);
            }, TIMEOUT_MS);

            function cleanup() {
                clearTimeout(timer);
                delete window[CALLBACK_NAME];
                const el = document.getElementById('__ipapi_script');
                if (el) el.remove();
            }

            window[CALLBACK_NAME] = function(data) {
                cleanup();
                window.__geoip_data = data;
                resolve(data);
            };

            const script = document.createElement('script');
            script.id    = '__ipapi_script';
            script.src   = IPAPI_URL;
            script.onerror = function() {
                cleanup();
                console.warn('[GeoIP] Request failed (429 or network) — defaulting to safe fallback.');
                resolve(fallback);
            };
            document.head.appendChild(script);
        });

        return _promise;
    };

})();