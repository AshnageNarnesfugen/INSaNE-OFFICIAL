// --- ESTADO CENTRAL ---
const state = {
  textSize: 0, // 0-16px, 1-18px, 2-20px
  highlightLinks: false,
  letterSpacing: 0, // 0-normal,1-1px,2-2px
  saturation: 1, // 1-normal,0-grayscale
  cursor: 0, // 0-normal,1-cursor+line
  font: 0 // 0-default,1-dyslexic,2-arial
};

const defaults = {
  textSize: '16px',
  highlightLinks: false,
  letterSpacing: 'normal',
  saturation: 1,
  cursor: 0,
  font: "var(--font-default, 'Arial')"
};

const $focusLine = $('#focus-line');

// --- FUNCIONES MODULARES ---
const actions = {
  textSize() {
    state.textSize = (state.textSize + 1) % 3;
    const sizes = ['16px', '18px', '20px'];
    $('body').css('font-size', sizes[state.textSize]);
  },

  highlightLinks() {
    state.highlightLinks = !state.highlightLinks;
    const $links = $('a');
    if (state.highlightLinks) {
      $('body').addClass('highlighted-links');
      const bg = $('body').css('background-color');
      const color = getContrastingColor(bg);
      $links.css('color', color);
    } else {
      $('body').removeClass('highlighted-links');
      $links.css('color', '');
    }
  },

  letterSpacing() {
    state.letterSpacing = (state.letterSpacing + 1) % 3;
    const spacing = ['normal', '1px', '2px'];
    $('body').css('letter-spacing', spacing[state.letterSpacing]);
  },

  saturation() {
    state.saturation = state.saturation === 1 ? 0 : 1;
    $('body').css('filter', `saturate(${state.saturation})`);
  },

  cursor() {
    state.cursor = (state.cursor + 1) % 2;
    if (state.cursor === 1) {
      $('body').css('cursor',
        "url(\"data:image/svg+xml;utf8,<svg height='40' width='40' xmlns='http://www.w3.org/2000/svg'><circle cx='20' cy='20' r='10' fill='black'/></svg>\") 20 20, auto"
      );
      $focusLine.show();
      $(document).on('mousemove', moveFocusLine);
    } else {
      resetCursor();
    }
  },

  font() {
    state.font = (state.font + 1) % 3;
    switch (state.font) {
      case 0:
        $('body').css('font-family', defaults.font);
        break;
      case 1:
        $('body').css('font-family', "'OpenDyslexic', 'Arial', sans-serif");
        break;
      case 2:
        $('body').css('font-family', "'Arial', sans-serif");
        break;
    }
  },

  reset() {
    state.textSize = 0;
    state.highlightLinks = false;
    state.letterSpacing = 0;
    state.saturation = 1;
    state.font = 0;

    resetCursor();

    $('body').css({
      'font-size': defaults.textSize,
      'letter-spacing': defaults.letterSpacing,
      'filter': `saturate(${defaults.saturation})`,
      'font-family': defaults.font
    });

    $('body').removeClass('highlighted-links');
    $('a').css('color', '');
  }
};

// --- FUNCIONES AUXILIARES ---
function moveFocusLine(e) {
  $focusLine.css('top', `${e.clientY - 25}px`);
}

function resetCursor() {
  $('body').css('cursor', 'auto');
  $focusLine.hide();
  $(document).off('mousemove', moveFocusLine);
}

function getContrastingColor(rgb) {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000' : '#fff';
}

// --- EVENTO GENERAL PARA BOTONES ---
$('.accessibility-menu button').on('click', function () {
  const action = $(this).data('action');
  if (actions[action]) actions[action]();
});