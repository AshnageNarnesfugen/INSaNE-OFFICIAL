/**
 * privacy-policy.js — INSaNE | A Broken Hero
 *
 * Region-aware Privacy Policy modal.
 * - Detects user country via ipapi.co (same call already cached)
 * - Shows policy adapted to local law
 * - Modal opens over current page (no reload)
 * - URL changes to /#privacy-policy via replaceState (hash — no server request)
 * - Back button / Escape closes the modal and restores the URL
 * - Links in cookie banners / GDPR panel trigger this modal
 * - GSAP animated open/close
 *
 * Legal frameworks covered:
 *   EU/EEA  → GDPR (Regulation 2016/679)
 *   GB      → UK GDPR + Data Protection Act 2018
 *   CH      → nFADP (new Federal Act on Data Protection, 2023)
 *   BR      → LGPD (Lei 13.709/2018)
 *   US      → CCPA/CPRA notice (California-first, applied broadly)
 *   CA      → PIPEDA + Quebec Law 25
 *   AU      → Privacy Act 1988 (amended 2022)
 *   DEFAULT → General reasonable policy (OECD principles)
 *
 * Data actually collected by insane-bh.space:
 *   - Cookies: language, country, has_been_redirected,
 *              insane_gdpr_consent / my_cookie_consent
 *   - GTM / Google Analytics: anonymous usage stats, only if analytics consent given
 *                             IPs anonymized before storage
 *   - IP address via ipapi.co: temporary, not stored by us, not linked to identity
 *   - No contact form, no user accounts, no payment data, no sensitive data
 */

(function() {
    'use strict';

    // ── Site metadata (update if branding changes) ──────────────
    const SITE = {
        name:      'INSaNE | A Broken Hero',
        url:       'https://insane-bh.space',
        author:    'Alexis C.',
        contact:   'insane-bh.space',           // contact via on-site form (GTM/Analytics only)
        effective: '2025-01-01',
        updated:   '2025-03-21',
    };

    // All localized privacy policy paths — one per language in redirection.js
    const POLICY_PATHS = new Set([
        '/privacy-policy',               // EN
        '/politica-de-privacidad',       // ES
        '/puraibashi-porishi',           // JP
        '/politica-de-privacidade',      // PT
        '/politique-de-confidentialite', // FR
        '/datenschutz-bestimmungen',     // DE
        '/politica-sulla-privacy',       // IT
        '/politika-konfidentsialnosti',  // RU
        '/yinsi-zhengce',                // ZH
        '/gaeinjeongbocheolibangchim',   // KR
        '/siasatu-alkhususia',           // AR
        '/gopaneeyata-neeti',            // HI
        '/nayobai-khwam-s-wan-tua',      // TH
        '/dasar-privasi',                // MS
        '/kebijakan-privasi',            // ID
        '/patakaran-sa-privacy',         // TL
        '/chinh-sach-bao-mat',           // VI
    ]);

    // Region is determined by html[lang] + navigator.language — no IP needed.
    // See getRegionByLang() below.

    // Region detection by html[lang] + navigator.language — no IP call.
    // Maps page language to the most relevant legal framework.
    // Shows the correct policy without any network request.
    function getRegionByLang() {
        const lang = getLang(); // already normalized (jp→ja, kr→ko)

        // EU/EEA languages → GDPR
        const EU_LANGS = new Set([
            'de','fr','nl','it','es','pt','pl','cs','sk','hu','ro',
            'bg','hr','sl','lt','lv','et','fi','sv','da','el','mt',
            'ga','is','nb','nn','ca','eu','gl',
        ]);
        if (EU_LANGS.has(lang)) return 'eu';

        // UK-specific — check html[lang] for en-GB
        const htmlLang = (document.documentElement.lang || '').toLowerCase();
        const navLang  = (navigator.language || '').toLowerCase();
        if (htmlLang.startsWith('en-gb') || htmlLang.startsWith('en-ie') ||
            navLang.startsWith('en-gb')  || navLang.startsWith('en-ie')) {
            return 'gb';
        }

        // Language-to-region hints (best effort without IP)
        const LANG_REGION = {
            pt: 'br',   // Portuguese pages most likely Brazil in practice
                        // (PT users get 'eu' via EU_LANGS above)
            zh: 'default',
            ja: 'default',
            ko: 'default',
            ar: 'default',
            hi: 'default',
            th: 'default',
            ms: 'default',
            id: 'default',
            tl: 'default',
            vi: 'default',
            ru: 'default',
        };

        return LANG_REGION[lang] || 'default';
    }

    // ── Cookie table (same for all regions, descriptions vary) ──
    function cookieTable(lang) {
        const h = getCookieTableHeaders(lang);
        return `
        <div class="pp-table-wrap">
            <table class="pp-table">
                <thead>
                    <tr>
                        <th>${h.name}</th>
                        <th>${h.purpose}</th>
                        <th>${h.duration}</th>
                        <th>${h.type}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>language</code></td>
                        <td>${h.langPurpose}</td>
                        <td>365 ${h.days}</td>
                        <td>${h.functional}</td>
                    </tr>
                    <tr>
                        <td><code>country</code></td>
                        <td>${h.countryPurpose}</td>
                        <td>365 ${h.days}</td>
                        <td>${h.functional}</td>
                    </tr>
                    <tr>
                        <td><code>has_been_redirected</code></td>
                        <td>${h.redirectPurpose}</td>
                        <td>7 ${h.days}</td>
                        <td>${h.necessary}</td>
                    </tr>
                    <tr>
                        <td><code>insane_gdpr_consent</code></td>
                        <td>${h.gdprPurpose}</td>
                        <td>365 ${h.days}</td>
                        <td>${h.necessary}</td>
                    </tr>
                    <tr>
                        <td><code>my_cookie_consent</code></td>
                        <td>${h.simplePurpose}</td>
                        <td>365 ${h.days}</td>
                        <td>${h.necessary}</td>
                    </tr>
                    <tr>
                        <td>_ga, _gid, _gat</td>
                        <td>${h.gaPurpose}</td>
                        <td>2 ${h.years} / 24h / 1 ${h.min}</td>
                        <td>${h.analytics}</td>
                    </tr>
                </tbody>
            </table>
        </div>`;
    }

    // Cookie table headers — loaded from /data/i18n/privacy-policy.json
    // Falls back to English inline if JSON not yet loaded
    function getCookieTableHeaders(lang) {
        const data = (window.INSaNE_DATA || {})['privacy-policy'] || {};
        const table = data.cookieTable || {};
        return table[lang] || table['en'] || {
            name:'Cookie', purpose:'Purpose', duration:'Duration', type:'Category',
            langPurpose:'Stores your preferred language',
            countryPurpose:'Stores your detected country',
            redirectPurpose:'Prevents repeated language redirects for 7 days',
            gdprPurpose:'Stores your granular cookie consent choices (EU/EEA)',
            simplePurpose:'Stores your accept/reject cookie decision (non-EU)',
            gaPurpose:'Google Analytics — anonymous usage statistics',
            days:'days', years:'years', min:'min',
            functional:'Functional', necessary:'Necessary', analytics:'Analytics'
        };
    }

    // ═══════════════════════════════════════════════════════════
    //  POLICY CONTENT — per region
    // ═══════════════════════════════════════════════════════════

    function buildPolicy(region, lang) {
        const L = lang || 'en';
        const policies = {
            eu:      policyEU(L),
            gb:      policyGB(L),
            ch:      policyCH(L),
            br:      policyBR(L),
            us:      policyUS(L),
            ca:      policyCA(L),
            au:      policyAU(L),
            default: policyDefault(L),
        };
        return policies[region] || policies.default;
    }

    // ── EU / EEA — GDPR ─────────────────────────────────────────
    function policyEU(lang) {
        const t = {
            en: {
                title: 'Privacy Policy (GDPR — EU/EEA)',
                law: 'This policy complies with <strong>Regulation (EU) 2016/679 (GDPR)</strong> and applies to visitors from the European Union and European Economic Area.',
                rights_title: 'Your Rights Under GDPR',
                rights: [
                    '<strong>Right of Access (Art. 15)</strong> — You may request a copy of the personal data we hold about you.',
                    '<strong>Right to Rectification (Art. 16)</strong> — You may ask us to correct inaccurate data.',
                    '<strong>Right to Erasure (Art. 17)</strong> — You may ask us to delete your data ("right to be forgotten").',
                    '<strong>Right to Restriction (Art. 18)</strong> — You may ask us to limit how we use your data.',
                    '<strong>Right to Data Portability (Art. 20)</strong> — You may request your data in a machine-readable format.',
                    '<strong>Right to Object (Art. 21)</strong> — You may object to processing based on legitimate interests.',
                    '<strong>Right to withdraw consent</strong> — At any time, without affecting prior processing.',
                    '<strong>Right to lodge a complaint</strong> — With your national supervisory authority (e.g., CNIL in France, BfDI in Germany, AEPD in Spain).',
                ],
                legal_basis_title: 'Legal Basis for Processing',
                legal_basis: 'We process data on the following legal bases: <strong>Consent</strong> (Art. 6(1)(a)) for analytics and functional cookies; <strong>Legitimate Interests</strong> (Art. 6(1)(f)) for language detection and routing to improve user experience.',
                transfers: 'Data Transfers',
                transfers_text: 'Your IP address is temporarily processed by <a href="https://ipapi.co/privacy/" target="_blank" rel="noopener">ipapi.co</a> (located in the US) to detect your country. This constitutes a transfer under Art. 44 GDPR. ipapi.co relies on Standard Contractual Clauses (SCCs). If you enable analytics cookies, anonymous usage data is processed by Google LLC (US) under the EU–US Data Privacy Framework.',
                retention: 'Data Retention',
                retention_text: 'Consent cookies are retained for 365 days. Analytics data is retained by Google for up to 26 months (IP anonymized). We do not retain any personal data on our own servers.',
                dpo: 'Data Controller',
                dpo_text: `The data controller is <strong>${SITE.author}</strong>, reachable via the site at <a href="${SITE.url}" target="_blank" rel="noopener">${SITE.url}</a>. As a personal/hobby website below the threshold requiring a formal DPO appointment, no DPO has been designated.`,
            },
            es: {
                title: 'Política de Privacidad (RGPD — UE/EEE)',
                law: 'Esta política cumple con el <strong>Reglamento (UE) 2016/679 (RGPD)</strong> y aplica a visitantes de la Unión Europea y el Espacio Económico Europeo.',
                rights_title: 'Tus Derechos bajo el RGPD',
                rights: [
                    '<strong>Derecho de acceso (Art. 15)</strong> — Puedes solicitar una copia de los datos personales que tenemos sobre ti.',
                    '<strong>Derecho de rectificación (Art. 16)</strong> — Puedes pedirnos que corrijamos datos inexactos.',
                    '<strong>Derecho de supresión (Art. 17)</strong> — Puedes pedirnos que eliminemos tus datos ("derecho al olvido").',
                    '<strong>Derecho a la limitación (Art. 18)</strong> — Puedes pedirnos que limitemos el uso de tus datos.',
                    '<strong>Derecho a la portabilidad (Art. 20)</strong> — Puedes solicitar tus datos en formato legible por máquina.',
                    '<strong>Derecho de oposición (Art. 21)</strong> — Puedes oponerte al tratamiento basado en intereses legítimos.',
                    '<strong>Derecho a retirar el consentimiento</strong> — En cualquier momento, sin afectar el tratamiento previo.',
                    '<strong>Derecho a presentar una reclamación</strong> — Ante tu autoridad supervisora nacional (p.ej., AEPD en España, CNIL en Francia).',
                ],
                legal_basis_title: 'Base Legal del Tratamiento',
                legal_basis: 'Tratamos los datos bajo las siguientes bases legales: <strong>Consentimiento</strong> (Art. 6(1)(a)) para cookies analíticas y funcionales; <strong>Intereses legítimos</strong> (Art. 6(1)(f)) para la detección de idioma y redirección.',
                transfers: 'Transferencias de Datos',
                transfers_text: 'Tu dirección IP es procesada temporalmente por <a href="https://ipapi.co/privacy/" target="_blank" rel="noopener">ipapi.co</a> (ubicado en EE.UU.) para detectar tu país. Esto constituye una transferencia según el Art. 44 del RGPD. ipapi.co se basa en Cláusulas Contractuales Estándar. Si activas las cookies analíticas, Google LLC (EE.UU.) procesa datos de uso anónimos bajo el Marco de Privacidad de Datos UE-EE.UU.',
                retention: 'Retención de Datos',
                retention_text: 'Las cookies de consentimiento se conservan 365 días. Los datos de Analytics los conserva Google hasta 26 meses. No conservamos datos personales en nuestros propios servidores.',
                dpo: 'Responsable del Tratamiento',
                dpo_text: `El responsable del tratamiento es <strong>${SITE.author}</strong>, contactable a través del formulario en <a href="${SITE.url}" target="_blank" rel="noopener">${SITE.url}</a>.`,
            },
            fr: {
                title: 'Politique de Confidentialité (RGPD — UE/EEE)',
                law: 'Cette politique est conforme au <strong>Règlement (UE) 2016/679 (RGPD)</strong> et s\'applique aux visiteurs de l\'Union européenne et de l\'Espace économique européen.',
                rights_title: 'Vos Droits sous le RGPD',
                rights: [
                    '<strong>Droit d\'accès (Art. 15)</strong> — Vous pouvez demander une copie de vos données personnelles.',
                    '<strong>Droit de rectification (Art. 16)</strong> — Vous pouvez nous demander de corriger des données inexactes.',
                    '<strong>Droit à l\'effacement (Art. 17)</strong> — Vous pouvez nous demander de supprimer vos données ("droit à l\'oubli").',
                    '<strong>Droit à la limitation (Art. 18)</strong> — Vous pouvez nous demander de limiter l\'utilisation de vos données.',
                    '<strong>Droit à la portabilité (Art. 20)</strong> — Vous pouvez demander vos données dans un format lisible par machine.',
                    '<strong>Droit d\'opposition (Art. 21)</strong> — Vous pouvez vous opposer au traitement fondé sur des intérêts légitimes.',
                    '<strong>Droit de retirer le consentement</strong> — À tout moment, sans affecter le traitement antérieur.',
                    '<strong>Droit de déposer une plainte</strong> — Auprès de votre autorité nationale (CNIL en France, BfDI en Allemagne).',
                ],
                legal_basis_title: 'Base légale du traitement',
                legal_basis: 'Nous traitons les données sur les bases légales suivantes : <strong>Consentement</strong> (Art. 6(1)(a)) pour les cookies analytiques et fonctionnels ; <strong>Intérêts légitimes</strong> (Art. 6(1)(f)) pour la détection de la langue.',
                transfers: 'Transferts de données',
                transfers_text: 'Votre adresse IP est temporairement traitée par <a href="https://ipapi.co/privacy/" target="_blank" rel="noopener">ipapi.co</a> (basé aux États-Unis) pour détecter votre pays. Cela constitue un transfert au sens de l\'Art. 44 du RGPD. ipapi.co s\'appuie sur les Clauses Contractuelles Types.',
                retention: 'Conservation des données',
                retention_text: 'Les cookies de consentement sont conservés 365 jours. Les données Analytics sont conservées par Google jusqu\'à 26 mois. Nous ne conservons aucune donnée personnelle sur nos propres serveurs.',
                dpo: 'Responsable du traitement',
                dpo_text: `Le responsable du traitement est <strong>${SITE.author}</strong>, joignable via le formulaire de contact sur <a href="${SITE.url}" target="_blank" rel="noopener">${SITE.url}</a>.`,
            },
            de: {
                title: 'Datenschutzerklärung (DSGVO — EU/EWR)',
                law: 'Diese Erklärung entspricht der <strong>Verordnung (EU) 2016/679 (DSGVO)</strong> und gilt für Besucher aus der Europäischen Union und dem Europäischen Wirtschaftsraum.',
                rights_title: 'Ihre Rechte unter der DSGVO',
                rights: [
                    '<strong>Auskunftsrecht (Art. 15)</strong> — Sie können eine Kopie Ihrer gespeicherten Daten anfordern.',
                    '<strong>Recht auf Berichtigung (Art. 16)</strong> — Sie können uns bitten, unrichtige Daten zu korrigieren.',
                    '<strong>Recht auf Löschung (Art. 17)</strong> — Sie können uns bitten, Ihre Daten zu löschen ("Recht auf Vergessenwerden").',
                    '<strong>Recht auf Einschränkung (Art. 18)</strong> — Sie können uns bitten, die Nutzung Ihrer Daten einzuschränken.',
                    '<strong>Recht auf Datenübertragbarkeit (Art. 20)</strong> — Sie können Ihre Daten in maschinenlesbarem Format anfordern.',
                    '<strong>Widerspruchsrecht (Art. 21)</strong> — Sie können der Verarbeitung auf Basis berechtigter Interessen widersprechen.',
                    '<strong>Recht auf Widerruf</strong> — Sie können Ihre Einwilligung jederzeit widerrufen.',
                    '<strong>Beschwerderecht</strong> — Bei Ihrer nationalen Aufsichtsbehörde (z.B. BfDI in Deutschland, DSB in Österreich).',
                ],
                legal_basis_title: 'Rechtsgrundlage der Verarbeitung',
                legal_basis: 'Wir verarbeiten Daten auf folgenden Rechtsgrundlagen: <strong>Einwilligung</strong> (Art. 6(1)(a)) für Analyse- und funktionale Cookies; <strong>Berechtigte Interessen</strong> (Art. 6(1)(f)) für Spracherkennung und -weiterleitung.',
                transfers: 'Datenübertragungen',
                transfers_text: 'Ihre IP-Adresse wird vorübergehend von <a href="https://ipapi.co/privacy/" target="_blank" rel="noopener">ipapi.co</a> (in den USA) verarbeitet, um Ihr Land zu erkennen. Dies stellt eine Übertragung gemäß Art. 44 DSGVO dar. ipapi.co stützt sich auf Standardvertragsklauseln. Bei aktivierten Analyse-Cookies verarbeitet Google LLC (USA) anonyme Nutzungsdaten im Rahmen des EU–US Data Privacy Framework.',
                retention: 'Datenspeicherung',
                retention_text: 'Einwilligungs-Cookies werden 365 Tage gespeichert. Analytics-Daten werden von Google bis zu 26 Monate aufbewahrt. Wir speichern keine personenbezogenen Daten auf unseren eigenen Servern.',
                dpo: 'Verantwortlicher',
                dpo_text: `Verantwortlicher ist <strong>${SITE.author}</strong>, erreichbar über das Kontaktformular auf <a href="${SITE.url}" target="_blank" rel="noopener">${SITE.url}</a>.`,
            },
        };
        const p = t[lang] || t['en'];
        return `
            <h2>${p.title}</h2>
            <div class="pp-law-badge">${p.law}</div>
            <h3>${p.rights_title}</h3>
            <ul>${p.rights.map(r => `<li>${r}</li>`).join('')}</ul>
            <h3>${p.legal_basis_title}</h3>
            <p>${p.legal_basis}</p>
            <h3>${p.transfers}</h3>
            <p>${p.transfers_text}</p>
            <h3>${p.retention}</h3>
            <p>${p.retention_text}</p>
            <h3>${p.dpo}</h3>
            <p>${p.dpo_text}</p>
            ${cookieTable(lang)}
        `;
    }

    // ── GB — UK GDPR ─────────────────────────────────────────────
    function policyGB(lang) {
        return `
            <h2>Privacy Policy (UK GDPR)</h2>
            <div class="pp-law-badge">This policy complies with the <strong>UK GDPR</strong> and the <strong>Data Protection Act 2018</strong>, as retained in UK law following the UK's exit from the European Union.</div>
            <h3>Your Rights Under UK GDPR</h3>
            <ul>
                <li><strong>Right of access</strong> — Request a copy of your personal data (Subject Access Request).</li>
                <li><strong>Right to rectification</strong> — Ask us to correct inaccurate data.</li>
                <li><strong>Right to erasure</strong> — Ask us to delete your data.</li>
                <li><strong>Right to restrict processing</strong> — Ask us to limit how we use your data.</li>
                <li><strong>Right to data portability</strong> — Request your data in machine-readable format.</li>
                <li><strong>Right to object</strong> — Object to processing based on legitimate interests.</li>
                <li><strong>Right to lodge a complaint</strong> — With the <strong>Information Commissioner's Office (ICO)</strong> at <a href="https://ico.org.uk" target="_blank" rel="noopener">ico.org.uk</a>.</li>
            </ul>
            <h3>Legal Basis</h3>
            <p><strong>Consent</strong> (UK GDPR Art. 6(1)(a)) for analytics and functional cookies. <strong>Legitimate Interests</strong> (Art. 6(1)(f)) for language detection and routing.</p>
            <h3>International Transfers</h3>
            <p>Your IP address is processed by <a href="https://ipapi.co/privacy/" target="_blank" rel="noopener">ipapi.co</a> (US-based) under Standard Contractual Clauses recognised by the UK ICO. If analytics cookies are enabled, anonymous usage data is processed by Google LLC (US) under the UK–US adequacy arrangements.</p>
            <h3>Data Retention</h3>
            <p>Consent cookies: 365 days. Analytics: retained by Google for up to 26 months. We hold no personal data on our own servers.</p>
            <h3>Data Controller</h3>
            <p>${SITE.author}, reachable via <a href="${SITE.url}" target="_blank" rel="noopener">${SITE.url}</a>.</p>
            ${cookieTable('en')}
        `;
    }

    // ── CH — nFADP ───────────────────────────────────────────────
    function policyCH(lang) {
        return `
            <h2>Datenschutzerklärung (revDSG — Schweiz)</h2>
            <div class="pp-law-badge">Diese Erklärung entspricht dem <strong>revidierten Bundesgesetz über den Datenschutz (revDSG)</strong>, das seit dem 1. September 2023 in Kraft ist.</div>
            <h3>Ihre Rechte (revDSG)</h3>
            <ul>
                <li><strong>Auskunftsrecht</strong> — Sie können Auskunft über Ihre gespeicherten Daten verlangen.</li>
                <li><strong>Recht auf Berichtigung</strong> — Sie können unrichtige Daten korrigieren lassen.</li>
                <li><strong>Recht auf Löschung</strong> — Sie können die Löschung Ihrer Daten verlangen.</li>
                <li><strong>Recht auf Herausgabe</strong> — Sie können Ihre Daten in einem gängigen Format erhalten.</li>
                <li><strong>Beschwerderecht</strong> — Beim <strong>Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB)</strong> unter <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener">edoeb.admin.ch</a>.</li>
            </ul>
            <h3>Rechtsgrundlage</h3>
            <p>Die Bearbeitung erfolgt auf Basis Ihrer <strong>Einwilligung</strong> (Art. 31 revDSG) sowie überwiegender privater Interessen (Art. 31 Abs. 2 revDSG) für Spracherkennung und -weiterleitung.</p>
            <h3>Datenübertragungen ins Ausland</h3>
            <p>Ihre IP-Adresse wird von <a href="https://ipapi.co/privacy/" target="_blank" rel="noopener">ipapi.co</a> (USA) verarbeitet. Bei aktivierten Analyse-Cookies verarbeitet Google LLC (USA) anonyme Nutzungsdaten. Da die USA nach dem revDSG keinen angemessenen Schutz bieten, stützen sich diese Übertragungen auf Standarddatenschutzklauseln.</p>
            <h3>Verantwortlicher</h3>
            <p>${SITE.author}, erreichbar über <a href="${SITE.url}" target="_blank" rel="noopener">${SITE.url}</a>.</p>
            ${cookieTable('de')}
        `;
    }

    // ── BR — LGPD ────────────────────────────────────────────────
    function policyBR(lang) {
        return `
            <h2>Política de Privacidade (LGPD — Brasil)</h2>
            <div class="pp-law-badge">Esta política está em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD)</strong>.</div>
            <h3>Seus Direitos sob a LGPD (Art. 18)</h3>
            <ul>
                <li><strong>Confirmação e acesso</strong> — Confirmar a existência de tratamento e acessar seus dados.</li>
                <li><strong>Correção</strong> — Corrigir dados incompletos, inexatos ou desatualizados.</li>
                <li><strong>Anonimização, bloqueio ou eliminação</strong> — De dados desnecessários ou tratados em desconformidade.</li>
                <li><strong>Portabilidade</strong> — Transferir seus dados a outro fornecedor de serviço.</li>
                <li><strong>Eliminação</strong> — Eliminar dados tratados com base em consentimento.</li>
                <li><strong>Revogação do consentimento</strong> — A qualquer momento, mediante manifestação expressa.</li>
                <li><strong>Peticionar à ANPD</strong> — À <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>.</li>
            </ul>
            <h3>Base Legal (Art. 7)</h3>
            <p><strong>Consentimento</strong> (Art. 7, I) para cookies analíticos e funcionais. <strong>Legítimo interesse</strong> (Art. 7, IX) para detecção de idioma e redirecionamento.</p>
            <h3>Transferência Internacional</h3>
            <p>Seu endereço IP é processado por <a href="https://ipapi.co/privacy/" target="_blank" rel="noopener">ipapi.co</a> (EUA). Se cookies analíticos estiverem ativos, o Google LLC (EUA) processa dados de uso anônimos. Ambas as transferências estão sujeitas às garantias previstas no Art. 33 da LGPD.</p>
            <h3>Controlador</h3>
            <p>${SITE.author}, acessível pelo formulário de contato em <a href="${SITE.url}" target="_blank" rel="noopener">${SITE.url}</a>.</p>
            ${cookieTable('pt')}
        `;
    }

    // ── US — CCPA/CPRA ───────────────────────────────────────────
    function policyUS(lang) {
        return `
            <h2>Privacy Policy (CCPA/CPRA — United States)</h2>
            <div class="pp-law-badge">This notice is provided pursuant to the <strong>California Consumer Privacy Act (CCPA)</strong> as amended by the <strong>California Privacy Rights Act (CPRA)</strong>. While technically applicable only to California residents, we extend these rights to all US visitors.</div>
            <h3>Your California Privacy Rights</h3>
            <ul>
                <li><strong>Right to Know</strong> — You may request disclosure of the categories and specific pieces of personal information we have collected about you.</li>
                <li><strong>Right to Delete</strong> — You may request deletion of personal information we have collected from you.</li>
                <li><strong>Right to Correct</strong> — You may request correction of inaccurate personal information.</li>
                <li><strong>Right to Opt-Out of Sale/Sharing</strong> — <strong>We do not sell or share your personal information</strong> with third parties for cross-context behavioral advertising.</li>
                <li><strong>Right to Limit Use of Sensitive Personal Information</strong> — We do not collect sensitive personal information as defined by CPRA.</li>
                <li><strong>Right to Non-Discrimination</strong> — We will not discriminate against you for exercising your rights.</li>
            </ul>
            <h3>Categories of Personal Information Collected</h3>
            <ul>
                <li><strong>Identifiers</strong> — IP address (for country/language detection, not stored by us).</li>
                <li><strong>Internet Activity</strong> — Anonymous usage statistics via Google Analytics (only with consent).</li>
            </ul>
            <h3>Do Not Sell or Share My Personal Information</h3>
            <p>We do not sell personal information. We do not share personal information with third parties for cross-context behavioral advertising. You may opt out of analytics cookies at any time via our cookie preferences.</p>
            <h3>Data Controller / Business</h3>
            <p>${SITE.author} — ${SITE.url}. For privacy requests, use the site at <a href="${SITE.url}" target="_blank" rel="noopener">${SITE.url}</a>.</p>
            ${cookieTable('en')}
        `;
    }

    // ── CA — PIPEDA / Quebec Law 25 ──────────────────────────────
    function policyCA(lang) {
        return `
            <h2>Privacy Policy (PIPEDA — Canada)</h2>
            <div class="pp-law-badge">This policy complies with Canada's <strong>Personal Information Protection and Electronic Documents Act (PIPEDA)</strong> and, for Quebec residents, with <strong>Law 25 (Act to modernize legislative provisions as regards the protection of personal information)</strong>.</div>
            <h3>Your Rights Under PIPEDA</h3>
            <ul>
                <li><strong>Right of Access</strong> — You may request access to your personal information.</li>
                <li><strong>Right to Correction</strong> — You may request correction of inaccurate personal information.</li>
                <li><strong>Right to Withdraw Consent</strong> — Subject to legal and contractual restrictions.</li>
                <li><strong>Right to Lodge a Complaint</strong> — With the <strong>Office of the Privacy Commissioner of Canada (OPC)</strong> at <a href="https://www.priv.gc.ca" target="_blank" rel="noopener">priv.gc.ca</a>.</li>
            </ul>
            <h3>Quebec Residents (Law 25)</h3>
            <p>Quebec residents have additional rights including the right to de-indexation and the right to data portability. We fully support these rights. Privacy incidents affecting Quebec residents will be reported to the <strong>Commission d'accès à l'information (CAI)</strong>.</p>
            <h3>Consent</h3>
            <p>We obtain meaningful consent before collecting personal information beyond what is necessary for basic site functionality. You may withdraw consent at any time via our cookie preferences.</p>
            <h3>Data Controller</h3>
            <p>${SITE.author} — Contact via the form at <a href="${SITE.url}" target="_blank" rel="noopener">${SITE.url}</a>.</p>
            ${cookieTable('en')}
        `;
    }

    // ── AU — Privacy Act 1988 ────────────────────────────────────
    function policyAU(lang) {
        return `
            <h2>Privacy Policy (Privacy Act 1988 — Australia)</h2>
            <div class="pp-law-badge">This policy complies with the <strong>Privacy Act 1988 (Cth)</strong> and the 13 <strong>Australian Privacy Principles (APPs)</strong>.</div>
            <h3>Your Rights Under the Privacy Act</h3>
            <ul>
                <li><strong>Access (APP 12)</strong> — You may request access to the personal information we hold about you.</li>
                <li><strong>Correction (APP 13)</strong> — You may ask us to correct inaccurate personal information.</li>
                <li><strong>Complaint</strong> — You may lodge a complaint with the <strong>Office of the Australian Information Commissioner (OAIC)</strong> at <a href="https://www.oaic.gov.au" target="_blank" rel="noopener">oaic.gov.au</a>.</li>
            </ul>
            <h3>Collection and Use</h3>
            <p>We collect your IP address solely to detect your country and serve the appropriate language version of this site (APP 3). We do not use this for any other purpose. We do not operate a contact form that stores personal data. Anonymous analytics are processed only with your consent (APP 6).</p>
            <h3>Overseas Disclosure</h3>
            <p>Your IP address is processed by <a href="https://ipapi.co/privacy/" target="_blank" rel="noopener">ipapi.co</a> (USA). If analytics cookies are enabled, Google LLC (USA) processes anonymous usage data. Under APP 8, we take reasonable steps to ensure these parties protect your information consistently with the APPs.</p>
            <h3>Contact</h3>
            <p>${SITE.author} — <a href="${SITE.url}" target="_blank" rel="noopener">${SITE.url}</a>.</p>
            ${cookieTable('en')}
        `;
    }

    // ── DEFAULT — General / Rest of World (fully translated) ────
    function policyDefault(lang) {
        // policyDefault translations from /data/i18n/privacy-policy.json
        const ppData = (window.INSaNE_DATA || {})['privacy-policy'] || {};
        const T = ppData.policyDefault || {};
        const p = T[lang] || T['en'];
        return `
            <h2>${p.title}</h2>
            <div class="pp-law-badge">${p.badge}</div>
            <h3>${p.collectTitle}</h3>
            <ul>
                <li>${p.ip}</li>
                <li>${p.cookies}</li>
                <li>${p.analytics}</li>
            </ul>
            <h3>${p.noCollectTitle}</h3>
            <ul>${p.no.map(i => `<li>${i}</li>`).join('')}</ul>
            <h3>${p.thirdTitle}</h3>
            <ul>
                <li><a href="https://ipapi.co/privacy/" target="_blank" rel="noopener">ipapi.co</a> — ${lang === 'zh' ? '国家/语言检测' : lang === 'ja' ? '国/言語検出' : lang === 'ko' ? '국가/언어 감지' : lang === 'ar' ? 'اكتشاف الدولة/اللغة' : lang === 'hi' ? 'देश/भाषा पहचान' : lang === 'th' ? 'การตรวจหาประเทศ/ภาษา' : lang === 'ms' ? 'Pengesanan negara/bahasa' : lang === 'id' ? 'Deteksi negara/bahasa' : lang === 'tl' ? 'Pagtuklas ng bansa/wika' : lang === 'vi' ? 'Phát hiện quốc gia/ngôn ngữ' : lang === 'ru' ? 'Определение страны/языка' : 'Country/language detection'}</li>
                <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Analytics / GTM</a> — ${lang === 'zh' ? '匿名分析（需要同意）' : lang === 'ja' ? '匿名分析（同意が必要）' : lang === 'ko' ? '익명 분석 (동의 필요)' : lang === 'ar' ? 'تحليلات مجهولة (الموافقة مطلوبة)' : lang === 'hi' ? 'गुमनाम विश्लेषण (सहमति आवश्यक)' : lang === 'th' ? 'การวิเคราะห์ที่ไม่ระบุตัวตน (ต้องได้รับความยินยอม)' : lang === 'ms' ? 'Analitik tanpa nama (persetujuan diperlukan)' : lang === 'id' ? 'Analitik anonim (persetujuan diperlukan)' : lang === 'tl' ? 'Hindi nagpapakilalang analytics (kailangan ang pahintulot)' : lang === 'vi' ? 'Phân tích ẩn danh (cần sự đồng ý)' : lang === 'ru' ? 'Анонимная аналитика (требуется согласие)' : 'Anonymous analytics (consent required)'}</li>
            </ul>
            <h3>${p.choicesTitle}</h3>
            <p>${p.choices}</p>
            <h3>${p.contactTitle}</h3>
            <p>${SITE.author} — <a href="${SITE.url}" target="_blank" rel="noopener">${SITE.url}</a></p>
            ${cookieTable(lang)}
        `;
    }

    // ═══════════════════════════════════════════════════════════
    //  MODAL BUILD & ANIMATION
    // ═══════════════════════════════════════════════════════════

    let modalBuilt    = false;
    let currentRegion = 'default';

    function injectStyles() {
        if (document.getElementById('pp-styles')) return;
        $('<style id="pp-styles">').text(`
            #pp-overlay {
                position: fixed; inset: 0;
                background: rgba(0,0,0,0.75);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                z-index: 2147483644;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            #pp-modal {
                position: relative;
                width: 100%; max-width: 720px;
                max-height: 88vh;
                background: #0f0f0f;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 14px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 24px 80px rgba(0,0,0,0.9);
            }
            #pp-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 20px 24px 16px;
                border-bottom: 1px solid rgba(255,255,255,0.08);
                flex-shrink: 0;
            }
            #pp-header h1 {
                margin: 0; font-size: 15px; font-weight: 700;
                color: #fff; letter-spacing: 0.02em;
            }
            #pp-region-badge {
                font-size: 11px; font-weight: 600;
                padding: 3px 10px; border-radius: 20px;
                background: rgba(26,111,181,0.2);
                border: 1px solid rgba(26,111,181,0.4);
                color: #5ba8e8; white-space: nowrap;
            }
            #pp-close {
                background: rgba(255,255,255,0.07);
                border: 1px solid rgba(255,255,255,0.12);
                color: #fff; width: 32px; height: 32px;
                border-radius: 50%; cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0; transition: background 0.2s;
                margin-left: 12px;
            }
            #pp-close:hover { background: rgba(255,255,255,0.15); }
            #pp-close svg, #pp-close svg * { pointer-events: none; }
            #pp-body {
                overflow-y: auto; padding: 24px;
                flex: 1;
                scrollbar-width: thin;
                scrollbar-color: #333 transparent;
            }
            #pp-body::-webkit-scrollbar { width: 4px; }
            #pp-body::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
            #pp-body h2 {
                color: #fff; font-size: 18px; font-weight: 700;
                margin: 0 0 14px; line-height: 1.3;
            }
            #pp-body h3 {
                color: #e83b2e; font-size: 13px; font-weight: 700;
                text-transform: uppercase; letter-spacing: 0.08em;
                margin: 22px 0 8px;
            }
            #pp-body p {
                color: rgba(255,255,255,0.72); font-size: 13px;
                line-height: 1.7; margin: 0 0 10px;
            }
            #pp-body ul {
                padding-left: 18px; margin: 0 0 10px;
                color: rgba(255,255,255,0.72); font-size: 13px;
                line-height: 1.7;
            }
            #pp-body li { margin-bottom: 6px; }
            #pp-body a {
                color: #5ba8e8; text-decoration: underline;
                text-underline-offset: 2px;
            }
            #pp-body a:hover { color: #88c4f0; }
            #pp-body code {
                background: rgba(255,255,255,0.08);
                padding: 1px 6px; border-radius: 4px;
                font-size: 12px; color: #e0e0e0;
            }
            .pp-law-badge {
                background: rgba(26,111,181,0.1);
                border: 1px solid rgba(26,111,181,0.25);
                border-left: 3px solid #1a6fb5;
                border-radius: 6px; padding: 10px 14px;
                font-size: 12px; color: rgba(255,255,255,0.65);
                line-height: 1.6; margin-bottom: 18px;
            }
            .pp-table-wrap {
                overflow-x: auto; margin-top: 18px;
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.08);
            }
            .pp-table {
                width: 100%; border-collapse: collapse;
                font-size: 12px; color: rgba(255,255,255,0.7);
            }
            .pp-table th {
                background: rgba(255,255,255,0.05);
                padding: 9px 12px; text-align: left;
                font-weight: 600; color: #fff;
                border-bottom: 1px solid rgba(255,255,255,0.08);
            }
            .pp-table td {
                padding: 8px 12px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }
            .pp-table tr:last-child td { border-bottom: none; }
            .pp-table tr:hover td { background: rgba(255,255,255,0.03); }
            #pp-footer {
                padding: 14px 24px;
                border-top: 1px solid rgba(255,255,255,0.08);
                display: flex; align-items: center;
                justify-content: space-between; flex-shrink: 0;
                gap: 12px; flex-wrap: wrap;
            }
            #pp-updated {
                font-size: 11px; color: rgba(255,255,255,0.3);
            }
            #pp-manage-cookies {
                font-size: 12px; font-weight: 600;
                color: #1a6fb5; background: none; border: none;
                cursor: pointer; padding: 6px 0;
                text-decoration: underline; text-underline-offset: 2px;
            }
            #pp-manage-cookies:hover { color: #5ba8e8; }
            @media (max-width: 520px) {
                #pp-header { padding: 16px 18px 14px; }
                #pp-body   { padding: 18px; }
                #pp-footer { padding: 12px 18px; }
                #pp-body h2 { font-size: 16px; }
            }
        `).appendTo('head');
    }

    // ── Centralised language detection ──────────────────────────
    // Priority: 1) html[lang] attribute  2) pathname segment  3) 'en'
    // html[lang] is set per-page in every HTML file and is the most reliable.
    // pathname is a fallback for the root '/' page where lang attr may be 'en'
    // but the cookie says something else.
    function getLang() {
        const LANG_NORMALIZE = { jp: 'ja', kr: 'ko' };
        // 1. html[lang] — set correctly in every language HTML
        const htmlLang = (document.documentElement.lang || '').toLowerCase().split('-')[0];
        if (htmlLang && htmlLang !== 'en') {
            return LANG_NORMALIZE[htmlLang] || htmlLang;
        }
        // 2. pathname segment — /es, /fr, /jp, etc.
        const pathLang = window.location.pathname.split('/')[1] || '';
        if (pathLang) {
            return LANG_NORMALIZE[pathLang] || pathLang;
        }
        // 3. language cookie set by cookieManager
        const cookieLang = (Cookies.get('language') || '').toUpperCase();
        const COOKIE_TO_LANG = {
            ES:'es', PT:'pt', FR:'fr', DE:'de', IT:'it', RU:'ru',
            ZH:'zh', JP:'ja', KR:'ko', AR:'ar', HI:'hi',
            TH:'th', MS:'ms', ID:'id', TL:'tl', VI:'vi',
        };
        if (COOKIE_TO_LANG[cookieLang]) return COOKIE_TO_LANG[cookieLang];
        return 'en';
    }

    // ── Localised footer strings ─────────────────────────────────
    // Footer strings — loaded from /data/i18n/privacy-policy.json
    function getFooterStrings(lang) {
        const data = (window.INSaNE_DATA || {})['privacy-policy'] || {};
        const footer = data.footer || {};
        return footer[lang] || footer['en'] || {
            updated: 'Last updated',
            manage:  'Manage Cookie Preferences'
        };
    }

    function buildModal() {
        if (modalBuilt) return;
        injectStyles();

        // DOM built language-agnostic — text injected on each open via updateModalLang()
        const overlay = $(`
            <div id="pp-overlay" role="dialog" aria-modal="true"
                 aria-label="Privacy Policy">
                <div id="pp-modal">
                    <div id="pp-header">
                        <div style="display:flex;align-items:center;gap:10px;min-width:0;">
                            <h1 id="pp-title">Privacy Policy</h1>
                            <span id="pp-region-badge">…</span>
                        </div>
                        <button id="pp-close" aria-label="Close">
                            <svg width="14" height="14" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" stroke-width="2.5">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div id="pp-body">
                        <p style="color:rgba(255,255,255,0.4);font-size:13px;">…</p>
                    </div>
                    <div id="pp-footer">
                        <span id="pp-updated"></span>
                        <button id="pp-manage-cookies"></button>
                    </div>
                </div>
            </div>
        `);

        $('body').append(overlay);

        $('#pp-close').on('click', closeModal);

        $('#pp-overlay').on('click', function(e) {
            if (e.target === this) closeModal();
        });

        $(document).on('keydown.pp', function(e) {
            if (e.key === 'Escape') closeModal();
        });

        $('#pp-manage-cookies').on('click', function() {
            closeModal();
            setTimeout(() => {
                // Everyone gets the GDPR panel — no branching needed
                if (window.GDPRConsent) {
                    try { Cookies.remove('insane_gdpr_consent', { path: '/' }); } catch(_) {}
                    window.GDPRConsent.init(function(consent) {
                        if (consent.functional && window._cookieManagerReady) {
                            window._cookieManagerReady(consent);
                        }
                    });
                }
            }, 400);
        });

        modalBuilt = true;
    }

    // Updates all language-dependent text in the modal shell on every open
    function updateModalLang(lang) {
        const f = getFooterStrings(lang);
        $('#pp-updated').text(`${f.updated}: ${SITE.updated}`);
        $('#pp-manage-cookies').text(f.manage);
    }

    // Region badge labels
    const REGION_LABELS = {
        eu: 'EU — GDPR', gb: 'UK — UK GDPR', ch: 'CH — nFADP',
        br: 'BR — LGPD', us: 'US — CCPA/CPRA', ca: 'CA — PIPEDA',
        au: 'AU — Privacy Act', default: 'General Policy'
    };

    // onClose callback — set when opening from GDPR panel context
    let _onCloseCallback = null;

    function openModal(region, options) {
        _onCloseCallback = (options && options.onClose) || null;
        buildModal();
        const lang = getLang();

        $('#pp-body').html(buildPolicy(region, lang));
        $('#pp-region-badge').text(REGION_LABELS[region] || 'General Policy');
        updateModalLang(lang);

        const originalURL   = window.location.href;
        const originalTitle = document.title;
        history.replaceState({ pp: true, originalURL }, 'Privacy Policy', '#privacy-policy');
        document.title = `Privacy Policy — ${SITE.name}`;

        $('#pp-overlay').data('originalURL', originalURL);
        $('#pp-overlay').data('originalTitle', originalTitle);

        $('#pp-overlay').css('display', 'flex');
        gsap.fromTo('#pp-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        gsap.fromTo('#pp-modal',
            { opacity: 0, y: 40, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.3)', delay: 0.05 }
        );

        setTimeout(() => $('#pp-close').focus(), 300);
    }

    function closeModal() {
        const originalURL   = $('#pp-overlay').data('originalURL')   || window.location.origin + '/';
        const originalTitle = $('#pp-overlay').data('originalTitle') || document.title;

        history.replaceState(null, originalTitle, originalURL.replace('#privacy-policy', '') || window.location.pathname);
        document.title = originalTitle;

        gsap.to('#pp-modal', {
            opacity: 0, y: 30, scale: 0.97,
            duration: 0.28, ease: 'power2.in'
        });
        gsap.to('#pp-overlay', {
            opacity: 0,
            duration: 0.3, ease: 'power2.in',
            delay: 0.1,
            onComplete: () => {
                $('#pp-overlay').css('display', 'none');
                $('#pp-body').scrollTop(0);
                // Fire onClose callback if set (e.g. restore GDPR panel)
                if (_onCloseCallback) {
                    const cb = _onCloseCallback;
                    _onCloseCallback = null;
                    cb();
                }
            }
        });

        $(document).off('keydown.pp');
    }

    // Handle browser back button / hash change
    // hashchange fires when the hash is removed (back button after opening modal)
    window.addEventListener('hashchange', function() {
        if (window.location.hash !== '#privacy-policy' && $('#pp-overlay').is(':visible')) {
            closeModal();
        }
    });

    // If page loads with #privacy-policy hash (shared link or direct navigation)
    // Wait for consent flow to complete first — otherwise the privacy policy
    // modal opens under/behind the GDPR panel on first visit
    if (window.location.hash === '#privacy-policy') {
        // INSaNE_DATA_READY ensures JSON is loaded before modal opens.
        // We also wait for GDPRConsent to finish (if it exists) so the
        // modal doesn't appear simultaneously with the cookie panel.
        const openWhenReady = () => {
            // If GDPR panel is currently visible, wait for it to be dismissed
            if (document.getElementById('gdpr-panel') &&
                document.getElementById('gdpr-panel').style.display !== 'none') {
                // Poll until panel is gone
                const poll = setInterval(() => {
                    const panel = document.getElementById('gdpr-panel');
                    if (!panel || panel.style.display === 'none' ||
                        getComputedStyle(panel).display === 'none') {
                        clearInterval(poll);
                        openModal(getRegionByLang());
                    }
                }, 150);
            } else {
                openModal(getRegionByLang());
            }
        };

        // Wait for data-loader to finish, then open
        if (window.INSaNE_DATA_READY) {
            window.INSaNE_DATA_READY.then(openWhenReady);
        } else {
            // data-loader.js not present — open after short delay to let
            // consent flow initialize first
            setTimeout(openWhenReady, 800);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  PUBLIC API — intercept privacy policy links
    // ═══════════════════════════════════════════════════════════

    /**
     * Call PrivacyPolicy.open() from anywhere to show the modal.
     * Automatically detects region via IP (cached from GDPRConsent if available).
     */
    window.PrivacyPolicy = {
        open(options) {
            openModal(getRegionByLang(), options || {});
        },
        close: closeModal,
    };

    // ── Intercept privacy policy links ──────────────────────────
    // Primary: catches #privacy-policy hash links (GDPR panel, cookie banner)
    // Fallback: also catches the localized paths from redirection.js in case
    //           any HTML still has the old-style href — opens modal instead of 404
    const policySelector = [
        'a[href="#privacy-policy"]',
        ...[...POLICY_PATHS].map(p => `a[href="${p}"]`)
    ].join(', ');

    $(document).on('click', policySelector, function(e) {
        e.preventDefault();

        const gdprPanel = document.getElementById('gdpr-panel');
        const gdprWasOpen = gdprPanel &&
            gdprPanel.style.display !== 'none' &&
            getComputedStyle(gdprPanel).display !== 'none';

        if (gdprWasOpen) {
            // Temporarily hide GDPR panel — NOT closing it, just moving it
            // behind the privacy policy modal. It will be restored when
            // the privacy policy modal is closed.
            if (window.gsap) {
                gsap.to(['#gdpr-card', '#gdpr-backdrop'], {
                    opacity: 0, duration: 0.2, ease: 'power2.in',
                    onComplete: () => {
                        gdprPanel.style.visibility = 'hidden';
                        window.PrivacyPolicy.open({
                            onClose: restoreGDPR
                        });
                    }
                });
            } else {
                gdprPanel.style.visibility = 'hidden';
                window.PrivacyPolicy.open({ onClose: restoreGDPR });
            }
        } else {
            window.PrivacyPolicy.open();
        }

        function restoreGDPR() {
            if (!gdprPanel) return;
            gdprPanel.style.visibility = 'visible';
            if (window.gsap) {
                gsap.fromTo(['#gdpr-card', '#gdpr-backdrop'],
                    { opacity: 0 },
                    { opacity: 1, duration: 0.3, ease: 'power2.out' }
                );
            }
        }
    });

})();