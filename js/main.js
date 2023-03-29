jQuery(() => {
    
        /*
            var language = Cookies.get('language');
                if (language) {
                    // Redirect user to the appropriate language version of the page
                    if (language === 'es' && window.location.pathname !== '/es') {
                        window.location.href = 'https://insane-bh.space/es';
                    } else if (language === 'en' && window.location.pathname !== '/') {
                        window.location.href = 'https://insane-bh.space';
                    }
                } else {
                    // Get user's language from browser preferences
                    var userLang = navigator.language || navigator.userLanguage;

                    // Get user's location using IP geolocation
                    $.getJSON('https://ipapi.co/json/', function(data) {
                        var userCountry = data.country_code;

                        // Check if user's language is not English and country is not the US or Canada
                        if (userLang != 'en' && userCountry != 'US' && userCountry != 'CA') {
                            // Redirect user to Spanish version of the page
                            Cookies.set('language', 'es');
                            window.location.href = 'https://insane-bh.space/es';
                        } else {
                            // Redirect user to English version of the page
                            Cookies.set('language', 'en');
                            window.location.href = 'https://insane-bh.space';
                        }
                    });
                }
        */
                
                    // Check if the user has already given consent or rejected cookies
                    if (getCookie('cookie-consent') === 'true') {
                      // Execute your cookie-related code here
                      console.log('Cookies accepted');
                      var language = Cookies.get('language');
                        if (language) {
                            // Redirect user to the appropriate language version of the page
                            if (language === 'es' && window.location.pathname !== '/es') {
                                window.location.href = 'https://insane-bh.space/es';
                            } else if (language === 'en' && window.location.pathname !== '/') {
                                window.location.href = 'https://insane-bh.space';
                            }
                        } else {
                            // Get user's language from browser preferences
                            var userLang = navigator.language || navigator.userLanguage;

                            // Get user's location using IP geolocation
                            $.getJSON('https://ipapi.co/json/', function(data) {
                                var userCountry = data.country_code;

                                // Check if user's language is not English and country is not the US or Canada
                                if (userLang != 'en' && userCountry != 'US' && userCountry != 'CA') {
                                    // Redirect user to Spanish version of the page
                                    Cookies.set('language', 'es');
                                    window.location.href = 'https://insane-bh.space/es';
                                } else {
                                    // Redirect user to English version of the page
                                    Cookies.set('language', 'en');
                                    window.location.href = 'https://insane-bh.space';
                                }
                            });
                        }
                      // Hide the cookie consent message
                      $('#cookie-consent').hide();
                    } else if (getCookie('cookie-consent') === 'false') {
                      // Hide the cookie consent message
                      $('#cookie-consent').hide();
                    }
                    
                    // When the user clicks the accept button, set a cookie and hide the consent message
                    $('#cookie-accept').click(function() {
                      setCookie('cookie-consent', 'true', 365);
                      $('#cookie-consent').hide();
                    });
                    
                    // When the user clicks the reject button, set a cookie and hide the consent message
                    $('#cookie-reject').click(function() {
                      setCookie('cookie-consent', 'false', 365);
                      $('#cookie-consent').hide();
                    });
                    
                    // If the user is on a language variation site, check if they have already given consent or rejected cookies
                    var languageVariation = window.location.hostname.split('.')[0];
                    if (languageVariation !== 'www' && languageVariation !== '') {
                      if (getCookie('cookie-consent') === 'true' || getCookie('cookie-consent') === 'false') {
                        // Redirect to the main site with the same consent/rejection status
                        var newUrl = 'https://insane-bh.space/?cookie-consent=' + getCookie('cookie-consent');
                        if (window.location.href !== newUrl) {
                          window.location.href = newUrl;
                        }
                      }
                    }
                    
                    // If the user has already given consent or rejected cookies on the main site, set the same status on language variation sites
                    if (getCookie('cookie-consent') === 'true' || getCookie('cookie-consent') === 'false') {
                      var languageVariation = window.location.hostname.split('.')[0];
                      if (languageVariation !== 'www' && languageVariation !== '') {
                        setCookie('cookie-consent', getCookie('cookie-consent'), 365);
                      }
                    }
                  
                  
                  // Function to set a cookie
                  function setCookie(name, value, days) {
                    var expires = '';
                    if (days) {
                      var date = new Date();
                      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                      expires = '; expires=' + date.toUTCString();
                    }
                    document.cookie = name + '=' + value + expires + '; path=/';
                  }
                  
                  // Function to get a cookie value
                  function getCookie(name) {
                    var nameEQ = name + '=';
                    var ca = document.cookie.split(';');
                    for (var i = 0; i < ca.length; i++) {
                      var c = ca[i];
                      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
                    }
                    return null;
                  }

    $.fn.clickToggle = function(func1, func2) {
        var funcs = [func1, func2];
        this.data('toggleclicked', 0);
        this.click(() => {
            var data = $(this).data();
            var tc = data.toggleclicked;
            $.proxy(funcs[tc], this)();
            data.toggleclicked = (tc + 1) % 2;
        });
        return this;
    };
    $(".menu-wrapper").clickToggle(() => {
        $(".burger_menu").css({
            "opacity": "1",
            "z-index": "6"
        });
    }, () => {
        $(".burger_menu").css({
            "opacity": "0",
            "z-index": "-1"
        });
    });

    $('.menu-wrapper').on('click', () => {
        $('.hamburger-menu').toggleClass('animate');
    })

    var scrolllink = $('.scroll');
    scrolllink.click(function(e) {
        e.preventDefault();
        $(".menu-wrapper").trigger("click");
        $('body,html').animate({
            scrollTop: $(this.hash).offset().top
        }, 1000);
    });

    var toMail = $("#to-mail");
    toMail.click(function(e) {
        e.preventDefault();
        $('body,html').animate({
            scrollTop: $(this.hash).offset().top
        }, 1000);
    })

    var scrollBtn = $('.scroll-top-button');

    $(window).scroll(() => {
        var y = $(this).scrollTop();
        if (y > 500) {
            $(scrollBtn).fadeIn().css('z-index', '111111');
        } else {
            $(scrollBtn).fadeOut();
        }
    });

    scrollBtn.click(() => {
        $('body,html').animate({
            scrollTop: $('html').offset().top
        }, 1000);
    });

    $("#esc3").parallaxie({
        speed: 0.8
    });

    let data = $('#letter').attr('data-array');
    data = JSON.parse(data)
    console.log(data)

    var container = $("#letter")
    var index = 0
    const interval = () => {
        container.shuffleLetters({
            "step": 30,
            "fps": 60,
            "text": data[index]
        });

        index++

        if (index === data.length) {
            index = 0;
        }
    }

    setInterval(interval, 4000)

    var form = $('#former-form')
    form.on('submit', function(e) {
        e.preventDefault()
        let tymsg = $(this).attr('data-tymsg')
        let errmsg = $(this).attr('data-errmsg')
        console.log(tymsg, errmsg)
        $.ajax({
            method: 'POST',
            url: 'https://formsubmit.co/ajax/70a19f04e48d9da8774f32b49b924edf',
            dataType: 'json',
            accepts: 'application/json',
            data: {
                name: $('#name').val(),
                mail: $('#mail').val(),
                message: $('#message').val()
            },
            success: (data) => {
                Notification.requestPermission().then(perm => {
                    if (perm === "granted") {
                        new Notification("Your form has been Submitted.", {
                            body: "Congratulations, Soonly our team will be in touch with you.",
                            icon: "img/webiconspace-removebg-preview.png"
                        });
                    }
                });
                form.css('display', 'none');
                $('.form-container').append(tymsg);
            },
            error: (err) => {
                Notification.requestPermission().then(perm => {
                    if (perm === "granted") {
                        new Notification("Your form couldn't be Submitted.", {
                            body: "An error has occurred, try again :(.",
                            icon: "img/webiconspace-removebg-preview.png"
                        });
                    }
                });
                form.css('display', 'none');
                $('.form-container').append(errmsg);
            }
        });

    })

    const shuffleTitles = (elementClass) => {
        let titles = $(elementClass)
        $(titles).each(function() {
            $(this).shuffleLetters({
                "step": 30,
                "fps": 60,
                "text": $(this).attr('data-text')
            })
        })
    }

    var observer = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting === true)
            shuffleTitles('.shuffle')
    }, {
        threshold: [1]
    });

    observer.observe($("#quickresume")[0]);
})