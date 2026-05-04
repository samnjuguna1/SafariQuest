/**
 * SafariQuest — shared chrome (navbar + footer).
 * Include once before other scripts at the end of <body>.
 * Markers: <div id="sq-nav-root"></div> (top of body),
 *           <div id="sq-footer-root"></div> (before this script).
 * Body: data-nav-active="home|destinations|hotels|restaurants|events|about|contact"
 * Skip: <body data-sq-skip-chrome="true">
 */
(function () {
  if (typeof document === 'undefined') return;

  function run() {
    var body = document.body;
    if (!body || body.getAttribute('data-sq-skip-chrome') === 'true') return;

    var navRoot = document.getElementById('sq-nav-root');
    var footRoot = document.getElementById('sq-footer-root');
    if (!navRoot && !footRoot) return;

    var active = (body.getAttribute('data-nav-active') || '').trim().toLowerCase();

    var NAV_ROWS = [
      ['home', 'index.html', 'Home'],
      ['destinations', 'destinations.html', 'Destinations'],
      ['hotels', 'hotels.html', 'Hotels'],
      ['restaurants', 'restaurants.html', 'Restaurants'],
      ['events', 'events.html', 'Events'],
      ['about', 'about.html', 'About Us'],
      ['contact', 'contact.html', 'Contact']
    ];

    function navLinksHtml() {
      return NAV_ROWS.map(function (row) {
        var id = row[0];
        var href = row[1];
        var label = row[2];
        var cls = id === active ? ' class="active"' : '';
        return '<li><a href="' + href + '" data-sq-nav="' + id + '"' + cls + '>' + label + '</a></li>';
      }).join('');
    }

    var NAV_HTML =
      '<nav id="navbar">' +
      '<a class="logo" href="index.html">' +
      '<img src="logo.jpeg" alt="SafariQuest" class="logo-img" width="36" height="36" />' +
      '<div class="logo-text">' +
      '<span class="logo-name">SafariQuest</span>' +
      '<span class="logo-slogan">Discover. Explore. Experience.</span>' +
      '</div></a>' +
      '<ul class="nav-links" id="navLinks">' +
      navLinksHtml() +
      '</ul>' +
      '<div class="nav-actions">' +
      '<a href="login.html" class="btn-nav-outline nav-login">Login</a>' +
      '<a href="register.html" class="btn-solid nav-register">Sign Up</a>' +
      '</div>' +
      '<button type="button" class="nav-hamburger" id="navHamburger" aria-label="Toggle menu">' +
      '<span></span><span></span><span></span>' +
      '</button></nav>';

    var FOOTER_HTML =
      '<footer class="footer">' +
      '<div class="footer-container">' +
      '<div class="footer-brand">' +
      '<div class="footer-logo-block">' +
      '<img src="logo.jpeg" alt="SafariQuest" class="footer-logo-img" width="52" height="52" />' +
      '<div class="footer-logo-text">' +
      '<span class="footer-logo-name">SafariQuest</span>' +
      '<span class="footer-logo-slogan">Discover. Explore. Experience.</span>' +
      '</div></div>' +
      '<p>Your premier destination for discovering and booking authentic Kenyan travel experiences. Connecting travelers with unforgettable adventures.</p>' +
      '<div class="footer-socials">' +
      '<a href="https://facebook.com" class="social-btn" title="Facebook" target="_blank" rel="noopener noreferrer">' +
      '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>' +
      '<a href="https://twitter.com" class="social-btn" title="Twitter" target="_blank" rel="noopener noreferrer">' +
      '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg></a>' +
      '<a href="https://instagram.com" class="social-btn" title="Instagram" target="_blank" rel="noopener noreferrer">' +
      '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>' +
      '</div></div>' +
      '<div class="footer-links-col">' +
      '<h4>Explore</h4><ul>' +
      '<li><a href="index.html">Home</a></li>' +
      '<li><a href="destinations.html">Destinations</a></li>' +
      '<li><a href="hotels.html">Hotels</a></li>' +
      '<li><a href="restaurants.html">Restaurants</a></li>' +
      '<li><a href="events.html">Events</a></li>' +
      '<li><a href="about.html">About Us</a></li>' +
      '<li><a href="contact.html">Contact</a></li>' +
      '<li><a href="terms.html">Terms of Service</a></li>' +
      '<li><a href="privacy.html">Privacy Policy</a></li>' +
      '</ul></div>' +
      '<div class="footer-contact-col">' +
      '<h4>Contact Info</h4>' +
      '<p>📧 <a href="mailto:info@safariquest.com">info@safariquest.com</a></p>' +
      '<p>📞 <a href="tel:+254798595394">+254 798 595 394</a></p>' +
      '<p>📍 Nairobi, Kenya</p>' +
      '</div></div>' +
      '<div class="footer-bottom">' +
      '<p>© 2026 SafariQuest. All rights reserved.</p>' +
      '<div class="footer-bottom-right">' +
      '<p class="footer-slogan"><em>Discover. Explore. Experience.</em></p>' +
      '<a href="admin-login.html" class="footer-admin-subtle" aria-label="Staff sign in">Staff</a>' +
      '</div></div></footer>';

    if (navRoot) navRoot.innerHTML = NAV_HTML;
    if (footRoot) footRoot.innerHTML = FOOTER_HTML;

    var btn = document.getElementById('navHamburger');
    var links = document.getElementById('navLinks');
    if (btn && links) {
      btn.addEventListener('click', function () {
        links.classList.toggle('open');
        btn.classList.toggle('active');
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('open');
          btn.classList.remove('active');
        });
      });
    }

    var nav = document.getElementById('navbar');
    if (nav) {
      window.addEventListener('scroll', function () {
        nav.style.boxShadow =
          window.scrollY > 10 ? '0 4px 24px rgba(0,0,0,0.14)' : '0 2px 12px rgba(0,0,0,0.07)';
      });
    }

    window.__SQ_LAYOUT_READY = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
