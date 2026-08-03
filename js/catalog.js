/* ============================================================
   catalog.js: catálogo do site (data-driven via store).
   Card: foto + nome + preço. Clique abre o modal de detalhe.
   Filtro por modalidade, paginação de 8 por página no desktop
   (4 por fileira, 2 fileiras) e carrossel arrastável no celular.
   ============================================================ */

import { CATEGORIES } from '../data/categories.js';
import { listProducts } from './store.js';
import { openProductModal } from './product-modal.js';
import { formatPrice, hasPrice } from './price.js';

/** Só carrega a imagem quando é URL real (evita 404 em produto sem foto). */
function hasRealImage(product) {
  return /^(data:|https?:)/.test(product.image || '');
}

const ALL = { id: 'todos', label: 'Todos' };
const PER_PAGE = 8; // desktop: 2 fileiras de 4

function placeholder(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6f7f9"/><stop offset="1" stop-color="#dfe3e9"/>
    </linearGradient></defs>
    <rect width="400" height="300" fill="url(#g)"/>
    <path d="M162 70h76v34a38 38 0 01-76 0V70zm-14 8h-16a20 20 0 0020 20m90-20h16a20 20 0 01-20 20M200 142v34m-24 0h48m-62 22h76v14h-76z" fill="none" stroke="#c9cfd8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="200" y="255" font-family="system-ui,sans-serif" font-size="17" fill="#7a828f" text-anchor="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function categoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function chevron(dir) {
  const d = dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${d}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export async function initCatalog({ onQuote, onRender, scrollTo, pause, resume } = {}) {
  const grid = document.getElementById('catalog-grid');
  const bar = document.getElementById('catalog-filters');
  const tpl = document.getElementById('product-card-tpl');
  const empty = document.getElementById('catalog-empty');
  const pager = document.getElementById('catalog-pager');
  if (!grid || !bar || !tpl) return null;

  let products = [];
  try {
    products = await listProducts();
  } catch (e) {
    console.error('Falha ao carregar catálogo:', e);
    products = [];
  }

  let activeCat = 'todos';
  let page = 1;
  const isMobile = () => window.matchMedia('(max-width: 640px)').matches;

  function filtered() {
    return activeCat === 'todos'
      ? products
      : products.filter((p) => p.category === activeCat);
  }

  function createCard(product, index) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.productId = product.id;
    node.style.setProperty('--i', index);

    const img = node.querySelector('.product-card__media img');
    img.alt = product.imageAlt || product.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 400;
    img.height = 300;
    if (hasRealImage(product)) {
      img.src = product.image;
      img.addEventListener('error', () => (img.src = placeholder(product.name)), { once: true });
    } else {
      img.src = placeholder(product.name);
    }

    node.querySelector('.product-card__cat').textContent = categoryLabel(product.category);
    node.querySelector('.product-card__title').textContent = product.name;

    const priceEl = node.querySelector('.product-card__price');
    priceEl.textContent = formatPrice(product.price);
    priceEl.classList.toggle('is-muted', !hasPrice(product.price));

    node.setAttribute(
      'aria-label',
      `Ver detalhes de ${product.name}, ${formatPrice(product.price)}`
    );

    node.addEventListener('click', () =>
      openProductModal(product, {
        onQuote,
        categoryLabel: categoryLabel(product.category),
        pause,
        resume,
      })
    );
    return node;
  }

  function renderPager(pages) {
    if (!pager) return;
    pager.innerHTML = '';
    if (pages <= 1) {
      pager.hidden = true;
      return;
    }
    pager.hidden = false;

    const mk = (html, goto, { disabled = false, current = false, aria } = {}) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pager__btn' + (current ? ' is-current' : '');
      b.innerHTML = html;
      if (disabled) b.disabled = true;
      if (current) b.setAttribute('aria-current', 'page');
      if (aria) b.setAttribute('aria-label', aria);
      if (!disabled && !current) {
        b.addEventListener('click', () => {
          page = goto;
          render();
          if (scrollTo) scrollTo('#catalogo', { offset: -70 });
        });
      }
      return b;
    };

    pager.appendChild(mk(chevron('left'), page - 1, { disabled: page === 1, aria: 'Página anterior' }));
    for (let i = 1; i <= pages; i += 1) {
      pager.appendChild(mk(String(i), i, { current: i === page, aria: `Página ${i}` }));
    }
    pager.appendChild(
      mk(chevron('right'), page + 1, { disabled: page === pages, aria: 'Próxima página' })
    );
  }

  function render() {
    const list = filtered();
    const mobile = isMobile();
    grid.classList.toggle('is-carousel', mobile);

    let slice;
    if (mobile) {
      // Celular: carrossel arrastável, mostra todos, sem paginação.
      slice = list;
      if (pager) pager.hidden = true;
    } else {
      // Desktop: paginação de 4 por página.
      const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
      if (page > pages) page = pages;
      slice = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
      renderPager(pages);
    }

    grid.innerHTML = '';
    slice.forEach((p, i) => grid.appendChild(createCard(p, i)));
    if (empty) empty.hidden = list.length > 0;
    if (mobile) grid.scrollLeft = 0;
    if (onRender) onRender();
  }

  function buildFilters() {
    const items = [ALL, ...CATEGORIES];
    const frag = document.createDocumentFragment();
    items.forEach((cat, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.textContent = cat.label;
      btn.dataset.filter = cat.id;
      btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      btn.addEventListener('click', () => {
        bar
          .querySelectorAll('.chip')
          .forEach((c) => c.setAttribute('aria-pressed', c === btn ? 'true' : 'false'));
        activeCat = cat.id;
        page = 1;
        render();
      });
      frag.appendChild(btn);
    });
    bar.appendChild(frag);
  }

  buildFilters();
  render();

  // Re-renderiza ao cruzar o breakpoint (paginação <-> carrossel)
  let wasMobile = isMobile();
  window.addEventListener('resize', () => {
    const m = isMobile();
    if (m !== wasMobile) {
      wasMobile = m;
      page = 1;
      render();
    }
  });

  return {
    reload: async () => {
      products = await listProducts();
      page = 1;
      render();
    },
  };
}
