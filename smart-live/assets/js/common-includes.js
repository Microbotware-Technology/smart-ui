/**
 * Smart Help Foundation - Common Header / Footer Includes
 * --------------------------------------------------------
 * Injects the standardized header and footer into #site-header
 * and #site-footer placeholders.
 *
 * IMPORTANT:
 * This script MUST be loaded BEFORE assets/js/script.js so that
 * script.js can bind to the injected elements on first run.
 *
 * Dropdown behavior relies on the existing .menu-item-has-children
 * and .sub-menu classes handled by script.js (smallNavFunctionality).
 *
 * Dropdown parents ("What We Do" and "Our Work") navigate to real
 * pages on desktop click. On mobile, script.js's smallNavFunctionality
 * calls preventDefault() so tapping them only toggles the submenu.
 */

(function () {
    'use strict';
    var HEADER_HTML = `<header id="header">
    <div class="topbar">
        <div class="container-fluid">
            <div class="row align-items-center">
                <div class="col-lg-6 col-12">
                    <ul class="contact-info">
                        <li><i class="ti-email"></i><span>office@smarthelpfoundation.org</span></li>
                        <li>
                            <a href="tel:+917601866602">
                                <i class="flaticon-phone"></i><span>+91 7601866602</span>
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="col-lg-6 col-12">
    <div class="contact-into">
        <ul class="social-pills">
            <li>
                <a href="https://wa.me/917601866602"
                   target="_blank" rel="noopener"
                   class="pill pill-wa"
                   aria-label="Chat on WhatsApp"
                   title="Chat on WhatsApp">
                    <i class="fa-brands fa-whatsapp"></i>
                    <span>WhatsApp</span>
                </a>
            </li>
            <li>
                <a href="https://www.instagram.com/smart_help_foundation"
                   target="_blank" rel="noopener"
                   class="pill pill-ig"
                   aria-label="Follow on Instagram"
                   title="Follow on Instagram">
                    <i class="flaticon-camera"></i>
                    <span>Instagram</span>
                </a>
            </li>
        </ul>
    </div>
</div>
            </div>
        </div>
    </div>
    <div class="midbar">
        <div class="container-fluid">
            <div class="row align-items-center">
                <div class="col-lg-3 col-12">
                    <a href="index.html" class="logo-mid">
                        <img src="assets/images/logo_2.png" alt="Smart Help Foundation">
                    </a>
                </div>
                <div class="col-lg-9 col-12">
                    <ul>
                        <li>
                            <div class="icon"><i class="flaticon-clock"></i></div>
                            <div class="text">
                                <h3>Opening Hours</h3>
                                <span>Mon _ Sat: 9.00 to 18.00</span>
                            </div>
                        </li>
                        <li>
                            <div class="icon"><i class="fi flaticon-home-address"></i></div>
                            <div class="text">
                                <h3>Our Address</h3>
                                <span>Villupuram, Tamilnadu, 605 601</span>
                            </div>
                        </li>
                        <li>
                            <div class="icon"><i class="flaticon-phone-1"></i></div>
                            <div class="text">
                                <h3>Contact Us</h3>
                                <span>+91 7601866602</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="wpo-site-header">
        <nav class="navigation navbar navbar-expand-lg navbar-light">
            <div class="container-fluid">
                <div class="row align-items-center">
                    <div class="col-lg-3 col-md-3 col-3 d-lg-none dl-block">
                        <div class="mobail-menu">
                            <button type="button" class="navbar-toggler open-btn">
                                <span class="sr-only">Toggle navigation</span>
                                <span class="icon-bar first-angle"></span>
                                <span class="icon-bar middle-angle"></span>
                                <span class="icon-bar last-angle"></span>
                            </button>
                        </div>
                    </div>
                    <div class="col-lg-0 col-md-6 col-6">
                        <div class="navbar-header">
                            <a class="navbar-brand" href="index.html">
                                <img src="assets/images/logo_2.png" alt="Smart Help Foundation">
                            </a>
                        </div>
                    </div>
                    <div class="col-lg-7 col-md-1 col-1">
                        <div id="navbar" class="collapse navbar-collapse navigation-holder">
                            <button class="menu-close"><i class="ti-close"></i></button>
                            <ul class="nav navbar-nav mb-2 mb-lg-0">
                                <li><a href="index.html">Home</a></li>
                                <li><a href="about.html">About</a></li>
                                <!-- <li><a href="causes.html">Our Causes</a></li> -->
                            
                                <!-- <li class="menu-item-has-children">
                                    <a href="portfolio.html">Our Work</a>
                                    <ul class="sub-menu">
                                        <li><a href="portfolio.html">Portfolio</a></li>
                                        <li><a href="gallery.html">Gallery</a></li>
                                    </ul>
                                </li> -->
                                <!-- <li><a href="event.html">Events</a></li> -->
                                <li><a href="contact.html">Contact</a></li>
                                <li><a href="donate.html">Donate</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-lg-5 col-md-2 col-2">
                        <div class="header-right">
                            <div class="header-search-form-wrapper">
                                <div class="cart-search-contact">
                                    <!--button class="search-toggle-btn"><i class="fi flaticon-magnifying-glass"></i></button-->
                                    <div class="header-search-form">
                                        <form>
                                            <div>
                                                <input type="text" class="form-control" placeholder="Search here...">
                                                <button type="submit"><i class="fi flaticon-magnifying-glass"></i></button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div class="close-form">
                                <a class="theme-btn" href="/donate"
                                   onclick="window.location.href='/donate'; return false;">Donate now</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </div>
<div class="mobile-contact-bar">
    <a href="tel:+917601866602" aria-label="Call">
        <i class="flaticon-phone"></i>
        <span>+91 7601866602</span>
    </a>
    <a href="mailto:office@smarthelpfoundation.org" class="mob-email" aria-label="Email">
        <i class="ti-email"></i>
        <span>office@smarthelpfoundation.org</span>
    </a>
    <a href="https://wa.me/917601866602" target="_blank" rel="noopener"
       class="mob-pill mob-pill-wa" aria-label="WhatsApp">
        <i class="fa-brands fa-whatsapp"></i>
        <span>WhatsApp</span>
    </a>
    <a href="https://www.instagram.com/smart_help_foundation" target="_blank" rel="noopener"
       class="mob-pill mob-pill-ig" aria-label="Instagram">
        <i class="flaticon-camera"></i>
        <span>Instagram</span>
    </a>
</div>
</header>`;

    /* --------------------------------------------------------------------
     * FOOTER (unchanged)
     * ------------------------------------------------------------------ */
    var FOOTER_HTML = `<footer class="wpo-site-footer">
<div class="footer-socialicon">
    <div class="social-marquee">
        <ul class="social-track">

            <li>
                <a href="https://www.instagram.com/smart_help_foundation"
                   target="_blank" rel="noopener">
                    <i class="flaticon-camera"></i> <span>Instagram</span>
                </a>
            </li>
            <li>
                <a href="donate.html" target="_blank" rel="noopener" data-donate-link>
                    <i class="fa-solid fa-heart"></i> <span>Donate</span>
                </a>
            </li>
            <li>
                <a href="contact.html" target="_blank" rel="noopener">
                    <i class="fa-solid fa-envelope"></i> <span>Contact</span>
                </a>
            </li>

            <li aria-hidden="true">
                <a href="https://www.instagram.com/smart_help_foundation"
                   target="_blank" rel="noopener" tabindex="-1">
                    <i class="flaticon-camera"></i> <span>Instagram</span>
                </a>
            </li>
            <li aria-hidden="true">
                <a href="donate.html" target="_blank" rel="noopener" tabindex="-1" data-donate-link>
                    <i class="fa-solid fa-heart"></i> <span>Donate</span>
                </a>
            </li>
            <li aria-hidden="true">
                <a href="contact.html" target="_blank" rel="noopener" tabindex="-1">
                    <i class="fa-solid fa-envelope"></i> <span>Contact</span>
                </a>
            </li>

            <li aria-hidden="true">
                <a href="https://www.instagram.com/smart_help_foundation"
                   target="_blank" rel="noopener" tabindex="-1">
                    <i class="flaticon-camera"></i> <span>Instagram</span>
                </a>
            </li>
            <li aria-hidden="true">
                <a href="donate.html" target="_blank" rel="noopener" tabindex="-1" data-donate-link>
                    <i class="fa-solid fa-heart"></i> <span>Donate</span>
                </a>
            </li>
            <li aria-hidden="true">
                <a href="contact.html" target="_blank" rel="noopener" tabindex="-1">
                    <i class="fa-solid fa-envelope"></i> <span>Contact</span>
                </a>
            </li>

            <li aria-hidden="true">
                <a href="https://www.instagram.com/smart_help_foundation"
                   target="_blank" rel="noopener" tabindex="-1">
                    <i class="flaticon-camera"></i> <span>Instagram</span>
                </a>
            </li>
            <li aria-hidden="true">
                <a href="donate.html" target="_blank" rel="noopener" tabindex="-1" data-donate-link>
                    <i class="fa-solid fa-heart"></i> <span>Donate</span>
                </a>
            </li>
            <li aria-hidden="true">
                <a href="contact.html" target="_blank" rel="noopener" tabindex="-1">
                    <i class="fa-solid fa-envelope"></i> <span>Contact</span>
                </a>
            </li>

        </ul>
    </div>
</div>

<div class="wpo-upper-footer">
    <div class="container">
        <div class="row">

            <!-- Column 1: Donate Now -->
            <div class="col col-lg-4 col-md-4 col-6">
                <div class="widget newsletter-s2 wow fadeInUp" data-wow-delay="0.2s">
                    <div class="widget-title"><h3>Donate Now</h3></div>
                    <p>"Your kindness can change lives. Every donation brings hope, food, and smiles to those in need."</p>
                </div>
            </div>

            <!-- Column 2: Useful Links -->
            <div class="col col-lg-4 col-md-4 col-6">
                <div class="widget link-widget wow fadeInUp" data-wow-delay="0.2s">
                    <div class="widget-title"><h3>Useful Links</h3></div>
                    <ul>
                        <li><a href="about.html">About</a></li>
                        <li><a href="contact.html">Contact</a></li>
                        <li><a href="donate.html">Donate</a></li>
                    </ul>
                </div>
            </div>

            <!-- Column 3: Locations + Contact (nested) -->
<div class="col col-lg-4 col-md-4 col-12">
    <div class="row">

        <!-- Locations (address only) -->
        <div class="col-lg-12 col-md-12 col-6">
            <div class="widget locations-widget wow fadeInUp" data-wow-delay="0.0s">
                <div class="widget-title"><h3>Location</h3></div>
                <p>Villupuram, Tamilnadu, <br> India -605601</p>
            </div>
        </div>

        <!-- Contact (email + phone) -->
        <div class="col-lg-12 col-md-12 col-6">
            <div class="widget locations-widget contact-widget wow fadeInUp" data-wow-delay="0.0s">
                <div class="widget-title"><h3>Contact</h3></div>
                <ul>
                    <li><a href="mailto:office@smarthelpfoundation.org">office@smarthelpfoundation.org</a></li>
                    <li><a href="tel:+917601866602">+91 7601866602</a></li>
                </ul>
            </div>
        </div>

    </div>
</div>

        </div>
    </div>
</div>

    <div class="wpo-lower-footer">
        <div class="container">
            <div class="row">
                <div class="col col-xs-12">
                    <p class="copyright"> &copy; <span id="current-year">2024</span>  <a href="index.html">Smart Help Foundation</a> - non profit. All rights reserved.</p>
                </div>
            </div>
        </div>
    </div>
    <div class="shape"><img src="assets/images/f-shape1.svg" alt=""></div>
    <div class="shape1"><img src="assets/images/f-shape-2.svg" alt=""></div>
    <div class="shape2"><img src="assets/images/f-shape3.svg" alt=""></div>
    <div class="shape3"><img src="assets/images/f-shape4.svg" alt=""></div>
</footer>`;

    function injectTopbarPillStyles() {
    if (document.getElementById('shf-topbar-pill-css')) return;

    var style = document.createElement('style');
    style.id = 'shf-topbar-pill-css';
    style.textContent = `
.topbar .social-pills {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
}
.topbar .social-pills li {
    margin: 0;
    padding: 0;
    list-style: none;
}
.topbar .social-pills a.pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border-radius: 50px;
    background: #f0f0f0;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    color: #333;
    line-height: 1.2;
    white-space: nowrap;
    transition: background .2s ease;
}
.topbar .social-pills a.pill:hover,
.topbar .social-pills a.pill:focus {
    background: #e4e4e4;
    color: #333;
    text-decoration: none;
}
.topbar .social-pills a.pill i {
    font-size: 16px;
    line-height: 1;
    flex-shrink: 0;
}
.topbar .social-pills a.pill-wa i { color: #25D366; }
.topbar .social-pills a.pill-ig i { color: #E4405F; }

@media (max-width: 767px) {
    .topbar .social-pills { gap: 6px; }
    .topbar .social-pills a.pill {
        padding: 5px 9px;
        gap: 0;
        min-width: 32px;
        justify-content: center;
    }
    .topbar .social-pills a.pill span { display: none; }
    .topbar .social-pills a.pill i { font-size: 17px; }
}
    `;
    document.head.appendChild(style);
}

function injectHeaderAndFooter() {
    var headerEl = document.getElementById('site-header');
    var footerEl = document.getElementById('site-footer');

    if (headerEl && headerEl.children.length === 0) {
        headerEl.innerHTML = HEADER_HTML;
    }
    if (footerEl && footerEl.children.length === 0) {
        footerEl.innerHTML = FOOTER_HTML;
    }

    injectTopbarPillStyles();

    if (window.WOW) {
        try {
            new WOW({ mobile: true, live: true }).init();
        } catch (e) {}
    }
    document.getElementById('current-year').textContent = new Date().getFullYear();
}

/* ============================================================
   SMART DONATE LINK
   - Normal page → donate.html (new tab)
   - Already on donate.html → href="#" (no reload, no new tab)
   ============================================================ */
function fixDonateMarqueeLink() {
    var current = getCurrentPage();               // e.g. "donate.html"
    var isDonatePage = (current === 'donate.html');

    var links = document.querySelectorAll('#site-footer [data-donate-link]');
    for (var i = 0; i < links.length; i++) {
        var a = links[i];

        if (isDonatePage) {
            // Already on donate page → make it a dead link (#)
            a.setAttribute('href', '#');
            a.removeAttribute('target');
            a.removeAttribute('rel');
            // Hard-stop: prevent any navigation / reload
            if (!a.dataset.boundNoReload) {
                a.dataset.boundNoReload = '1';
                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
        } else {
            // Other pages → open donate page in new tab
            a.setAttribute('href', 'donate.html');
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener');
        }
    }
}

       function getCurrentPage() {
        var path = window.location.pathname || '/';
        var segments = path.split('/').filter(function (s) { return s.length > 0; });
        var current = segments.length ? segments[segments.length - 1] : '';

        if (current === '' || current === 'index' || current === 'index.html') {
            return 'index.html';
        }

        current = current.split('?')[0].split('#')[0];
        if (current.indexOf('.') !== -1) {
            current = current.substring(0, current.lastIndexOf('.'));
        }
        return current + '.html';
    }

    function setActiveNavLink() {
        var current = getCurrentPage();

        var oldActive = document.querySelectorAll('#site-header .navbar-nav a.active');
        for (var k = 0; k < oldActive.length; k++) {
            oldActive[k].classList.remove('active');
        }

        var links = document.querySelectorAll('#site-header .navbar-nav a');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];

            if (link.getAttribute('data-no-active') === 'true') continue;

            var href = link.getAttribute('href') || '';
            if (!href || href === '#' || href.indexOf('javascript:') === 0) continue;

            var hrefBase = href.split('/').pop().split('?')[0].split('#')[0];

            if (hrefBase === '' || hrefBase === 'index' || hrefBase === 'index.html') {
                hrefBase = 'index.html';
            } else if (hrefBase.indexOf('.') !== -1) {
                hrefBase = hrefBase.substring(0, hrefBase.lastIndexOf('.')) + '.html';
            } else {
                hrefBase = hrefBase + '.html';
            }

            if (hrefBase === current) {
                link.classList.add('active');

                var parentLi = link.parentElement;
                var parentUl = parentLi ? parentLi.parentElement : null;
                if (parentUl && parentUl.classList.contains('sub-menu')) {
                    var topLi = parentUl.parentElement;
                    if (topLi) {
                        var topA = topLi.querySelector(':scope > a');
                        if (topA) topA.classList.add('active');
                    }
                }
            }
        }
    }

    injectHeaderAndFooter();
    fixDonateMarqueeLink();
    setActiveNavLink();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            injectHeaderAndFooter();
            fixDonateMarqueeLink();
            setActiveNavLink();
        });
    }
})();

// /* ============================================================
//    Auto-load preloader fix CSS + JS on every page
//    ============================================================ */
// (function () {
//     // Inject CSS
//     if (!document.querySelector('link[href*="preloader-fix.css"]')) {
//         var link = document.createElement('link');
//         link.rel = 'stylesheet';
//         link.href = 'assets/css/preloader-fix.css';
//         document.head.appendChild(link);
//     }

//     // Inject JS
//     if (!document.querySelector('script[src*="preloader-fix.js"]')) {
//         var s = document.createElement('script');
//         s.src = 'assets/js/preloader-fix.js';
//         s.defer = true;
//         document.body.appendChild(s);
//     }
// })();