  // Navbar scroll shadow
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').style.boxShadow =
      window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,.12)' : '0 2px 12px rgba(0,0,0,.07)';
    document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
  });

  // Scroll to top
  document.getElementById('scrollTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Fade-in on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = (i * 0.07) + 's';
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // Testimonial slider
  const slides = document.querySelectorAll('.testi-slide');
  const navEl  = document.getElementById('testiNav');
  let current = 0, autoTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => { goTo(i); resetTimer(); });
    navEl.appendChild(dot);
  });

  const dots = () => navEl.querySelectorAll('.testi-dot');

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots()[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots()[current].classList.add('active');
  }

  function resetTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  resetTimer();

  // Newsletter
  document.querySelector('.newsletter-btn').addEventListener('click', () => {
    const input = document.querySelector('.newsletter-input');
    if (input.value.includes('@')) {
      input.value = '';
      input.placeholder = '✓ Subscribed! Thank you.';
      setTimeout(() => { input.placeholder = 'Your email address'; }, 3000);
    } else {
      input.style.borderColor = '#E8820C';
      setTimeout(() => { input.style.borderColor = ''; }, 1500);
    }
  });
