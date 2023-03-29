jQuery(() => {
    
    // Get all the image elements on the page
    var images = $('img');

    // Add click event listeners to all the images
    images.click(function() {
        // Get the source of the clicked image
        var src = $(this).attr('src');

        // Create a new modal and append it to the body
        var modal = $('<div class="modal">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<img class="modal-img" src="' + src + '">' +
        '</div>' +
        '</div>' +
        '</div>');
        modal.appendTo('body');

        // Show the modal and overlay
        modal.show();
        $('body').css('overflow', 'hidden')
        // Add a click event listener to the close button and overlay to remove the modal and overlay from the body
        modal.click(function() {
            modal.hide();
            modal.remove();
            $('body').css('overflow', 'visible')
        });
        
    });

    window.cookieconsent.initialise({
        "palette": {
          "popup": {
            "background": "#252e39",
            "text": "#ffffff"
          },
          "button": {
            "background": "#14a7d0",
            "text": "#ffffff"
          }
        },
        "content": {
          "message": "This website uses cookies to ensure you get the best experience on our website.",
          "dismiss": "Got it!",
          "link": "Learn More",
          "href": "https://www.example.com/cookies"
        },
        "position": "bottom-right",
        "onInitialise": function(status) {
          if (status === 'deny') {
            // User has denied cookies, do something here
          }
        },
        "onStatusChange": function(status) {
          if (status === 'deny') {
            // User has denied cookies, do something here
          }
        },
        "law": {
          "regionalLaw": true
        },
        "type": "opt-in",
        "revokable": true,
        "revokeBtn": '<div class="cc-revoke {{classes}}">{{buttonText}}</div>'
      });

       
            // Add code here to enable cookie functionality, such as tracking user preferences or analytics data
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