/* ============================================================
   main.js: entry point. Orquestra os módulos.
   ============================================================ */

import { CONFIG, waLink } from './config.js';
import { CATEGORIES } from '../data/categories.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { initNav } from './nav.js';
import { initCatalog } from './catalog.js';
import { initForm } from './form.js';
import { initAnimations } from './animations.js';

function buildMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;

  const base = [
    ...CATEGORIES.map((c) => c.label),
    'Projetos exclusivos',
    'Produção própria',
    'Alto padrão de acabamento',
  ];

  // A animação translada a faixa em -50%, então as duas metades precisam ser
  // idênticas E uma metade sozinha precisa passar da largura da tela. Com só
  // 5 modalidades a lista fica curta demais, então ela é repetida antes.
  const labels = [];
  while (labels.length < 12) labels.push(...base);

  track.innerHTML = [...labels, ...labels]
    .map((l) => `<span class="marquee__item">${l}</span>`)
    .join('');
}

function hydrateContactLinks() {
  // Todos os CTAs simples de WhatsApp
  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = waLink();
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Telefone, e-mail e endereço no rodapé. Campo vazio esconde a linha
  // inteira, em vez de deixar um item em branco no ar.
  const set = (id, text, href) => {
    const el = document.getElementById(id);
    if (!el) return;
    const row = el.closest('li');
    if (!text) {
      if (row) row.hidden = true;
      return;
    }
    if (row) row.hidden = false;
    el.textContent = text;
    if (href && el.tagName === 'A') el.href = href;
  };

  const a = CONFIG.address;
  const addressText = [
    [a.street, a.district].filter(Boolean).join(', '),
    [a.city, a.state].filter(Boolean).join('-'),
    a.cep,
  ]
    .filter(Boolean)
    .join(', ');

  set('contact-phone', CONFIG.phoneDisplay, `tel:+${CONFIG.whatsapp}`);
  set('contact-email', CONFIG.email, `mailto:${CONFIG.email}`);
  set(
    'contact-instagram',
    CONFIG.instagram ? CONFIG.instagramHandle || 'Instagram' : '',
    CONFIG.instagram
  );
  set('contact-address', addressText);

  // Ícone do Instagram no bloco da marca (esconde se não houver perfil)
  const ig = document.getElementById('social-instagram');
  if (ig) {
    if (CONFIG.instagram) ig.href = CONFIG.instagram;
    else ig.hidden = true;
  }

  // Horários
  const hoursList = document.getElementById('footer-hours');
  if (hoursList) {
    hoursList.innerHTML = '';
    CONFIG.hours.forEach((h) => {
      const li = document.createElement('li');
      const days = document.createElement('span');
      days.textContent = h.days;
      const time = document.createElement('strong');
      time.textContent = h.time;
      li.append(days, ' ', time);
      hoursList.appendChild(li);
    });
  }
}

/** O número de modalidades do hero sai da lista, e não escrito na mão:
 *  assim ele não desatualiza quando uma modalidade é acrescentada. */
function hydrateStats() {
  const el = document.getElementById('hero-modalidades');
  if (el) el.textContent = String(CATEGORIES.length);
}

async function main() {
  hydrateContactLinks();
  hydrateStats();
  buildMarquee();

  const scroll = initSmoothScroll();
  const anim = initAnimations();

  initNav({
    scrollTo: scroll.scrollTo,
    pause: scroll.pause,
    resume: scroll.resume,
  });

  const form = await initForm();

  await initCatalog({
    onQuote: (product) => {
      form?.prefill?.(product);
      scroll.scrollTo('#orcamento', { offset: -72 });
    },
    // Os cards já entram pela animação `cardIn` do CSS, com stagger por --i.
    // Aqui só recalculamos as posições dos ScrollTriggers depois do render.
    onRender: () => anim.refresh?.(),
    scrollTo: scroll.scrollTo,
    pause: scroll.pause,
    resume: scroll.resume,
  });

  // Recalcula o ScrollTrigger depois que as fontes carregam (evita desalinhamento)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => anim.refresh?.());
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
