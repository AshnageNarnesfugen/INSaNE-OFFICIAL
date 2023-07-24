

    class AccessibilityMenu {
        constructor() {
            this.originalStyles = {
                fontSize: $('body').css('font-size'),
                letterSpacing: $('body').css('letter-spacing'),
                filter: $('body').css('filter'),
                cursor: $('body').css('cursor'),
                fontFamily: $('body').css('font-family'),
                color: $('body').css('color'),
                backgroundColor: $('body').css('background-color')
            };
            this.previewElement = 'body';
            this.themes = this.loadThemes();
            this.createMenu();
        }

        createMenu() {
            let menu = $('<div>').attr('id', 'accessibilityMenu');
            $('body').append(menu);

            this.createSelect('Apply changes to', ['body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'], (value) => this.setPreviewElement(value));
            this.createSlider('Change Text Size', (value) => this.changeTextSize(value));
            this.createButton('Highlight Links', () => this.highlightLinks());
            this.createSlider('Change Text Spacing', (value) => this.changeTextSpacing(value));
            this.createSlider('Change Saturation', (value) => this.changeSaturation(value));
            this.createToggle('Change Cursor Focus', () => this.changeCursorFocus());
            this.createToggle('Dyslexia Friendly Font', () => this.dyslexiaFriendlyFont());
            this.createToggle('Color Contrast', () => this.colorContrast());
            this.createToggle('Grayscale', () => this.grayscale());
            this.createButton('Text to Speech', () => this.textToSpeech());
            this.createToggle('Keyboard Navigation', () => this.keyboardNavigation());
            this.createToggle('Dark Mode', () => this.darkMode());
            this.createToggle('Alt Text for Images', () => this.altTextForImages());
            this.createButton('Apply Changes', () => this.applyChanges());
            this.createButton('Reset', () => this.reset());
            this.createButton('User Guide', () => this.userGuide());
            this.createSelect('Themes', Object.keys(this.themes), (value) => this.applyTheme(value));
            this.createInput('Save Theme As', (value) => this.saveTheme(value));
        }

        createButton(name, callback) {
            let button = $('<button>').text(name).click(callback);
            $('#accessibilityMenu').append(button);
        }

        createSlider(name, callback) {
            let slider = $('<input>').attr({
                type: 'range',
                min: '0',
                max: '100',
                value: '50',
                class: 'slider',
                id: name.replace(' ', '') + 'Slider'
            }).on('input', function() {
                callback(this.value);
            });

            let label = $('<label>').text(name).append(slider);
            $('#accessibilityMenu').append(label);
        }

        createToggle(name, callback) {
            let toggle = $('<input>').attr({
                type: 'checkbox',
                class: 'toggle',
                id: name.replace(' ', '') + 'Toggle'
            }).change(function() {
                callback(this.checked);
            });

            let label = $('<label>').text(name).append(toggle);
            $('#accessibilityMenu').append(label);
        }

        createSelect(name, options, callback) {
            let select = $('<select>').on('change', function() {
                callback(this.value);
            });

            options.forEach(option => {
                let optionElement = $('<option>').attr('value', option).text(option);
                select.append(optionElement);
            });

            let label = $('<label>').text(name).append(select);
            $('#accessibilityMenu').append(label);
        }

        createInput(name, callback) {
            let input = $('<input>').attr('type', 'text').on('change', function() {
                callback(this.value);
            });

            let label = $('<label>').text(name).append(input);
            $('#accessibilityMenu').append(label);
        }

        setPreviewElement(value) {
            this.previewElement = value;
            this.reset();
        }

        changeTextSize(value) {
            $(this.previewElement).css('font-size', `${value}%`);
            localStorage.setItem('textSize', value);
        }

        highlightLinks() {
            $('a').css('background-color', 'yellow');
        }

        changeTextSpacing(value) {
            $(this.previewElement).css('letter-spacing', `${value}px`);
            localStorage.setItem('textSpacing', value);
        }

        changeSaturation(value) {
            $(this.previewElement).css('filter', `saturate(${value}%)`);
            localStorage.setItem('saturation', value);
        }

        changeCursorFocus(checked) {
            $(this.previewElement).css('cursor', checked ? 'zoom-in' : this.originalStyles.cursor);
            localStorage.setItem('cursorFocus', checked);
        }

        dyslexiaFriendlyFont(checked) {
            $(this.previewElement).css('font-family', checked ? 'Comic Sans MS, sans-serif' : this.originalStyles.fontFamily);
            localStorage.setItem('dyslexiaFont', checked);
        }

        colorContrast(checked) {
            $(this.previewElement).css('filter', checked ? 'contrast(200%)' : this.originalStyles.filter);
            localStorage.setItem('colorContrast', checked);
        }

        grayscale(checked) {
            $(this.previewElement).css('filter', checked ? 'grayscale(100%)' : this.originalStyles.filter);
            localStorage.setItem('grayscale', checked);
        }

        textToSpeech() {
            let text = $(this.previewElement).text();
            let msg = new SpeechSynthesisUtterance(text);
            let previewElement = this.previewElement;
            msg.onstart = function(event) {
                // Highlight the text as it's being read
                $(previewElement).css('background-color', 'yellow');
            };
            msg.onend = function(event) {
                // Remove the highlight when the speech ends
                $(previewElement).css('background-color', '');
            };
            window.speechSynthesis.speak(msg);
        }

        keyboardNavigation(checked) {
            if (checked) {
                $('a').attr('tabindex', '0');
            } else {
                $('a').removeAttr('tabindex');
            }
            localStorage.setItem('keyboardNavigation', checked);
        }

        darkMode(checked) {
            if (checked) {
                $(this.previewElement).css({
                    'color': '#fff',
                    'background-color': '#000'
                });
            } else {
                $(this.previewElement).css({
                    'color': this.originalStyles.color,
                    'background-color': this.originalStyles.backgroundColor
                });
            }
            localStorage.setItem('darkMode', checked);
        }

        altTextForImages(checked) {
            if (checked) {
                $('img').each(function() {
                    let altText = $(this).attr('alt');
                    $(this).attr('title', altText);
                });
            } else {
                $('img').removeAttr('title');
            }
            localStorage.setItem('altTextForImages', checked);
        }

        applyChanges() {
            $(this.previewElement).css({
                'font-size': $('#textSizeSlider').val() + '%',
                'letter-spacing': $('#textSpacingSlider').val() + 'px',
                'filter': 'saturate(' + $('#saturationSlider').val() + '%)',
                'cursor': $('#cursorFocusToggle').is(':checked') ? 'zoom-in' : this.originalStyles.cursor,
                'font-family': $('#dyslexiaFontToggle').is(':checked') ? 'Comic Sans MS, sans-serif' : this.originalStyles.fontFamily,
                'color': $('#darkModeToggle').is(':checked') ? '#fff' : this.originalStyles.color,
                'background-color': $('#darkModeToggle').is(':checked') ? '#000' : this.originalStyles.backgroundColor
            });
        }

        reset() {
            $(this.previewElement).css(this.originalStyles);
            $('a').css('background-color', '');
            $('.slider').val('50');
            $('.toggle').prop('checked', false);
            localStorage.clear();
        }

        userGuide() {
            alert('This is a user guide. It would provide step-by-step instructions on how to use each feature.');
        }

        loadThemes() {
            let themes = localStorage.getItem('themes');
            return themes ? JSON.parse(themes) : {};
        }

        applyTheme(name) {
            let theme = this.themes[name];
            if (!theme) return;

            $('#textSizeSlider').val(theme.textSize);
            $('#textSpacingSlider').val(theme.textSpacing);
            $('#saturationSlider').val(theme.saturation);
            $('#cursorFocusToggle').prop('checked', theme.cursorFocus);
            $('#dyslexiaFontToggle').prop('checked', theme.dyslexiaFont);
            $('#colorContrastToggle').prop('checked', theme.colorContrast);
            $('#grayscaleToggle').prop('checked', theme.grayscale);
            $('#darkModeToggle').prop('checked', theme.darkMode);
            $('#altTextForImagesToggle').prop('checked', theme.altTextForImages);

            this.applyChanges();
        }

        saveTheme(name) {
            this.themes[name] = {
                textSize: $('#textSizeSlider').val(),
                textSpacing: $('#textSpacingSlider').val(),
                saturation: $('#saturationSlider').val(),
                cursorFocus: $('#cursorFocusToggle').is(':checked'),
                dyslexiaFont: $('#dyslexiaFontToggle').is(':checked'),
                colorContrast: $('#colorContrastToggle').is(':checked'),
                grayscale: $('#grayscaleToggle').is(':checked'),
                darkMode: $('#darkModeToggle').is(':checked'),
                altTextForImages: $('#altTextForImagesToggle').is(':checked')
            };

            localStorage.setItem('themes', JSON.stringify(this.themes));
        }
    }

jQuery(() => {
    new AccessibilityMenu();
});