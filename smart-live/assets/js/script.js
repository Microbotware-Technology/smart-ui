(function ($) {

    "use strict";


    /*------------------------------------------
        = ALL ESSENTIAL FUNCTIONS
    -------------------------------------------*/


    // Toggle mobile navigation
    function toggleMobileNavigation() {
        var navbar = $(".navigation-holder");
        var openBtn = $(".mobail-menu .open-btn");
        var xbutton = $(".mobail-menu .navbar-toggler");

        openBtn.on("click", function (e) {
            e.stopImmediatePropagation();
            navbar.toggleClass("slideInn");
            xbutton.toggleClass("x-close");
            return false;
        })
    }

    toggleMobileNavigation();


    // Function for toggle class for small menu
    function toggleClassForSmallNav() {
        var windowWidth = window.innerWidth;
        var mainNav = $("#navbar > ul");

        if (windowWidth <= 991) {
            mainNav.addClass("small-nav");
        } else {
            mainNav.removeClass("small-nav");
        }
    }

    toggleClassForSmallNav();


    // Function for small menu
    function smallNavFunctionality() {
        var windowWidth = window.innerWidth;
        var mainNav = $(".navigation-holder");
        var smallNav = $(".navigation-holder > .small-nav");
        var subMenu = smallNav.find(".sub-menu");
        var megamenu = smallNav.find(".mega-menu");
        var menuItemWidthSubMenu = smallNav.find(".menu-item-has-children > a");

        if (windowWidth <= 991) {
            subMenu.hide();
            megamenu.hide();
            menuItemWidthSubMenu.on("click", function (e) {
                var $this = $(this);
                $this.siblings().slideToggle();
                e.preventDefault();
                e.stopImmediatePropagation();
                $this.toggleClass("rotate");
            })
        } else if (windowWidth > 991) {
            mainNav.find(".sub-menu").show();
            mainNav.find(".mega-menu").show();
        }
    }

    smallNavFunctionality();

  $("body").on("click", function () {
    $('.navigation-holder').removeClass('slideInn');
    $('.open-btn').removeClass('x-close');
});

$(".navigation-holder").on("click", function (e) {
    e.stopPropagation();
});

$(".menu-close").on("click", function (e) {
    e.stopPropagation();
    $('.navigation-holder').removeClass('slideInn');
    $('.open-btn').removeClass('x-close');
}); 


    // toggle1
    $('#toggle1').on("click", function () {
        $('.create-account').slideToggle();
        $('.caupon-wrap.s1').toggleClass('active-border')
    })

    // toggle2
    $('#toggle2').on("click", function () {
        $('#open2').slideToggle();
        $('.caupon-wrap.s2').toggleClass('coupon-2')
    })

    // toggle3
    $('#toggle3').on("click", function () {
        $('#open3').slideToggle();
        $('.caupon-wrap.s2').toggleClass('coupon-2')
    })
    // toggle4
    $('#toggle4').on("click", function () {
        $('#open4').slideToggle();
        $('.caupon-wrap.s3').toggleClass('coupon-2')
    })

    $('.payment-select .addToggle').on('click', function () {
        $('.payment-name').addClass('active')
        $('.payment-option').removeClass('active')
    })


    $('.payment-select .removeToggle').on('click', function () {
        $('.payment-option').addClass('active')
        $('.payment-name').removeClass('active')
    });


    // tooltips

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    /*------------------------------------------
       = TEAM SECTION
   -------------------------------------------*/
    var singleMember = $('.social');
    singleMember.on('click', function () {
        $(this).toggleClass('active');
    });



    if ($(".causes-slider").length) {
        $(".causes-slider").owlCarousel({
            autoplay: true,
            smartSpeed: 300,
            margin: 30,
            loop: true,
            autoplayHoverPause: true,
            dots: false,
            nav: true,
            navText: ['<i class="flaticon-arrow"></i>', '<i class="flaticon-right-arrow"></i>'],
            responsive: {
                0: {
                    items: 1,
                },

                500: {
                    items: 1,
                },

                768: {
                    items: 2,
                    nav: false,
                    dots: true,
                },

                991: {
                    items: 3,

                },
                1200: {
                    items: 3,
                },

                1400: {
                    items: 4
                },
                1599: {
                    items: 5
                },

            }
        });
    }

    if ($(".causes-slider-s2").length) {
        $(".causes-slider-s2").owlCarousel({
            autoplay: true,
            smartSpeed: 300,
            margin: 30,
            loop: true,
            autoplayHoverPause: true,
            dots: false,
            nav: true,
            navText: ['<i class="flaticon-arrow"></i>', '<i class="flaticon-right-arrow"></i>'],
            responsive: {
                0: {
                    items: 1,
                    dots: true,
                },

                500: {
                    items: 1,
                    dots: true,
                },

                768: {
                    items: 2,
                    nav: false,
                    dots: true,
                },

                991: {
                    items: 3,

                },
                1200: {
                    items: 2,
                },

                1400: {
                    items: 3
                },
                1599: {
                    items: 3
                },

            }
        });
    }
    if ($(".causes-slider-s6").length) {
        $(".causes-slider-s6").owlCarousel({
            autoplay: true,
            smartSpeed: 300,
            margin: -10,
            loop: true,
            autoplayHoverPause: true,
            dots: false,
            nav: true,
            navText: ['<i class="flaticon-arrow"></i>', '<i class="flaticon-right-arrow"></i>'],
            responsive: {
                0: {
                    items: 1,
                    dots: true,
                },

                500: {
                    items: 1,
                    dots: true,
                },

                768: {
                    items: 2,
                    nav: false,
                    dots: true,
                },

                991: {
                    items: 3,

                },
                1200: {
                    items: 3,
                },

                1400: {
                    items: 3
                },
                1599: {
                    items: 3
                },

            }
        });
    }

    if ($(".project-slider").length) {
        $(".project-slider").owlCarousel({
            autoplay: false,
            smartSpeed: 300,
            loop: true,
            dots: false,
            nav: false,
            center: true,
            responsive: {
                0: {
                    items: 1,
                },

                500: {
                    items: 1,
                },

                768: {
                    items: 2,
                    nav: false,
                    dots: true,
                },

                991: {
                    items: 2,

                },
                1200: {
                    items: 3,
                },
            }
        });
    }

    if ($(".project-slider-s2").length) {
        $(".project-slider-s2").owlCarousel({
            autoplay: false,
            smartSpeed: 300,
            margin: 30,
            loop: true,
            dots: false,
            nav: false,
            center: true,
            responsive: {
                0: {
                    items: 1,
                },

                500: {
                    items: 1,
                },

                768: {
                    items: 2,
                    nav: false,
                    dots: true,
                },

                991: {
                    items: 2,

                },
                1200: {
                    items: 3,
                },
            }
        });
    }

    if ($(".blog-slider").length) {
        $(".blog-slider").owlCarousel({
            autoplay: false,
            smartSpeed: 300,
            margin: 30,
            loop: true,
            dots: true,
            nav: false,
            responsive: {
                0: {
                    items: 1,
                    dots: true,
                },

                500: {
                    items: 1,
                    dots: true,
                },

                768: {
                    items: 2,
                    nav: false,
                    dots: true,
                },

                991: {
                    items: 2,
                    dots: true,
                },
                1200: {
                    items: 3,
                    dots: true,
                },
            }
        });
    }

    if ($(".instagram-slider").length) {
        $(".instagram-slider").owlCarousel({
            autoplay: true,
            smartSpeed: 200,
            margin: 10,
            loop: true,
            dots: false,
            center: true,
            nav: false,
            responsive: {
                0: {
                    items: 1,
                },

                576: {
                    items: 2,
                },

                768: {
                    items: 3,
                },
                992: {
                    items: 4,
                },

                1200: {
                    items: 4,
                },
                1400: {
                    items: 6,
                },
            }
        });
    }




    if ($(".testimonial-slider").length) {
        $(".testimonial-slider").owlCarousel({
            autoplay: false,
            smartSpeed: 300,
            loop: true,
            dots: false,
            nav: false,
            responsive: {
                0: {
                    items: 1,
                    dots: true,
                },

                500: {
                    items: 1,
                    dots: true,
                },

                768: {
                    items: 2,
                    nav: false,
                    dots: true,
                },

                991: {
                    items: 3,

                },
                1200: {
                    items: 3,
                },
            }
        });
    }


    if ($(".testimonial-slider-s2").length) {
        $('.slider-for').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: true,
            asNavFor: '.slider-nav',
            responsive: [
                {
                    breakpoint: 450,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                    }
                }
            ]
        });
        $('.slider-nav').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            asNavFor: '.slider-for',
            focusOnSelect: true,
            fade: true,
        });
    }
    if ($(".testimonial-slider-s3").length) {
        $('.testimonial-slider-s3').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            dots: true,
            fade: true,
            autoplay: true
        });

    }

    /*------------------------------------------
      service slider s2
  -------------------------------------------*/
    $('.service-slider-s4').slick({
    dots: true,
    arrows: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    pauseOnFocus: true,
    pauseOnDotsHover: true,
    cssEase: 'ease-in-out',
        responsive: [
            {
                breakpoint: 1499,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 2,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 991,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }

        ]
    });



    // HERO SLIDER
    var menu = [];
    jQuery('.swiper-slide').each(function (index) {
        menu.push(jQuery(this).find('.slide-inner').attr("data-text"));
    });
    var interleaveOffset = 0.5;
    var swiperOptions = {
        loop: true,
        speed: 1000,
        parallax: true,
        autoplay: {
            delay: 6500,
            disableOnInteraction: false,
        },
        watchSlidesProgress: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        on: {
            progress: function () {
                var swiper = this;
                for (var i = 0; i < swiper.slides.length; i++) {
                    var slideProgress = swiper.slides[i].progress;
                    var innerOffset = swiper.width * interleaveOffset;
                    var innerTranslate = slideProgress * innerOffset;
                    swiper.slides[i].querySelector(".slide-inner").style.transform =
                        "translate3d(" + innerTranslate + "px, 0, 0)";
                }
            },

            touchStart: function () {
                var swiper = this;
                for (var i = 0; i < swiper.slides.length; i++) {
                    swiper.slides[i].style.transition = "";
                }
            },

            setTransition: function (speed) {
                var swiper = this;
                for (var i = 0; i < swiper.slides.length; i++) {
                    swiper.slides[i].style.transition = speed + "ms";
                    swiper.slides[i].querySelector(".slide-inner").style.transition =
                        speed + "ms";
                }
            }
        }
    };

    var swiper = new Swiper(".swiper-container", swiperOptions);

    // DATA BACKGROUND IMAGE
    var sliderBgSetting = $(".slide-bg-image");
    sliderBgSetting.each(function (indx) {
        if ($(this).attr("data-background")) {
            $(this).css("background-image", "url(" + $(this).data("background") + ")");
        }
    });



    /*------------------------------------------
        = HIDE PRELOADER
    -------------------------------------------*/
    function preloader() {
        if ($('.preloader').length) {
            $('.preloader').delay(100).fadeOut(500, function () {

                //active wow
                wow.init();



            });
        }
    }


    /*------------------------------------------
        = WOW ANIMATION SETTING
    -------------------------------------------*/
    var wow = new WOW({
        boxClass: 'wow',      // default
        animateClass: 'animated', // default
        offset: 0,          // default
        mobile: true,       // default
        live: true        // default
    });


    /*------------------------------------------
        = ACTIVE POPUP IMAGE
    -------------------------------------------*/
    if ($(".fancybox").length) {
        $(".fancybox").fancybox({
            openEffect: "elastic",
            closeEffect: "elastic",
            wrapCSS: "project-fancybox-title-style"
        });
    }


    /*------------------------------------------
        = POPUP VIDEO
    -------------------------------------------*/
    if ($(".video-btn").length) {
        $(".video-btn").on("click", function () {
            $.fancybox({
                href: this.href,
                type: $(this).data("type"),
                'title': this.title,
                helpers: {
                    title: { type: 'inside' },
                    media: {}
                },

                beforeShow: function () {
                    $(".fancybox-wrap").addClass("gallery-fancybox");
                }
            });
            return false
        });
    }


    /*------------------------------------------
        = ACTIVE GALLERY POPUP IMAGE
    -------------------------------------------*/
    if ($(".popup-gallery").length) {
        $('.popup-gallery').magnificPopup({
            delegate: 'a',
            type: 'image',

            gallery: {
                enabled: true
            },

            zoom: {
                enabled: true,

                duration: 300,
                easing: 'ease-in-out',
                opener: function (openerElement) {
                    return openerElement.is('img') ? openerElement : openerElement.find('img');
                }
            }
        });
    }


    /*------------------------------------------
        = FUNCTION FORM SORTING GALLERY
    -------------------------------------------*/
    function sortingGallery() {
        if ($(".sortable-gallery .gallery-filters").length) {
            var $container = $('.gallery-container');
            $container.isotope({
                filter: '*',
                animationOptions: {
                    duration: 750,
                    easing: 'linear',
                    queue: false,
                }
            });

            $(".gallery-filters li a").on("click", function () {
                $('.gallery-filters li .current').removeClass('current');
                $(this).addClass('current');
                var selector = $(this).attr('data-filter');
                $container.isotope({
                    filter: selector,
                    animationOptions: {
                        duration: 750,
                        easing: 'linear',
                        queue: false,
                    }
                });
                return false;
            });
        }
    }

    sortingGallery();


    /*------------------------------------------
        = MASONRY GALLERY SETTING
    -------------------------------------------*/
    function masonryGridSetting() {
        if ($('.masonry-gallery').length) {
            var $grid = $('.masonry-gallery').masonry({
                itemSelector: '.grid-item',
                columnWidth: '.grid-item',
                percentPosition: true
            });

            $grid.imagesLoaded().progress(function () {
                $grid.masonry('layout');
            });
        }
    }

    // masonryGridSetting();







    document.addEventListener("DOMContentLoaded", function () {
        var grid = document.querySelector('.grid');
        if (!grid) {
           
        } else {
           
            new Masonry(grid, {
                itemSelector: '.grid-item',
                columnWidth: '.grid-item',
                percentPosition: true
            });
        }
    });

    /*------------------------------------------
      = FUNFACT
  -------------------------------------------*/
    if ($(".odometer").length) {
        $('.odometer').appear();
        $(document.body).on('appear', '.odometer', function (e) {
            var odo = $(".odometer");
            odo.each(function () {
                var countNumber = $(this).attr("data-count");
                $(this).html(countNumber);
            });
        });
    }



    /*------------------------------------------
        = STICKY HEADER
    -------------------------------------------*/

    // Function for clone an element for sticky menu
    function cloneNavForSticyMenu($ele, $newElmClass) {
        $ele.addClass('original').clone().insertAfter($ele).addClass($newElmClass).removeClass('original');
    }

    // clone home style 1 navigation for sticky menu
    if ($('.wpo-site-header .navigation').length) {
        cloneNavForSticyMenu($('.wpo-site-header .navigation'), "sticky-header");
    }

    var lastScrollTop = '';

    function stickyMenu($targetMenu, $toggleClass) {
        var st = $(window).scrollTop();
        var mainMenuTop = $('.wpo-site-header .navigation');

        if ($(window).scrollTop() > 1000) {
            if (st > lastScrollTop) {
                // hide sticky menu on scroll down
                $targetMenu.removeClass($toggleClass);

            } else {
                // active sticky menu on scroll up
                $targetMenu.addClass($toggleClass);
            }

        } else {
            $targetMenu.removeClass($toggleClass);
        }

        lastScrollTop = st;


    }



    /*------------------------------------------
            = Header search toggle
        -------------------------------------------*/
    if ($(".header-search-form-wrapper").length) {
        var searchToggleBtn = $(".search-toggle-btn");
        var searchToggleBtnIcon = $(".search-toggle-btn i");
        var searchContent = $(".header-search-form");
        var body = $("body");

        searchToggleBtn.on("click", function (e) {
            searchContent.toggleClass("header-search-content-toggle");
            searchToggleBtnIcon.toggleClass("fi flaticon-magnifying-glass fi ti-close");
            e.stopPropagation();
        });

        body.on("click", function () {
            searchContent.removeClass("header-search-content-toggle");
        }).find(searchContent).on("click", function (e) {
            e.stopPropagation();
        });
    }


    /*------------------------------------------
        = Header shopping cart toggle
    -------------------------------------------*/
    if ($(".mini-cart").length) {
        var cartToggleBtn = $(".cart-toggle-btn");
        var cartContent = $(".mini-cart-content");
        var cartCloseBtn = $(".mini-cart-close");
        var body = $("body");

        cartToggleBtn.on("click", function (e) {
            cartContent.toggleClass("mini-cart-content-toggle");
            e.stopPropagation();
        });

        cartCloseBtn.on("click", function (e) {
            cartContent.removeClass("mini-cart-content-toggle");
            e.stopPropagation();
        });

        body.on("click", function () {
            cartContent.removeClass("mini-cart-content-toggle");
        }).find(cartContent).on("click", function (e) {
            e.stopPropagation();
        });
    }


    /*------------------------------------------
        = RECENT CASE SECTION SHOW HIDE
    -------------------------------------------*/
    if ($('.service-thumbs').length) {
        $('.service-thumb').on('click', function (e) {
            e.preventDefault();
            var target = $($(this).attr('data-case'));
            $('.service-thumb').removeClass('active-thumb');
            $(this).addClass('active-thumb');
            $('.service-content .service-data').hide(0);
            $('.service-data').fadeOut(300).removeClass('active-service-data');
            $(target).fadeIn(300).addClass('active-service-data');
        });
    }


    $('.partners-slider').slick({
        infinite: true,
        autoplay: true,
        arrows: false,
        dots: false,
        slidesToShow: 7,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1399,
                settings: {
                    slidesToShow: 6,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 1199,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 991,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 757,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 575,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

    $('.partners-slider-s2').slick({
        infinite: true,
        autoplay: true,
        arrows: false,
        dots: false,
        slidesToShow: 5,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1399,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 1199,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 991,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 757,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 575,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

    $('.partners-slider-s3').slick({
        infinite: true,
        autoplay: true,
        arrows: false,
        dots: false,
        slidesToShow: 6,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1399,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 1199,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 991,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 757,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 575,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });


    /*------------------------------------------
        = SHOP DETAILS PAGE PRODUCT SLIDER
    -------------------------------------------*/
    if ($(".shop-single-slider").length) {
        $('.slider-for').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: true,
            asNavFor: '.slider-nav'
        });
        $('.slider-nav').slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            asNavFor: '.slider-for',
            focusOnSelect: true,
            prevArrow: '<i class="nav-btn nav-btn-lt ti-arrow-left"></i>',
            nextArrow: '<i class="nav-btn nav-btn-rt ti-arrow-right"></i>',

            responsive: [
                {
                    breakpoint: 500,
                    settings: {
                        slidesToShow: 3,
                        infinite: true
                    }
                },
                {
                    breakpoint: 400,
                    settings: {
                        slidesToShow: 2
                    }
                }
            ]

        });
    }


    /*------------------------------------------
        = TOUCHSPIN FOR PRODUCT SINGLE PAGE
    -------------------------------------------*/
    if ($("input[name='product-count']").length) {
        $("input[name='product-count']").TouchSpin({
            verticalbuttons: true
        });
    }

    /*-----------------------
       cart-plus-minus-button 
     -------------------------*/
    $(".cart-plus-minus").append('<div class="dec qtybutton">-</div><div class="inc qtybutton">+</div>');
    $(".qtybutton").on("click", function () {
        var $button = $(this);
        var oldValue = $button.parent().find("input").val();
        if ($button.text() == "+") {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            // Don't allow decrementing below zero
            if (oldValue > 0) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 0;
            }
        }
        $button.parent().find("input").val(newVal);
    });


    /*------------------------------------------
       = BACK TO TOP BTN SETTING
   -------------------------------------------*/
    $("body").append("<a href='#' class='back-to-top'><i class='ti-arrow-up'></i></a>");

    function toggleBackToTopBtn() {
        var amountScrolled = 1000;
        if ($(window).scrollTop() > amountScrolled) {
            $("a.back-to-top").fadeIn("slow");
        } else {
            $("a.back-to-top").fadeOut("slow");
        }
    }

    $(".back-to-top").on("click", function () {
        $("html,body").animate({
            scrollTop: 0
        }, 700);
        return false;
    });


    /*------------------------------------------
        = CONTACT FORM SUBMISSION
    -------------------------------------------*/
    if ($("#contact-form-main").length) {
        $("#contact-form-main").validate({
            rules: {
                name: {
                    required: true,
                    minlength: 2
                },

                email: "required",

                phone: "required",

                subject: {
                    required: true
                }


            },

            messages: {
                name: "Please enter your name",
                email: "Please enter your email address",
                phone: "Please enter your phone number",
                subject: "Please select your contact subject"
            },

            submitHandler: function (form) {
                $.ajax({
                    type: "POST",
                    url: "mail-contact.php",
                    data: $(form).serialize(),
                    success: function () {
                        $("#loader").hide();
                        $("#success").slideDown("slow");
                        setTimeout(function () {
                            $("#success").slideUp("slow");
                        }, 3000);
                        form.reset();
                    },
                    error: function () {
                        $("#loader").hide();
                        $("#error").slideDown("slow");
                        setTimeout(function () {
                            $("#error").slideUp("slow");
                        }, 3000);
                    }
                });
                return false; // required to block normal submit since you used ajax
            }

        });
    }

    /*------------------------------------------
        = CONTACT FORM SUBMISSION2
    -------------------------------------------*/
    if ($("#consultancy-form,#contact-form").length) {
        $("#consultancy-form,#contact-form").validate({
            rules: {
                name: {
                    required: true,
                    minlength: 2
                },

                email: "required",

                phone: "required",

                subject: {
                    required: true
                }


            },

            messages: {
                name: "Please enter your name",
                email: "Please enter your email address",
                phone: "Please enter your phone number",
                subject: "Please select your contact subject"
            },

            submitHandler: function (form) {
                $.ajax({
                    type: "POST",
                    url: "mail-contact.php",
                    data: $(form).serialize(),
                    success: function () {
                        $("#loader").hide();
                        $("#success").slideDown("slow");
                        setTimeout(function () {
                            $("#success").slideUp("slow");
                        }, 3000);
                        form.reset();
                    },
                    error: function () {
                        $("#loader").hide();
                        $("#error").slideDown("slow");
                        setTimeout(function () {
                            $("#error").slideUp("slow");
                        }, 3000);
                    }
                });
                return false; // required to block normal submit since you used ajax
            }

        });
    }



    /*==========================================================================
        WHEN DOCUMENT LOADING
    ==========================================================================*/
    $(window).on('load', function () {

        preloader();
        masonryGridSetting();
        sortingGallery();

        toggleMobileNavigation();

        smallNavFunctionality();
    });



    /*==========================================================================
        WHEN WINDOW SCROLL
    ==========================================================================*/
    $(window).on("scroll", function () {

        if ($(".wpo-site-header").length) {
            stickyMenu($('.wpo-site-header .navigation'), "sticky-on");
        }

        toggleBackToTopBtn();

    });


    /*==========================================================================
        WHEN WINDOW RESIZE
    ==========================================================================*/
    $(window).on("resize", function () {
        toggleClassForSmallNav();
        //smallNavFunctionality();

        clearTimeout($.data(this, 'resizeTimer'));
        $.data(this, 'resizeTimer', setTimeout(function () {
            smallNavFunctionality();
        }, 200));
    });

})(window.jQuery);
/*---- Load Customer Support Widget ----*/
(function () {
    var s = document.createElement("script");
    s.src = "assets/js/customer-support.js";
    s.async = true;
    document.body.appendChild(s);
})();

/* =========================================
   LOAD CLICK TRACKER (tel / mailto / wa.me)
   ========================================= */
(function () {
    var s = document.createElement("script");
    s.src = "assets/js/click-tracker.js?v=1";
    s.async = true;
    document.body.appendChild(s);
})();







function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.addEventListener("DOMContentLoaded", function () {
    var tablinks = document.getElementsByClassName("tablinks");
    if (tablinks.length > 0) {
        tablinks[0].click();
    }
});


/* accordion js */
document.addEventListener('DOMContentLoaded', function () {
    const headers = document.querySelectorAll('.accordion-header');

    headers.forEach(header => {
        header.addEventListener('click', function () {
            const item = this.parentElement;
            const isActive = item.classList.contains('active');

            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
            });

            // Toggle the current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});




$(document).on("click", ".amount-btn", function () {

    $(".amount-btn").removeClass("active");


    $(this).addClass("active");


    let buttonValue = $(this).text();


    $(".addAmount-value").val(buttonValue);
});





/* comment from js */

document.addEventListener('DOMContentLoaded', function () {
    let form = document.getElementById('commentForm');

    if (form) {
        form.addEventListener('submit', function (event) {

            clearErrors();

            let isValid = true;

            if (!form.name.value.trim()) {
                showError('nameError', 'Name is required.');
                isValid = false;
            }

            if (!form.email.validity.valid) {
                showError('emailError', 'Please enter a valid email address.');
                isValid = false;
            }

            if (!form.phone.validity.valid) {
                showError('phoneError', 'Phone number must be 10 digits.');
                isValid = false;
            }

            if (!form.website.validity.valid) {
                showError('websiteError', 'Please enter a valid URL.');
                isValid = false;
            }

            if (!form.comment.value.trim()) {
                showError('commentError', 'Message is required.');
                isValid = false;
            }

            if (!isValid) {
                event.preventDefault();
            } else {
                document.getElementById('submit').disabled = true;
                document.getElementById('loading').style.display = 'block';

                setTimeout(function () {
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('submit').disabled = false; n


                    alert('Form submitted successfully!');
                }, 3000);
            }
        });
    } else {

    }

    function showError(fieldId, message) {
        document.getElementById(fieldId).textContent = message;
    }

    function clearErrors() {
        const errorFields = document.querySelectorAll('.error-message');
        errorFields.forEach(function (errorField) {
            errorField.textContent = '';
        });
    }
});


function selectAmount(amount) {
    const selectedValueInput = document.getElementById('selectedValue');
    selectedValueInput.value = amount;
    selectedValueInput.setAttribute('readonly', true);

    const buttons = document.querySelectorAll('.amount');
    buttons.forEach(button => button.classList.remove('selected'));


    const selectedButton = [...buttons].find(button => button.textContent.includes(`$${amount}`));
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }
}

function selectCustomAmount() {
    const selectedValueInput = document.getElementById('selectedValue');

    const buttons = document.querySelectorAll('.amount');
    buttons.forEach(button => button.classList.remove('selected'));


    selectedValueInput.removeAttribute('readonly');
    selectedValueInput.focus();
}


function validateForm() {
    let isValid = true;

    document.getElementById('emailError').innerText = '';
    document.getElementById('phoneError').innerText = '';
    document.getElementById('addressError').innerText = '';
    document.getElementById('messageError').innerText = '';
    document.getElementById('paymentMethodError').innerText = '';

    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const message = document.getElementById('message').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');

    if (!email) {
        document.getElementById('emailError').innerText = 'Email is required.';
        isValid = false;
    }

    if (!phone) {
        document.getElementById('phoneError').innerText = 'Phone number is required.';
        isValid = false;
    } else if (!/^[0-9]{11}$/.test(phone)) {
        document.getElementById('phoneError').innerText = 'Please enter a valid 11-digit phone number.';
        isValid = false;
    }

    if (!address) {
        document.getElementById('addressError').innerText = 'Address is required.';
        isValid = false;
    }
    if (!message) {
        document.getElementById('messageError').innerText = 'Message is required.';
        isValid = false;
    }

    if (!paymentMethod) {
        document.getElementById('paymentMethodError').innerText = 'Please select a payment method.';
        isValid = false;
    }

    return isValid;
}

function submitForm() {
    if (validateForm()) {
        const successMessage = document.getElementById('successMessage');
        successMessage.style.display = 'block';

        setTimeout(() => {
            location.reload();
        }, 2000);
    }
}

/* widget-donet */

function selectPresetAmount(amount) {
    const donationAmountInput = document.getElementById('donationAmountInput');
    donationAmountInput.value = amount;
    donationAmountInput.setAttribute('readonly', true);

    // Deselect all buttons
    const buttons = document.querySelectorAll('.preset-amount');
    buttons.forEach(button => button.classList.remove('selected'));

    // Highlight selected button
    const selectedButton = [...buttons].find(button => button.textContent.includes(`$${amount}`));
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }
}

function selectCustomAmount() {
    const donationAmountInput = document.getElementById('donationAmountInput');

    // Deselect all preset amount buttons
    const buttons = document.querySelectorAll('.preset-amount');
    buttons.forEach(button => button.classList.remove('selected'));

    // Enable input for custom value
    donationAmountInput.removeAttribute('readonly');
    donationAmountInput.value = '';  // Clear previous value
    donationAmountInput.focus();
}

document.addEventListener('DOMContentLoaded', function () {
    // Your JavaScript code goes here
    const donationAmountInput = document.getElementById('donationAmountInput');
    const donateButton = document.querySelector('.donate-button');

    if (donationAmountInput) {
        donationAmountInput.addEventListener('input', function () {
            const value = this.value;
            if (value !== '' && (isNaN(value) || value <= 0)) {
                alert('Please enter a valid positive number');
                this.value = '';
            }
        });
    }

    if (donateButton) {
        donateButton.addEventListener('click', function (event) {
            const paymentOptionSelected = document.querySelector('input[name="paymentOption"]:checked');
            if (!paymentOptionSelected) {
                document.getElementById('paymentOptionError').textContent = 'Please select a payment method.';
                event.preventDefault();
            } else {
                document.getElementById('paymentOptionError').textContent = '';
                // Proceed with form submission logic
            }
        });
    }
});


// Payment method validation (example)
document.addEventListener('DOMContentLoaded', function () {
    const donateButton = document.querySelector('.donate-button');

    if (donateButton) {  // Check if the button exists
        donateButton.addEventListener('click', function (event) {
            const paymentOptionSelected = document.querySelector('input[name="paymentOption"]:checked');
            if (!paymentOptionSelected) {
                document.getElementById('paymentOptionError').textContent = 'Please select a payment method.';
                event.preventDefault(); // Prevent form submission if no method is selected
            } else {
                document.getElementById('paymentOptionError').textContent = '';
                // Proceed with form submission logic
            }
        });
    } else {

    }
});

// Mobile: tap/touch → pause; 5 sec idle → resume
(function () {
    var $s = $('.service-slider-s4');
    if (!$s.length) return;
    var resumeTimer = null;

    $s.on('touchstart', function () {
        try { $s.slick('slickPause'); } catch(e) {}
        clearTimeout(resumeTimer);
    });

    $s.on('touchend touchcancel', function () {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function () {
            try { $s.slick('slickPlay'); } catch(e) {}
        }, 5000);   // 5 sec idle → resume
    });
})();