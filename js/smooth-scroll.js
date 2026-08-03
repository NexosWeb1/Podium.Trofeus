/* ============================================================
   smooth-scroll.js: Lenis com o wiring do GSAP/ScrollTrigger
   Retorna helpers; degrada para scroll nativo se libs ausentes
   ou se prefers-reduced-motion estiver ativo.
   ============================================================ */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initSmoothScroll() {
  const hasLenis = typeof window.Lenis === 'function';
  const hasGsap = typeof window.gsap !== 'undefined';

  // Fallback: sem Lenis ou com reduced-motion -> scroll nativo
  if (!hasLenis || reduced) {
    return {
      lenis: null,
      scrollTo: (target, opts = {}) => {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY + (opts.offset || 0);
        window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      },
      pause: () => {},
      resume: () => {},
    };
  }

  const lenis = new window.Lenis({
    duration: 1.1,
    smoothWheel: true,
    // smoothTouch desligado: evita conflito com barra de endereço no iOS
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  document.documentElement.classList.add('lenis');

  // Wiring correto Lenis <-> ScrollTrigger (um único loop de RAF)
  if (hasGsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  } else {
    // Sem GSAP: loop próprio de RAF
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  return {
    lenis,
    scrollTo: (target, opts = {}) => lenis.scrollTo(target, { offset: opts.offset || 0 }),
    pause: () => lenis.stop(),
    resume: () => lenis.start(),
  };
}
