/**
 * data-loader.js — INSaNE | A Broken Hero
 *
 * Loads all JSON data files in parallel via Promise.all before
 * any other script needs them. Results are stored in window.INSaNE_DATA
 * so every JS file can read data synchronously without async refactors.
 *
 * Load order in HTML footer (must be FIRST deferred script):
 *   <script src="js/data-loader.js" defer></script>
 *   <script src="js/cookie.js" defer></script>
 *   ... rest of scripts
 *
 * Usage in any script:
 *   const t = window.INSaNE_DATA['privacy-policy'][lang] || {};
 *   const cases = window.INSaNE_DATA['lang-cases'];
 *
 * Files loaded (added here as new JSONs are extracted):
 *   /data/i18n/privacy-policy.json   ← cookie table, footer strings, policy text
 *   (more will be added as other JS files are migrated)
 */

(function () {
    'use strict';

    // All JSON files to fetch in parallel.
    // Key = how it's accessed via window.INSaNE_DATA[key]
    const MANIFEST = [
        { key: 'privacy-policy', url: '/data/i18n/privacy-policy.json' },
        { key: 'accessibility',  url: '/data/i18n/accessibility.json'  },
        { key: 'cookie-banner',  url: '/data/i18n/cookie-banner.json'  },
        { key: 'gdpr-panel',     url: '/data/i18n/gdpr-panel.json'     },
        { key: 'lang-cases',     url: '/data/config/lang-cases.json'   },
        { key: 'fonts',          url: '/data/config/fonts.json'        },
        { key: 'char-pools',     url: '/data/config/char-pools.json'   },
        { key: 'path-messages',  url: '/data/config/path-messages.json'},
    ];

    // Initialize the global namespace immediately — scripts that run before
    // the fetches resolve will get empty objects and fall back gracefully
    window.INSaNE_DATA = {};

    // Track load state so other scripts can optionally wait
    // window.INSaNE_DATA_READY is a Promise that resolves when all JSONs are loaded
    window.INSaNE_DATA_READY = Promise.all(
        MANIFEST.map(({ key, url }) =>
            fetch(url)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
                    return res.json();
                })
                .then(data => {
                    window.INSaNE_DATA[key] = data;
                })
                .catch(err => {
                    // Non-fatal — script will use hardcoded fallbacks
                    console.warn(`[DataLoader] Could not load ${url}:`, err.message);
                    window.INSaNE_DATA[key] = {};
                })
        )
    ).then(() => {
        console.log('[DataLoader] All data files loaded.');
    });

}());