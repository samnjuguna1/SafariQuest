/* ============================================================
   CONTACT PAGE — contact.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Navbar scroll shadow ── */
  window.addEventListener('scroll', function () {
    document.getElementById('navbar').style.boxShadow =
      window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,.12)' : '0 2px 12px rgba(0,0,0,.07)';
    document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
  });

  /* ── Scroll to top ── */
  document.getElementById('scrollTop').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Fade-in on scroll ── */
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = (i * 0.07) + 's';
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(function (el) {
    observer.observe(el);
  });

  /* ── Toast helper ── */
  function showToast(message, type) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3500);
  }

  /* ── Character counter ── */
  var messageArea = document.getElementById('message');
  var charCount   = document.getElementById('charCount');

  messageArea.addEventListener('input', function () {
    var len = this.value.length;
    charCount.textContent = len + ' char' + (len !== 1 ? 's' : '');
    charCount.style.color = len > 500 ? '#E8820C' : '#bbb';
  });

  /* ── Validation helpers ── */
  function showError(inputEl, errorId, message) {
    var wrap = inputEl.closest('.input-wrap') || inputEl.closest('.textarea-wrap');
    if (wrap) wrap.classList.add('error');
    document.getElementById(errorId).textContent = message;
  }

  function clearError(inputEl, errorId) {
    var wrap = inputEl.closest('.input-wrap') || inputEl.closest('.textarea-wrap');
    if (wrap) wrap.classList.remove('error');
    document.getElementById(errorId).textContent = '';
  }

  /* Live clear on input */
  document.getElementById('fullName').addEventListener('input', function () {
    clearError(this, 'nameError');
  });
  document.getElementById('email').addEventListener('input', function () {
    clearError(this, 'emailError');
  });
  document.getElementById('subject').addEventListener('change', function () {
    clearError(this, 'subjectError');
  });
  messageArea.addEventListener('input', function () {
    clearError(this, 'messageError');
  });

  /* ── Form submission ── */
  document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();

    var name    = document.getElementById('fullName');
    var email   = document.getElementById('email');
    var subject = document.getElementById('subject');
    var message = document.getElementById('message');
    var btn     = document.getElementById('sendBtn');
    var spinner = document.getElementById('sendSpinner');
    var btnText = btn.querySelector('.btn-text');

    var valid = true;

    // Name
    if (!name.value.trim()) {
      showError(name, 'nameError', 'Please enter your full name.');
      valid = false;
    } else if (name.value.trim().length < 2) {
      showError(name, 'nameError', 'Name must be at least 2 characters.');
      valid = false;
    }

    // Email
    if (!email.value.trim()) {
      showError(email, 'emailError', 'Please enter your email address.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showError(email, 'emailError', 'Please enter a valid email address.');
      valid = false;
    }

    // Subject
    if (!subject.value) {
      showError(subject, 'subjectError', 'Please select a topic.');
      valid = false;
    }

    // Message
    if (!message.value.trim()) {
      showError(message, 'messageError', 'Please write your message.');
      valid = false;
    } else if (message.value.trim().length < 10) {
      showError(message, 'messageError', 'Message must be at least 10 characters.');
      valid = false;
    }

    if (!valid) return;

    // Loading state
    btn.disabled       = true;
    btnText.style.display  = 'none';
    spinner.style.display  = 'inline-flex';

    // Simulate send
    setTimeout(function () {
      btn.disabled       = false;
      btnText.style.display  = 'inline-flex';
      spinner.style.display  = 'none';

      showToast('✓ Message sent! We\'ll get back to you within 24 hours.', 'success');

      // Reset form
      document.getElementById('contactForm').reset();
      charCount.textContent = '0 chars';
      charCount.style.color = '#bbb';
    }, 1600);
  });

  /* ── FAQ Accordion ── */
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item     = this.closest('.faq-item');
      var isOpen   = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Newsletter ── */
  document.querySelector('.newsletter-btn').addEventListener('click', function () {
    var input = document.querySelector('.newsletter-input');
    if (input.value.includes('@')) {
      showToast('✓ Subscribed! Welcome to our community.', 'success');
      input.value = '';
    } else {
      input.style.borderColor = '#E8820C';
      setTimeout(function () { input.style.borderColor = ''; }, 1500);
    }
  });

  /* ── Social card hover ripple ── */
  document.querySelectorAll('.social-card').forEach(function (card) {
    card.addEventListener('click', function () {
      this.style.transform = 'scale(0.97)';
      setTimeout(function () { card.style.transform = ''; }, 150);
    });
  });

});
