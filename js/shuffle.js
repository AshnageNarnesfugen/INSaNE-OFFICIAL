$.fn.shuffleLetters = function(prop) {
    var options = $.extend({
        "step": 20, // How many times should the letters be changed
        "fps": 30, // Frames Per Second
        "text": null // Use this text instead of the contents
    }, prop);

    return this.each(function() {
        var el = $(this);
        var originalText = options.text !== null ? options.text : el.text();
        var textNodes = [];

        function extractTextNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                textNodes.push(node);
            } else {
                $(node).contents().each(function() {
                    extractTextNodes(this);
                });
            }
        }

        extractTextNodes(el[0]);

        var str = originalText.split('');
        var letters = [];
        var types = [];

        for (var i = 0; i < str.length; i++) {
            var ch = str[i];
            switch (true) {
                case ch === " ":
                    types[i] = "space";
                    break;
                case /[a-z]/.test(ch):
                    types[i] = "lowerLetter";
                    break;
                case /[A-Z]/.test(ch):
                    types[i] = "upperLetter";
                    break;
                case /[0-9]/.test(ch):
                    types[i] = "number";
                    break;
                case /[\u3040-\u309F]/.test(ch):
                    types[i] = "hiragana";
                    break;
                case /[\u30A0-\u30FF]/.test(ch):
                    types[i] = "katakana";
                    break;
                case /[\u4E00-\u9FBF]/.test(ch):
                    types[index][i] = "kanji";
                    break;
                case /[\u4E00-\u9FFF]/.test(ch):
                    types[i] = "chinese";
                    break;
                case /[\uAC00-\uD7A3]/.test(ch):
                    types[i] = "korean";
                    break;
                case /[\u0410-\u044F]/.test(ch):
                    types[i] = "russian";
                    break;
                case /[\u0600-\u06FF]/.test(ch):
                    types[i] = "arabic";
                    break;
                case /[\u0900-\u097F]/.test(ch):
                    types[i] = "hindi";
                    break;
                default:
                    types[i] = "symbol";
            }
            letters.push(i);
        }

        function shuffle(start) {
            if (start > options.step) {
                el.text(originalText);
                return;
            }

            var strCopy = originalText.split('');
            letters.forEach((pos, i) => {
                if (i < start + options.step) {
                    strCopy[pos] = $.fn.shuffleLetters.randomChar(types[pos]);
                }
            });
            el.text(strCopy.join(""));

            setTimeout(() => shuffle(start + 1), 1000 / options.fps);
        }

        shuffle(-options.step);
    });
};

$.fn.shuffleLetters.randomChar = function(type) {
    const pools = {
        lowerLetter: "abcdefghijklmnopqrstuvwxyz0123456789",
        upperLetter: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        number: "0123456789",
        symbol: ",.?/\\(^)![]{}*&^%$#'\"",
        hiragana: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん",
        katakana: "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
        kanji: "亜哀挨愛曖悪握圧扱宛嵐安案暗以衣位囲医依委威為畏胃尉異移萎偉椅彙意違維慰遺緯射捨赦謝詐社車舎者尺借酌釈爵若樹受呪寿授需儒舟酒収宗就縦従縮熟純処初所暑署書諸除傷償勝称笑賞上",
        chinese: "的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经",
        korean: "가각간갇갈감갑값갓갔강갖같갚갛개객갠갤갬갭갯갰갱갸갹갼걀걋걍걔걘걜",
        russian: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя",
        arabic: "ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيـًٌٍَُِّْ٠١٢٣٤٥٦٧٨٩",
        hindi: "अआइईउऊऋएऐऑओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह़ािीुूृेैॉोौ्ॐऽ।॥"
    };
    return pools[type] ? pools[type][Math.floor(Math.random() * pools[type].length)] : "";
};