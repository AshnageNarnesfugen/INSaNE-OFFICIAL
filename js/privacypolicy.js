/**
 * privacy-policy.js — INSaNE | A Broken Hero
 *
 * Region-aware Privacy Policy modal.
 * - Detects user country via ipapi.co (same call already cached)
 * - Shows policy adapted to local law
 * - Modal opens over current page (no reload)
 * - URL changes to /privacy-policy via history.pushState (shareable)
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

    // ── Country → region mapping ────────────────────────────────
    const EU_EEA = new Set([
        'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE',
        'GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT',
        'RO','SK','SI','ES','SE','IS','LI','NO'
    ]);

    function getRegion(cc) {
        if (!cc) return 'default';
        if (EU_EEA.has(cc))  return 'eu';
        if (cc === 'GB')     return 'gb';
        if (cc === 'CH')     return 'ch';
        if (cc === 'BR')     return 'br';
        if (cc === 'US')     return 'us';
        if (cc === 'CA')     return 'ca';
        if (cc === 'AU')     return 'au';
        return 'default';
    }

    // ── Cookie table (same for all regions, descriptions vary) ──
    function cookieTable(lang) {
        const h = COOKIE_TABLE_HEADERS[lang] || COOKIE_TABLE_HEADERS['en'];
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

    const COOKIE_TABLE_HEADERS = {
        en: {
            name: 'Cookie', purpose: 'Purpose', duration: 'Duration', type: 'Category',
            langPurpose: 'Stores your preferred language for future visits',
            countryPurpose: 'Stores your detected country for language routing',
            redirectPurpose: 'Prevents repeated language redirects within 7 days',
            gdprPurpose: 'Stores your granular cookie consent choices (EU/EEA)',
            simplePurpose: 'Stores your accept/reject cookie decision (non-EU)',
            gaPurpose: 'Google Analytics — anonymous usage statistics (only with analytics consent)',
            days: 'days', years: 'years', min: 'min',
            functional: 'Functional', necessary: 'Necessary', analytics: 'Analytics',
        },
        es: {
            name: 'Cookie', purpose: 'Propósito', duration: 'Duración', type: 'Categoría',
            langPurpose: 'Almacena tu idioma preferido para visitas futuras',
            countryPurpose: 'Almacena tu país detectado para enrutamiento de idioma',
            redirectPurpose: 'Evita redirecciones repetidas de idioma durante 7 días',
            gdprPurpose: 'Almacena tus elecciones granulares de consentimiento (UE/EEE)',
            simplePurpose: 'Almacena tu decisión de aceptar/rechazar cookies (no UE)',
            gaPurpose: 'Google Analytics — estadísticas de uso anónimas (solo con consentimiento)',
            days: 'días', years: 'años', min: 'min',
            functional: 'Funcional', necessary: 'Necesaria', analytics: 'Analítica',
        },
        fr: {
            name: 'Cookie', purpose: 'Finalité', duration: 'Durée', type: 'Catégorie',
            langPurpose: 'Mémorise votre langue préférée pour vos prochaines visites',
            countryPurpose: 'Mémorise votre pays détecté pour le routage linguistique',
            redirectPurpose: 'Évite les redirections linguistiques répétées pendant 7 jours',
            gdprPurpose: 'Mémorise vos choix de consentement granulaires (UE/EEE)',
            simplePurpose: 'Mémorise votre décision d\'acceptation/refus (hors UE)',
            gaPurpose: 'Google Analytics — statistiques d\'utilisation anonymes (consentement requis)',
            days: 'jours', years: 'ans', min: 'min',
            functional: 'Fonctionnel', necessary: 'Nécessaire', analytics: 'Analytique',
        },
        de: {
            name: 'Cookie', purpose: 'Zweck', duration: 'Dauer', type: 'Kategorie',
            langPurpose: 'Speichert Ihre bevorzugte Sprache für zukünftige Besuche',
            countryPurpose: 'Speichert Ihr erkanntes Land für die Sprachweiterleitung',
            redirectPurpose: 'Verhindert wiederholte Sprachumleitungen für 7 Tage',
            gdprPurpose: 'Speichert Ihre granularen Einwilligungsentscheidungen (EU/EWR)',
            simplePurpose: 'Speichert Ihre Zustimmungs-/Ablehnungsentscheidung (Nicht-EU)',
            gaPurpose: 'Google Analytics — anonyme Nutzungsstatistiken (nur mit Einwilligung)',
            days: 'Tage', years: 'Jahre', min: 'Min',
            functional: 'Funktional', necessary: 'Notwendig', analytics: 'Analytisch',
        },
        it: {
            name: 'Cookie', purpose: 'Scopo', duration: 'Durata', type: 'Categoria',
            langPurpose: 'Memorizza la tua lingua preferita per le visite future',
            countryPurpose: 'Memorizza il tuo paese rilevato per il routing linguistico',
            redirectPurpose: 'Evita reindirizzamenti linguistici ripetuti per 7 giorni',
            gdprPurpose: 'Memorizza le tue scelte granulari di consenso (UE/SEE)',
            simplePurpose: 'Memorizza la tua decisione di accettare/rifiutare (non UE)',
            gaPurpose: 'Google Analytics — statistiche di utilizzo anonime (solo con consenso)',
            days: 'giorni', years: 'anni', min: 'min',
            functional: 'Funzionale', necessary: 'Necessario', analytics: 'Analitico',
        },
        pt: {
            name: 'Cookie', purpose: 'Finalidade', duration: 'Duração', type: 'Categoria',
            langPurpose: 'Armazena seu idioma preferido para visitas futuras',
            countryPurpose: 'Armazena seu país detectado para roteamento de idioma',
            redirectPurpose: 'Evita redirecionamentos de idioma repetidos por 7 dias',
            gdprPurpose: 'Armazena suas escolhas granulares de consentimento (UE/EEE)',
            simplePurpose: 'Armazena sua decisão de aceitar/rejeitar cookies (não UE)',
            gaPurpose: 'Google Analytics — estatísticas de uso anônimas (somente com consentimento)',
            days: 'dias', years: 'anos', min: 'min',
            functional: 'Funcional', necessary: 'Necessário', analytics: 'Analítico',
        },
        ru: {
            name: 'Cookie', purpose: 'Назначение', duration: 'Срок', type: 'Категория',
            langPurpose: 'Сохраняет предпочитаемый язык для будущих посещений',
            countryPurpose: 'Сохраняет определённую страну для маршрутизации языка',
            redirectPurpose: 'Предотвращает повторные языковые перенаправления в течение 7 дней',
            gdprPurpose: 'Сохраняет детальные настройки согласия на файлы cookie (ЕС/ЕЭЗ)',
            simplePurpose: 'Сохраняет решение о принятии/отклонении файлов cookie (не ЕС)',
            gaPurpose: 'Google Analytics — анонимная статистика использования (только с согласия)',
            days: 'дней', years: 'лет', min: 'мин',
            functional: 'Функциональный', necessary: 'Необходимый', analytics: 'Аналитический',
        },
        zh: {
            name: 'Cookie', purpose: '用途', duration: '有效期', type: '类别',
            langPurpose: '存储您的首选语言以供将来访问',
            countryPurpose: '存储您检测到的国家/地区以进行语言路由',
            redirectPurpose: '防止7天内重复进行语言重定向',
            gdprPurpose: '存储您的精细Cookie同意选择（欧盟/欧经区）',
            simplePurpose: '存储您的接受/拒绝Cookie决定（非欧盟）',
            gaPurpose: 'Google Analytics — 匿名使用统计（仅在获得分析同意后）',
            days: '天', years: '年', min: '分钟',
            functional: '功能性', necessary: '必要', analytics: '分析性',
        },
        ja: {
            name: 'Cookie', purpose: '目的', duration: '有効期間', type: 'カテゴリ',
            langPurpose: '将来の訪問のために優先言語を保存します',
            countryPurpose: '言語ルーティングのために検出された国を保存します',
            redirectPurpose: '7日間の繰り返し言語リダイレクトを防ぎます',
            gdprPurpose: 'きめ細かなCookie同意の選択を保存します（EU/EEA）',
            simplePurpose: 'Cookie承認/拒否の決定を保存します（非EU）',
            gaPurpose: 'Google Analytics — 匿名使用統計（分析同意がある場合のみ）',
            days: '日', years: '年', min: '分',
            functional: '機能的', necessary: '必須', analytics: '分析的',
        },
        ko: {
            name: 'Cookie', purpose: '목적', duration: '유효기간', type: '카테고리',
            langPurpose: '향후 방문을 위해 선호 언어를 저장합니다',
            countryPurpose: '언어 라우팅을 위해 감지된 국가를 저장합니다',
            redirectPurpose: '7일 동안 반복적인 언어 리디렉션을 방지합니다',
            gdprPurpose: '세분화된 쿠키 동의 선택을 저장합니다 (EU/EEA)',
            simplePurpose: '쿠키 수락/거부 결정을 저장합니다 (비 EU)',
            gaPurpose: 'Google Analytics — 익명 사용 통계 (분석 동의 시에만)',
            days: '일', years: '년', min: '분',
            functional: '기능적', necessary: '필수', analytics: '분석적',
        },
        ar: {
            name: 'كوكي', purpose: 'الغرض', duration: 'المدة', type: 'الفئة',
            langPurpose: 'يحفظ لغتك المفضلة للزيارات المستقبلية',
            countryPurpose: 'يحفظ بلدك المكتشف لتوجيه اللغة',
            redirectPurpose: 'يمنع عمليات إعادة توجيه اللغة المتكررة لمدة 7 أيام',
            gdprPurpose: 'يحفظ اختيارات موافقتك التفصيلية على ملفات تعريف الارتباط (الاتحاد الأوروبي)',
            simplePurpose: 'يحفظ قرار قبول/رفض ملفات تعريف الارتباط (خارج الاتحاد الأوروبي)',
            gaPurpose: 'Google Analytics — إحصائيات استخدام مجهولة (فقط بموافقة التحليلات)',
            days: 'أيام', years: 'سنوات', min: 'دقيقة',
            functional: 'وظيفي', necessary: 'ضروري', analytics: 'تحليلي',
        },
        hi: {
            name: 'Cookie', purpose: 'उद्देश्य', duration: 'अवधि', type: 'श्रेणी',
            langPurpose: 'भविष्य की यात्राओं के लिए आपकी पसंदीदा भाषा सहेजता है',
            countryPurpose: 'भाषा रूटिंग के लिए आपका पता लगाया गया देश सहेजता है',
            redirectPurpose: '7 दिनों के लिए बार-बार भाषा पुनर्निर्देशन रोकता है',
            gdprPurpose: 'आपके विस्तृत कुकी सहमति विकल्प सहेजता है (EU/EEA)',
            simplePurpose: 'कुकी स्वीकार/अस्वीकार निर्णय सहेजता है (गैर-EU)',
            gaPurpose: 'Google Analytics — अनाम उपयोग आँकड़े (केवल विश्लेषण सहमति के साथ)',
            days: 'दिन', years: 'वर्ष', min: 'मिनट',
            functional: 'कार्यात्मक', necessary: 'आवश्यक', analytics: 'विश्लेषणात्मक',
        },
        th: {
            name: 'Cookie', purpose: 'วัตถุประสงค์', duration: 'ระยะเวลา', type: 'ประเภท',
            langPurpose: 'บันทึกภาษาที่คุณต้องการสำหรับการเยี่ยมชมในอนาคต',
            countryPurpose: 'บันทึกประเทศที่ตรวจพบสำหรับการกำหนดเส้นทางภาษา',
            redirectPurpose: 'ป้องกันการเปลี่ยนเส้นทางภาษาซ้ำๆ เป็นเวลา 7 วัน',
            gdprPurpose: 'บันทึกตัวเลือกความยินยอมคุกกี้แบบละเอียด (EU/EEA)',
            simplePurpose: 'บันทึกการตัดสินใจยอมรับ/ปฏิเสธคุกกี้ (ไม่ใช่ EU)',
            gaPurpose: 'Google Analytics — สถิติการใช้งานที่ไม่ระบุตัวตน (เฉพาะเมื่อได้รับความยินยอม)',
            days: 'วัน', years: 'ปี', min: 'นาที',
            functional: 'ฟังก์ชันนอล', necessary: 'จำเป็น', analytics: 'วิเคราะห์',
        },
        ms: {
            name: 'Cookie', purpose: 'Tujuan', duration: 'Tempoh', type: 'Kategori',
            langPurpose: 'Menyimpan bahasa pilihan anda untuk lawatan masa hadapan',
            countryPurpose: 'Menyimpan negara yang dikesan untuk laluan bahasa',
            redirectPurpose: 'Menghalang pengalihan bahasa berulang selama 7 hari',
            gdprPurpose: 'Menyimpan pilihan persetujuan cookie terperinci anda (EU/EEA)',
            simplePurpose: 'Menyimpan keputusan terima/tolak cookie (bukan EU)',
            gaPurpose: 'Google Analytics — statistik penggunaan tanpa nama (hanya dengan persetujuan)',
            days: 'hari', years: 'tahun', min: 'min',
            functional: 'Fungsional', necessary: 'Perlu', analytics: 'Analitik',
        },
        id: {
            name: 'Cookie', purpose: 'Tujuan', duration: 'Durasi', type: 'Kategori',
            langPurpose: 'Menyimpan bahasa pilihan Anda untuk kunjungan mendatang',
            countryPurpose: 'Menyimpan negara yang terdeteksi untuk perutean bahasa',
            redirectPurpose: 'Mencegah pengalihan bahasa berulang selama 7 hari',
            gdprPurpose: 'Menyimpan pilihan persetujuan cookie terperinci Anda (EU/EEA)',
            simplePurpose: 'Menyimpan keputusan terima/tolak cookie (non-EU)',
            gaPurpose: 'Google Analytics — statistik penggunaan anonim (hanya dengan persetujuan)',
            days: 'hari', years: 'tahun', min: 'menit',
            functional: 'Fungsional', necessary: 'Diperlukan', analytics: 'Analitik',
        },
        tl: {
            name: 'Cookie', purpose: 'Layunin', duration: 'Tagal', type: 'Kategorya',
            langPurpose: 'Nag-iimbak ng iyong gustong wika para sa mga susunod na pagbisita',
            countryPurpose: 'Nag-iimbak ng iyong natukoy na bansa para sa pagro-route ng wika',
            redirectPurpose: 'Pinipigilan ang paulit-ulit na pag-redirect ng wika sa loob ng 7 araw',
            gdprPurpose: 'Nag-iimbak ng iyong detalyadong mga pagpipilian sa pahintulot ng cookie (EU/EEA)',
            simplePurpose: 'Nag-iimbak ng iyong desisyon sa pagtanggap/pagtanggi ng cookie (hindi EU)',
            gaPurpose: 'Google Analytics — hindi nagpapakilalang mga istatistika ng paggamit (may pahintulot lamang)',
            days: 'araw', years: 'taon', min: 'min',
            functional: 'Functional', necessary: 'Kinakailangan', analytics: 'Analytics',
        },
        vi: {
            name: 'Cookie', purpose: 'Mục đích', duration: 'Thời hạn', type: 'Danh mục',
            langPurpose: 'Lưu ngôn ngữ ưa thích của bạn cho các lần truy cập trong tương lai',
            countryPurpose: 'Lưu quốc gia được phát hiện để định tuyến ngôn ngữ',
            redirectPurpose: 'Ngăn chặn chuyển hướng ngôn ngữ lặp lại trong 7 ngày',
            gdprPurpose: 'Lưu các lựa chọn chấp thuận cookie chi tiết của bạn (EU/EEA)',
            simplePurpose: 'Lưu quyết định chấp nhận/từ chối cookie (ngoài EU)',
            gaPurpose: 'Google Analytics — thống kê sử dụng ẩn danh (chỉ khi có sự đồng ý)',
            days: 'ngày', years: 'năm', min: 'phút',
            functional: 'Chức năng', necessary: 'Cần thiết', analytics: 'Phân tích',
        },
    };

    // ═══════════════════════════════════════════════════════════
    //  POLICY CONTENT — per region
    // ═══════════════════════════════════════════════════════════

    function buildPolicy(region, lang) {
        // Normalize path-based lang codes to standard ISO codes
        // redirection.js uses 'jp', 'kr', 'zh' as path segments but
        // cookie table and translations use ISO 639-1: 'ja', 'ko', 'zh'
        const LANG_NORMALIZE = {
            jp: 'ja', kr: 'ko',
            // rest already match or are handled by fallback
        };
        const L = LANG_NORMALIZE[lang] || lang || 'en';
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
        const T = {
            en: {
                title: 'Privacy Policy',
                badge: 'This Privacy Policy follows the <strong>OECD Privacy Guidelines</strong> and represents our commitment to transparent, fair data handling regardless of your location.',
                collectTitle: 'What We Collect',
                ip: '<strong>IP address</strong> — Processed temporarily by ipapi.co to detect your country and serve the correct language version. Not stored by us.',
                cookies: '<strong>Cookies</strong> — See the table below. You control which categories are active via our cookie banner.',
                analytics: '<strong>Analytics</strong> — Anonymous usage statistics via Google Analytics/GTM, only if you have given analytics consent.',
                noCollectTitle: 'What We Do NOT Collect',
                no: ['No user accounts or passwords', 'No payment or financial data', 'No sensitive personal data (health, religion, ethnicity, etc.)', 'No data from children under 13', 'We do not sell your data to any third party'],
                thirdTitle: 'Third Parties',
                choicesTitle: 'Your Choices',
                choices: 'You can manage cookie preferences at any time via our cookie consent panel.',
                contactTitle: 'Contact',
            },
            ru: {
                title: 'Политика конфиденциальности',
                badge: 'Настоящая Политика конфиденциальности соответствует <strong>Руководящим принципам ОЭСР в области конфиденциальности</strong> и отражает наше обязательство по прозрачной и справедливой обработке данных.',
                collectTitle: 'Что мы собираем',
                ip: '<strong>IP-адрес</strong> — Временно обрабатывается ipapi.co для определения вашей страны и отображения правильной языковой версии. Нами не сохраняется.',
                cookies: '<strong>Файлы cookie</strong> — См. таблицу ниже. Вы управляете активными категориями через наш баннер.',
                analytics: '<strong>Аналитика</strong> — Анонимная статистика использования через Google Analytics/GTM — только при наличии вашего согласия.',
                noCollectTitle: 'Что мы НЕ собираем',
                no: ['Нет учётных записей или паролей', 'Нет платёжных или финансовых данных', 'Нет конфиденциальных личных данных (здоровье, религия, этническая принадлежность и т.д.)', 'Нет данных детей до 13 лет', 'Мы не продаём ваши данные третьим лицам'],
                thirdTitle: 'Третьи стороны',
                choicesTitle: 'Ваш выбор',
                choices: 'Вы можете управлять настройками файлов cookie в любое время через нашу панель согласия.',
                contactTitle: 'Контакт',
            },
            zh: {
                title: '隐私政策',
                badge: '本隐私政策遵循<strong>经合组织隐私准则</strong>，体现我们对透明、公平数据处理的承诺。',
                collectTitle: '我们收集的信息',
                ip: '<strong>IP地址</strong> — 由ipapi.co临时处理，用于检测您的国家并提供正确的语言版本。我们不存储此信息。',
                cookies: '<strong>Cookie</strong> — 请参阅下表。您可以通过我们的Cookie横幅控制哪些类别处于活动状态。',
                analytics: '<strong>分析</strong> — 仅在您同意的情况下，通过Google Analytics/GTM收集匿名使用统计数据。',
                noCollectTitle: '我们不收集的信息',
                no: ['不收集用户账户或密码', '不收集支付或财务数据', '不收集敏感个人数据（健康、宗教、民族等）', '不收集13岁以下儿童的数据', '我们不向任何第三方出售您的数据'],
                thirdTitle: '第三方',
                choicesTitle: '您的选择',
                choices: '您可以随时通过我们的Cookie同意面板管理Cookie偏好。',
                contactTitle: '联系方式',
            },
            ja: {
                title: 'プライバシーポリシー',
                badge: '本プライバシーポリシーは<strong>OECDプライバシーガイドライン</strong>に準拠し、透明で公正なデータ取り扱いへのコミットメントを示します。',
                collectTitle: '収集する情報',
                ip: '<strong>IPアドレス</strong> — ipapi.coにより一時的に処理され、お客様の国を検出して適切な言語バージョンを提供します。弊社には保存されません。',
                cookies: '<strong>Cookie</strong> — 下の表をご覧ください。Cookieバナーからカテゴリを管理できます。',
                analytics: '<strong>アナリティクス</strong> — お客様の同意がある場合のみ、Google Analytics/GTMを通じて匿名の使用統計を収集します。',
                noCollectTitle: '収集しない情報',
                no: ['ユーザーアカウントまたはパスワードなし', '支払いまたは財務データなし', '機密個人データなし（健康、宗教、民族等）', '13歳未満の子供のデータなし', 'お客様のデータを第三者に販売しません'],
                thirdTitle: '第三者',
                choicesTitle: 'お客様の選択',
                choices: 'Cookieの設定はいつでもCookie同意パネルから管理できます。',
                contactTitle: 'お問い合わせ',
            },
            ko: {
                title: '개인정보 처리방침',
                badge: '본 개인정보 처리방침은 <strong>OECD 개인정보 보호 가이드라인</strong>을 따르며, 투명하고 공정한 데이터 처리에 대한 우리의 약속을 나타냅니다.',
                collectTitle: '수집하는 정보',
                ip: '<strong>IP 주소</strong> — ipapi.co에 의해 일시적으로 처리되어 국가를 감지하고 올바른 언어 버전을 제공합니다. 당사는 저장하지 않습니다.',
                cookies: '<strong>쿠키</strong> — 아래 표를 참조하세요. 쿠키 배너를 통해 활성 카테고리를 관리할 수 있습니다.',
                analytics: '<strong>분석</strong> — 분석 동의를 제공한 경우에만 Google Analytics/GTM을 통해 익명 사용 통계를 수집합니다.',
                noCollectTitle: '수집하지 않는 정보',
                no: ['사용자 계정 또는 비밀번호 없음', '결제 또는 금융 데이터 없음', '민감한 개인 데이터 없음(건강, 종교, 민족 등)', '13세 미만 아동의 데이터 없음', '귀하의 데이터를 제3자에게 판매하지 않음'],
                thirdTitle: '제3자',
                choicesTitle: '귀하의 선택',
                choices: '언제든지 쿠키 동의 패널을 통해 쿠키 기본 설정을 관리할 수 있습니다.',
                contactTitle: '연락처',
            },
            ar: {
                title: 'سياسة الخصوصية',
                badge: 'تتبع سياسة الخصوصية هذه <strong>مبادئ توجيهية للخصوصية الصادرة عن منظمة التعاون الاقتصادي والتنمية (OECD)</strong> وتعكس التزامنا بالتعامل الشفاف والعادل مع البيانات.',
                collectTitle: 'ما نجمعه',
                ip: '<strong>عنوان IP</strong> — تتم معالجته مؤقتاً بواسطة ipapi.co لاكتشاف بلدك وتقديم النسخة اللغوية الصحيحة. لا نقوم بتخزينه.',
                cookies: '<strong>ملفات تعريف الارتباط</strong> — راجع الجدول أدناه. يمكنك التحكم في الفئات النشطة عبر لافتة ملفات تعريف الارتباط.',
                analytics: '<strong>التحليلات</strong> — إحصائيات استخدام مجهولة عبر Google Analytics/GTM فقط إذا أعطيت موافقتك.',
                noCollectTitle: 'ما لا نجمعه',
                no: ['لا توجد حسابات مستخدمين أو كلمات مرور', 'لا توجد بيانات دفع أو مالية', 'لا توجد بيانات شخصية حساسة (الصحة، الدين، العرق، إلخ)', 'لا توجد بيانات للأطفال دون 13 عامًا', 'نحن لا نبيع بياناتك لأي طرف ثالث'],
                thirdTitle: 'الأطراف الثالثة',
                choicesTitle: 'خياراتك',
                choices: 'يمكنك إدارة تفضيلات ملفات تعريف الارتباط في أي وقت عبر لوحة الموافقة.',
                contactTitle: 'التواصل',
            },
            hi: {
                title: 'गोपनीयता नीति',
                badge: 'यह गोपनीयता नीति <strong>OECD गोपनीयता दिशानिर्देशों</strong> का पालन करती है और आपके स्थान की परवाह किए बिना पारदर्शी, उचित डेटा प्रबंधन के प्रति हमारी प्रतिबद्धता को दर्शाती है।',
                collectTitle: 'हम क्या एकत्र करते हैं',
                ip: '<strong>IP पता</strong> — आपके देश का पता लगाने और सही भाषा संस्करण प्रदान करने के लिए ipapi.co द्वारा अस्थायी रूप से संसाधित। हमारे द्वारा संग्रहीत नहीं।',
                cookies: '<strong>कुकीज़</strong> — नीचे दी गई तालिका देखें। आप हमारे कुकी बैनर के माध्यम से सक्रिय श्रेणियों को नियंत्रित कर सकते हैं।',
                analytics: '<strong>एनालिटिक्स</strong> — केवल तभी जब आपने विश्लेषण सहमति दी हो, Google Analytics/GTM के माध्यम से गुमनाम उपयोग आँकड़े।',
                noCollectTitle: 'हम क्या एकत्र नहीं करते',
                no: ['कोई उपयोगकर्ता खाते या पासवर्ड नहीं', 'कोई भुगतान या वित्तीय डेटा नहीं', 'कोई संवेदनशील व्यक्तिगत डेटा नहीं (स्वास्थ्य, धर्म, जातीयता, आदि)', '13 वर्ष से कम आयु के बच्चों का कोई डेटा नहीं', 'हम आपका डेटा किसी तृतीय पक्ष को नहीं बेचते'],
                thirdTitle: 'तृतीय पक्ष',
                choicesTitle: 'आपके विकल्प',
                choices: 'आप किसी भी समय हमारे कुकी सहमति पैनल के माध्यम से कुकी प्राथमिकताएं प्रबंधित कर सकते हैं।',
                contactTitle: 'संपर्क',
            },
            th: {
                title: 'นโยบายความเป็นส่วนตัว',
                badge: 'นโยบายความเป็นส่วนตัวนี้ปฏิบัติตาม<strong>แนวปฏิบัติด้านความเป็นส่วนตัวของ OECD</strong> และแสดงถึงความมุ่งมั่นของเราในการจัดการข้อมูลอย่างโปร่งใสและเป็นธรรม',
                collectTitle: 'สิ่งที่เราเก็บรวบรวม',
                ip: '<strong>ที่อยู่ IP</strong> — ประมวลผลชั่วคราวโดย ipapi.co เพื่อตรวจหาประเทศของคุณและให้บริการเวอร์ชันภาษาที่ถูกต้อง ไม่ได้จัดเก็บโดยเรา',
                cookies: '<strong>คุกกี้</strong> — ดูตารางด้านล่าง คุณสามารถควบคุมหมวดหมู่ที่ใช้งานได้ผ่านแบนเนอร์คุกกี้ของเรา',
                analytics: '<strong>การวิเคราะห์</strong> — สถิติการใช้งานที่ไม่ระบุตัวตนผ่าน Google Analytics/GTM เฉพาะเมื่อคุณได้ให้ความยินยอมด้านการวิเคราะห์',
                noCollectTitle: 'สิ่งที่เราไม่เก็บรวบรวม',
                no: ['ไม่มีบัญชีผู้ใช้หรือรหัสผ่าน', 'ไม่มีข้อมูลการชำระเงินหรือทางการเงิน', 'ไม่มีข้อมูลส่วนบุคคลที่ละเอียดอ่อน (สุขภาพ ศาสนา เชื้อชาติ ฯลฯ)', 'ไม่มีข้อมูลจากเด็กอายุต่ำกว่า 13 ปี', 'เราไม่ขายข้อมูลของคุณให้กับบุคคลที่สาม'],
                thirdTitle: 'บุคคลที่สาม',
                choicesTitle: 'ตัวเลือกของคุณ',
                choices: 'คุณสามารถจัดการการตั้งค่าคุกกี้ได้ตลอดเวลาผ่านแผงความยินยอมคุกกี้ของเรา',
                contactTitle: 'ติดต่อ',
            },
            ms: {
                title: 'Dasar Privasi',
                badge: 'Dasar Privasi ini mengikuti <strong>Garis Panduan Privasi OECD</strong> dan mencerminkan komitmen kami terhadap pengendalian data yang telus dan adil.',
                collectTitle: 'Apa yang Kami Kumpul',
                ip: '<strong>Alamat IP</strong> — Diproses sementara oleh ipapi.co untuk mengesan negara anda dan menyajikan versi bahasa yang betul. Tidak disimpan oleh kami.',
                cookies: '<strong>Kuki</strong> — Lihat jadual di bawah. Anda boleh mengawal kategori yang aktif melalui banner kuki kami.',
                analytics: '<strong>Analitik</strong> — Statistik penggunaan tanpa nama melalui Google Analytics/GTM, hanya jika anda telah memberikan persetujuan analitik.',
                noCollectTitle: 'Apa yang Kami TIDAK Kumpul',
                no: ['Tiada akaun pengguna atau kata laluan', 'Tiada data pembayaran atau kewangan', 'Tiada data peribadi sensitif (kesihatan, agama, etnik, dll.)', 'Tiada data daripada kanak-kanak di bawah 13 tahun', 'Kami tidak menjual data anda kepada mana-mana pihak ketiga'],
                thirdTitle: 'Pihak Ketiga',
                choicesTitle: 'Pilihan Anda',
                choices: 'Anda boleh mengurus keutamaan kuki pada bila-bila masa melalui panel persetujuan kuki kami.',
                contactTitle: 'Hubungi',
            },
            id: {
                title: 'Kebijakan Privasi',
                badge: 'Kebijakan Privasi ini mengikuti <strong>Pedoman Privasi OECD</strong> dan mencerminkan komitmen kami terhadap penanganan data yang transparan dan adil.',
                collectTitle: 'Yang Kami Kumpulkan',
                ip: '<strong>Alamat IP</strong> — Diproses sementara oleh ipapi.co untuk mendeteksi negara Anda dan menyajikan versi bahasa yang tepat. Tidak disimpan oleh kami.',
                cookies: '<strong>Cookie</strong> — Lihat tabel di bawah. Anda dapat mengontrol kategori mana yang aktif melalui banner cookie kami.',
                analytics: '<strong>Analitik</strong> — Statistik penggunaan anonim melalui Google Analytics/GTM, hanya jika Anda telah memberikan persetujuan analitik.',
                noCollectTitle: 'Yang TIDAK Kami Kumpulkan',
                no: ['Tidak ada akun pengguna atau kata sandi', 'Tidak ada data pembayaran atau keuangan', 'Tidak ada data pribadi sensitif (kesehatan, agama, etnis, dll.)', 'Tidak ada data dari anak-anak di bawah 13 tahun', 'Kami tidak menjual data Anda kepada pihak ketiga mana pun'],
                thirdTitle: 'Pihak Ketiga',
                choicesTitle: 'Pilihan Anda',
                choices: 'Anda dapat mengelola preferensi cookie kapan saja melalui panel persetujuan cookie kami.',
                contactTitle: 'Kontak',
            },
            tl: {
                title: 'Patakaran sa Privacy',
                badge: 'Sinusunod ng Patakarang ito sa Privacy ang <strong>OECD Privacy Guidelines</strong> at kumakatawan sa aming pangako sa transparent at patas na paghawak ng data.',
                collectTitle: 'Ano ang Kinokolekta Namin',
                ip: '<strong>IP address</strong> — Pansamantalang pinoproseso ng ipapi.co upang matukoy ang iyong bansa at maihatid ang tamang bersyon ng wika. Hindi namin iniimbak.',
                cookies: '<strong>Cookies</strong> — Tingnan ang talahanayan sa ibaba. Maaari mong kontrolin kung aling mga kategorya ang aktibo sa pamamagitan ng aming cookie banner.',
                analytics: '<strong>Analytics</strong> — Mga hindi nagpapakilalang istatistika ng paggamit sa pamamagitan ng Google Analytics/GTM, tanging kung nagbigay ka ng pahintulot sa analytics.',
                noCollectTitle: 'Ano ang HINDI Namin Kinokolekta',
                no: ['Walang mga account ng gumagamit o password', 'Walang data sa pagbabayad o pananalapi', 'Walang sensitibong personal na data (kalusugan, relihiyon, etnisidad, atbp.)', 'Walang data mula sa mga bata na wala pang 13 taong gulang', 'Hindi namin ibinebenta ang iyong data sa anumang third party'],
                thirdTitle: 'Mga Third Party',
                choicesTitle: 'Ang Iyong mga Pagpipilian',
                choices: 'Maaari mong pamahalaan ang mga kagustuhan sa cookie anumang oras sa pamamagitan ng aming panel ng pahintulot sa cookie.',
                contactTitle: 'Makipag-ugnayan',
            },
            vi: {
                title: 'Chính Sách Bảo Mật',
                badge: 'Chính Sách Bảo Mật này tuân theo <strong>Hướng dẫn về Quyền riêng tư của OECD</strong> và thể hiện cam kết của chúng tôi về xử lý dữ liệu minh bạch và công bằng.',
                collectTitle: 'Những gì Chúng tôi Thu thập',
                ip: '<strong>Địa chỉ IP</strong> — Được ipapi.co xử lý tạm thời để phát hiện quốc gia của bạn và cung cấp phiên bản ngôn ngữ phù hợp. Chúng tôi không lưu trữ.',
                cookies: '<strong>Cookie</strong> — Xem bảng bên dưới. Bạn có thể kiểm soát các danh mục nào đang hoạt động thông qua banner cookie của chúng tôi.',
                analytics: '<strong>Phân tích</strong> — Thống kê sử dụng ẩn danh qua Google Analytics/GTM, chỉ khi bạn đã đồng ý phân tích.',
                noCollectTitle: 'Những gì Chúng tôi KHÔNG Thu thập',
                no: ['Không có tài khoản người dùng hoặc mật khẩu', 'Không có dữ liệu thanh toán hoặc tài chính', 'Không có dữ liệu cá nhân nhạy cảm (sức khỏe, tôn giáo, dân tộc, v.v.)', 'Không có dữ liệu từ trẻ em dưới 13 tuổi', 'Chúng tôi không bán dữ liệu của bạn cho bất kỳ bên thứ ba nào'],
                thirdTitle: 'Bên Thứ Ba',
                choicesTitle: 'Lựa chọn của Bạn',
                choices: 'Bạn có thể quản lý tùy chọn cookie bất kỳ lúc nào thông qua bảng chấp thuận cookie của chúng tôi.',
                contactTitle: 'Liên hệ',
            },
        };

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

    function buildModal() {
        if (modalBuilt) return;
        injectStyles();

        const lang = window.location.pathname.split('/')[1] || 'en';
        const lastUpdated = `Last updated: ${SITE.updated}`;

        const overlay = $(`
            <div id="pp-overlay" role="dialog" aria-modal="true"
                 aria-label="Privacy Policy">
                <div id="pp-modal">
                    <div id="pp-header">
                        <div style="display:flex;align-items:center;gap:10px;min-width:0;">
                            <h1>Privacy Policy</h1>
                            <span id="pp-region-badge">Detecting region…</span>
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
                        <p style="color:rgba(255,255,255,0.4);font-size:13px;">
                            Loading policy for your region…
                        </p>
                    </div>
                    <div id="pp-footer">
                        <span id="pp-updated">${lastUpdated}</span>
                        <button id="pp-manage-cookies">Manage Cookie Preferences</button>
                    </div>
                </div>
            </div>
        `);

        $('body').append(overlay);

        // Close button
        $('#pp-close').on('click', closeModal);

        // Click outside modal = close
        $('#pp-overlay').on('click', function(e) {
            if (e.target === this) closeModal();
        });

        // Escape key
        $(document).on('keydown.pp', function(e) {
            if (e.key === 'Escape') closeModal();
        });

        // Manage cookies button — re-opens GDPR panel or scrolls to banner
        $('#pp-manage-cookies').on('click', function() {
            closeModal();
            setTimeout(() => {
                if (window.GDPRConsent) {
                    // Clear existing consent to force re-show
                    Cookies.remove('insane_gdpr_consent');
                    window.location.reload();
                }
            }, 400);
        });

        modalBuilt = true;
    }

    // Region badge labels
    const REGION_LABELS = {
        eu: 'EU — GDPR', gb: 'UK — UK GDPR', ch: 'CH — nFADP',
        br: 'BR — LGPD', us: 'US — CCPA/CPRA', ca: 'CA — PIPEDA',
        au: 'AU — Privacy Act', default: 'General Policy'
    };

    function openModal(region, countryCode) {
        buildModal();
        const lang = window.location.pathname.split('/')[1] || 'en';

        // Populate content
        $('#pp-body').html(buildPolicy(region, lang));
        $('#pp-region-badge').text(REGION_LABELS[region] || 'General Policy');

        // URL aesthetics — pushState so back button works
        const originalURL = window.location.href;
        const originalTitle = document.title;
        history.pushState({ pp: true, originalURL }, 'Privacy Policy', POLICY_PATH);
        document.title = `Privacy Policy — ${SITE.name}`;

        // Store so closeModal can restore
        $('#pp-overlay').data('originalURL', originalURL);
        $('#pp-overlay').data('originalTitle', originalTitle);

        // Animate in
        $('#pp-overlay').css('display', 'flex');
        gsap.fromTo('#pp-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        gsap.fromTo('#pp-modal',
            { opacity: 0, y: 40, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.3)', delay: 0.05 }
        );

        // Focus for a11y
        setTimeout(() => $('#pp-close').focus(), 300);
    }

    function closeModal() {
        const originalURL   = $('#pp-overlay').data('originalURL')   || window.location.origin + '/';
        const originalTitle = $('#pp-overlay').data('originalTitle') || document.title;

        // Restore URL
        history.pushState(null, originalTitle, originalURL);
        document.title = originalTitle;

        // Animate out
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
                // Scroll body back to top inside modal for next open
                $('#pp-body').scrollTop(0);
            }
        });

        $(document).off('keydown.pp');
    }

    // Handle browser back button
    window.addEventListener('popstate', function(e) {
        if ($('#pp-overlay').is(':visible')) {
            closeModal();
        }
    });

    // If page loads directly on any localized privacy policy path (shared link)
    if (POLICY_PATHS.has(window.location.pathname)) {
        // Detect region then open modal
        $.getJSON('https://ipapi.co/json/')
            .done((data) => {
                const region = getRegion(data.country_code);
                openModal(region, data.country_code);
            })
            .fail(() => openModal('default', null));
    }

    // ═══════════════════════════════════════════════════════════
    //  PUBLIC API — intercept privacy policy links
    // ═══════════════════════════════════════════════════════════

    /**
     * Call PrivacyPolicy.open() from anywhere to show the modal.
     * Automatically detects region via IP (cached from GDPRConsent if available).
     */
    window.PrivacyPolicy = {
        open() {
            // Try to reuse country already detected by GDPRConsent
            let knownCC = null;
            try {
                const consent = JSON.parse(Cookies.get('insane_gdpr_consent') || '{}');
                // consent doesn't store CC directly — re-detect
            } catch {}

            if (window._ipapi_country) {
                // Already cached from redirection.js boot
                openModal(getRegion(window._ipapi_country), window._ipapi_country);
            } else {
                $.getJSON('https://ipapi.co/json/')
                    .done((data) => {
                        window._ipapi_country = data.country_code;
                        openModal(getRegion(data.country_code), data.country_code);
                    })
                    .fail(() => openModal('default', null));
            }
        },
        close: closeModal,
    };

    // ── Intercept ALL localized privacy policy links ────────────
    // Builds a CSS attribute selector that matches every known path.
    // Works for links added dynamically (GDPR panel, cookie banner, footer).
    const policySelector = [...POLICY_PATHS]
        .map(p => `a[href="${p}"], a[href$="${p}"]`)
        .join(', ');

    $(document).on('click', policySelector, function(e) {
        e.preventDefault();
        window.PrivacyPolicy.open();
    });

})();