/* ============================================================
   animations.js: efeitos no scroll (GSAP/ScrollTrigger) e
   efeitos vanilla (spotlight). Respeita prefers-reduced-motion.
   ============================================================ */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Spotlight de cursor (vanilla). Atualiza --mx/--my nos elementos .spotlight. */
function initSpotlight() {
  if (reduced) return;
  document.querySelectorAll('.spotlight').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

export function initAnimations() {
  initSpotlight();

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  // Sem GSAP ou reduced-motion: garante tudo visível e sai.
  if (!gsap || !ScrollTrigger || reduced) {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
    return { refresh: () => {} };
  }

  document.documentElement.classList.add('js-anim');

  // Reveal genérico com stagger por container
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onComplete: () => el.classList.add('is-revealed'),
    });
  });

  // Stagger em grupos marcados com [data-reveal-group]
  gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
    const items = group.querySelectorAll('[data-reveal-item]');
    gsap.set(items, { opacity: 0, y: 24 });
    ScrollTrigger.create({
      trigger: group,
      start: 'top 80%',
      once: true,
      onEnter: () =>
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.08,
        }),
    });
  });

  // Hero parallax leve
  const heroVisual = document.querySelector('.hero__visual');
  if (heroVisual) {
    gsap.to(heroVisual, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // "Como Funciona": linha de progresso + steps acendendo
  const steps = document.querySelector('.steps');
  if (steps) {
    const stepEls = steps.querySelectorAll('.step');
    ScrollTrigger.create({
      trigger: steps,
      start: 'top 70%',
      end: 'bottom 60%',
      scrub: 0.5,
      onUpdate: (self) => {
        steps.style.setProperty('--steps-progress', self.progress.toFixed(3));
        const active = Math.round(self.progress * stepEls.length);
        stepEls.forEach((s, i) => s.classList.toggle('is-on', i < active));
      },
    });
  }

  // Os cards do catálogo entram pela animação `cardIn` do CSS (com stagger
  // via --i), então não há reveal por JS para eles: seria uma segunda
  // animação disputando a mesma opacity.
  return { refresh: () => ScrollTrigger.refresh() };
}
