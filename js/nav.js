/* ============================================================
   nav.js: hamburger, header no scroll, link ativo e scroll suave
   ============================================================ */

export function initNav({ scrollTo, pause, resume } = {}) {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const links = [...document.querySelectorAll('.nav__link')];

  // Header ganha fundo ao rolar
  const onScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menu mobile
  let open = false;
  function setMenu(next) {
    open = next;
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    if (menu) menu.classList.toggle('open', open);
    document.body.classList.toggle('no-scroll', open);
    if (open) {
      pause?.();
    } else {
      resume?.();
    }
  }

  toggle?.addEventListener('click', () => setMenu(!open));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      setMenu(false);
      toggle?.focus();
    }
  });

  // Navegação suave por âncora (usa Lenis se disponível)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (open) setMenu(false);
      if (scrollTo) {
        scrollTo(target, { offset: -72 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      history.replaceState(null, '', id);
    });
  });

  // Link ativo conforme a seção visível
  const sections = links
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = `#${entry.target.id}`;
            links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === id));
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => io.observe(s));
  }
}
