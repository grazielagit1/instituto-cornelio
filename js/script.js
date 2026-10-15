const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

const navToggle = document.getElementById('navToggle');
const navLinksMenu = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');

const setNavOpen = (open) => {
  navLinksMenu.classList.toggle('open', open);
  navOverlay.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
};

if (navToggle && navLinksMenu && navOverlay) {
  navToggle.addEventListener('click', () => {
    setNavOpen(!navLinksMenu.classList.contains('open'));
  });
  navOverlay.addEventListener('click', () => setNavOpen(false));
  navLinksMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => setNavOpen(false));
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setNavOpen(false);
  });
}

const railLinks = [...document.querySelectorAll('#rail a')];
const navLinks = [...document.querySelectorAll('#navLinks a')];
const sections = ['hero','historia','biblioteca','produtos','mentoria','contato'].map(id => document.getElementById(id));

const setActive = (id) => {
  railLinks.forEach(a => a.classList.toggle('active', a.dataset.target === id));
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.target === id));
};

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
sections.forEach(s => s && io.observe(s));

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  });
});

// elementos aparecem conforme entram na tela durante a rolagem
const revealSelector = [
  '.hero-tag', '.hero-title', '.hero-lede', '.btn-row', '.eyebrow', '.section-title',
  '.prose', '.frame', '.qcard', '.qa-list li', '.group-head', '.product-card', '.dcard',
  '.feat', '.steps li', '.forwho', '.quote', '.contact-wrap > *'
].join(',');

if (!prefersReduced && 'IntersectionObserver' in window) {
  const revealEls = [...document.querySelectorAll(revealSelector)]
    .filter(el => !el.parentElement.closest(revealSelector));

  revealEls.forEach(el => {
    const siblings = revealEls.filter(s => s.parentElement === el.parentElement);
    el.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(el), 5) * 90}ms`);
    el.classList.add('reveal');
  });

  const revealIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealIo.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  revealEls.forEach(el => revealIo.observe(el));
}
