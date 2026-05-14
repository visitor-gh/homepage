/* ===================================================
   (주)노금휀스철망 — main.js
   =================================================== */

(function () {
  'use strict';

  // ---------- Sticky header
  const header = document.getElementById('header');
  const scrollTopBtn = document.getElementById('scrollTop');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 8);
    scrollTopBtn.classList.toggle('visible', y > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- Mobile menu
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
  navMenu.querySelectorAll('.nav-link').forEach(a =>
    a.addEventListener('click', () => navMenu.classList.remove('open'))
  );

  // ---------- Active nav link on scroll (intersection)
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const setActive = (id) => {
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
  };
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) setActive(e.target.id);
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => navObserver.observe(s));

  // ---------- Reveal on scroll
  const revealEls = document.querySelectorAll('.section-head, .hero-text, .hero-visual, .about-text, .about-features, .service, .portfolio-item, .contact-info, .contact-form, .hero-stat');
  revealEls.forEach(el => el.classList.add('reveal'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  // ---------- Portfolio filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      portfolioItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !match);
      });
    });
  });

  // ---------- Phone auto-format
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (v.length >= 4 && v.length <= 7) {
        v = v.slice(0, 3) + '-' + v.slice(3);
      } else if (v.length >= 8) {
        v = v.slice(0, 3) + '-' + v.slice(3, 7) + '-' + v.slice(7);
      }
      e.target.value = v;
    });
  }

  // ---------- Quote form
  const quoteForm = document.getElementById('quoteForm');
  const formMessage = document.getElementById('formMessage');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      formMessage.className = 'form-msg';
      formMessage.textContent = '';

      // Basic validation
      const required = quoteForm.querySelectorAll('[required]');
      let ok = true;
      required.forEach(f => {
        if (f.type === 'checkbox' ? !f.checked : !f.value.trim()) ok = false;
      });
      if (!ok) {
        formMessage.classList.add('error');
        formMessage.textContent = '필수 항목을 모두 입력해 주세요.';
        return;
      }

      // Persist locally (no backend wired up in this rebuild)
      const data = {
        company: quoteForm.company.value.trim(),
        phone: quoteForm.phone.value.trim(),
        email: quoteForm.email.value.trim(),
        location: quoteForm.location.value.trim(),
        service: quoteForm.service.value,
        message: quoteForm.message.value.trim(),
        status: '접수완료',
        submitted_at: new Date().toISOString(),
        id: 'q_' + Date.now()
      };
      try {
        const list = JSON.parse(localStorage.getItem('nk_quotes') || '[]');
        list.unshift(data);
        localStorage.setItem('nk_quotes', JSON.stringify(list));
      } catch (err) {}

      formMessage.classList.add('success');
      formMessage.textContent = '문의가 정상적으로 접수되었습니다. 평균 1영업일 이내에 회신드립니다.';
      quoteForm.reset();
    });
  }

})();
