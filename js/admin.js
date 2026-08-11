/* ============================================================
   admin.js: painel de manutenção do catálogo de troféus.
   Login, listar, adicionar, editar, excluir, filtrar, upload, preço.
   Usa o mesmo store do site (Supabase quando configurado; senão local).
   ============================================================ */

import { CATEGORIES } from '../data/categories.js';
import { COLOR_PRESETS } from '../data/colors.js';
import {
  IS_CLOUD,
  listProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  signIn,
  signOut,
  currentUser,
} from './store.js';
import { compressImage } from './image.js';

const $ = (id) => document.getElementById(id);
const catLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

/** Modalidades além da principal, para o selo do card do painel. */
const extras = (p) => (p.categories || []).filter((c) => c !== p.category);
const extrasSufixo = (p) => (extras(p).length ? ` +${extras(p).length}` : '');
const extrasLabel = (p) =>
  extras(p).length ? 'Também serve para: ' + extras(p).map(catLabel).join(', ') : '';
/** Só é foto real se for URL http/data (evita 404 de placeholders do seed). */
const realImg = (p) => (p.image && /^(data:|https?:)/.test(p.image) ? p.image : '');

let products = [];
let activeFilter = 'todos';
let pendingImage = null; // dataURL da imagem nova anexada
let deleteId = null;
let selectedColors = []; // [{name, hex}] do produto em edição
let selectedCategories = []; // modalidades adicionais marcadas

// Null-safe: uma cor sem `hex` (jsonb editado na mao, localStorage pela
// metade) derrubaria o painel inteiro com TypeError.
const sameColor = (a, b) =>
  String((a && a.hex) || '').toLowerCase() === String((b && b.hex) || '').toLowerCase();

function renderColors() {
  // Chips selecionados (removíveis)
  const sel = $('pf-colors-selected');
  sel.innerHTML = selectedColors.length
    ? ''
    : '<span class="color-empty">Nenhuma cor selecionada</span>';
  selectedColors.forEach((c) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'color-chip';
    chip.title = `Remover ${c.name}`;
    chip.innerHTML = `<span class="color-dot" style="background:${c.hex}"></span>${c.name}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>`;
    chip.addEventListener('click', () => {
      selectedColors = selectedColors.filter((x) => !sameColor(x, c));
      renderColors();
    });
    sel.appendChild(chip);
  });

  // Paleta (toggle)
  const pal = $('pf-colors-palette');
  pal.innerHTML = '';
  COLOR_PRESETS.forEach((c) => {
    const on = selectedColors.some((x) => sameColor(x, c));
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch' + (on ? ' is-on' : '');
    b.style.background = c.hex;
    b.title = c.name;
    b.setAttribute('aria-label', c.name);
    b.setAttribute('aria-pressed', String(on));
    b.addEventListener('click', () => {
      // Le o estado agora, e nao o `on` capturado quando o botao foi criado:
      // assim o toggle nao depende de renderColors() reconstruir tudo.
      const isOn = selectedColors.some((x) => sameColor(x, c));
      if (isOn) selectedColors = selectedColors.filter((x) => !sameColor(x, c));
      else selectedColors.push({ name: c.name, hex: c.hex });
      renderColors();
    });
    pal.appendChild(b);
  });
}

/**
 * Modalidades que o troféu atende, só em caixas de seleção.
 * A PRIMEIRA marcada, na ordem de data/categories.js, é a principal:
 * é ela que vira o selo sobre a foto e a coluna `categoria` do banco.
 */
function renderModalidades() {
  const box = $('pf-categorias');
  box.innerHTML = '';

  CATEGORIES.forEach((c) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = c.id;
    input.checked = selectedCategories.includes(c.id);
    input.addEventListener('change', () => {
      selectedCategories = input.checked
        ? [...new Set([...selectedCategories, c.id])]
        : selectedCategories.filter((x) => x !== c.id);
      $('pf-error').hidden = true;
    });
    const span = document.createElement('span');
    span.textContent = c.label;
    label.append(input, span);
    box.appendChild(label);
  });
}

/** Principal = a primeira marcada na ordem de data/categories.js. */
function modalidadesEscolhidas() {
  return CATEGORIES.map((c) => c.id).filter((id) => selectedCategories.includes(id));
}

/* ---------------- Login ---------------- */
async function boot() {
  $('login-mode').textContent = IS_CLOUD
    ? 'Conectado ao banco na nuvem (Supabase).'
    : 'Modo local (navegador). Senha padrão: podium2026';
  $('admin-mode').textContent = IS_CLOUD ? 'Nuvem' : 'Local';

  const user = await currentUser().catch(() => null);
  if (user) return showApp();
  showLogin();
}

function showLogin() {
  $('admin-login').hidden = false;
  $('admin-app').hidden = true;
}

async function showApp() {
  $('admin-login').hidden = true;
  $('admin-app').hidden = false;

  fillCategorySelects();
  await reload();
}

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('login-email').value.trim();
  const password = $('login-pass').value;
  const err = $('login-error');
  err.hidden = true;
  $('login-btn').disabled = true;
  try {
    await signIn(email, password);
    await showApp();
  } catch (ex) {
    err.textContent = ex.message || 'Não foi possível entrar.';
    err.hidden = false;
  } finally {
    $('login-btn').disabled = false;
  }
});

$('logout-btn').addEventListener('click', async () => {
  await signOut();
  location.reload();
});

/* ---------------- Selects ---------------- */
function fillCategorySelects() {
  const filter = $('admin-filter');
  filter.length = 1; // mantém "Todas as modalidades"
  CATEGORIES.forEach((c) => filter.appendChild(new Option(c.label, c.id)));
}

$('admin-filter').addEventListener('change', (e) => {
  activeFilter = e.target.value;
  renderGrid();
});

/* ---------------- Listagem ---------------- */
async function reload() {
  try {
    products = await listProducts();
  } catch (e) {
    products = [];
    toast('Erro ao carregar os troféus.', true);
  }
  renderGrid();
}

function renderGrid() {
  const grid = $('admin-grid');
  const list =
    activeFilter === 'todos'
      ? products
      : products.filter((p) => (p.categories || [p.category]).includes(activeFilter));

  $('admin-count').textContent = `${products.length} troféu(s) no catálogo`;
  grid.innerHTML = '';
  $('admin-empty').hidden = list.length > 0;

  list.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'admin-card';
    const src = realImg(p);
    const img = src
      ? `<img src="${src}" alt="" loading="lazy" />`
      : `<div class="admin-card__noimg">Sem imagem</div>`;
    card.innerHTML = `
      <div class="admin-card__media">${img}${p.featured ? '<span class="admin-card__star">Destaque</span>' : ''}</div>
      <div class="admin-card__body">
        <span class="admin-card__cat" title="${extrasLabel(p)}">${catLabel(p.category)}${extrasSufixo(p)}</span>
        <h3 class="admin-card__name"></h3>
        <p class="admin-card__desc"></p>
      </div>
      <div class="admin-card__actions">
        <button type="button" class="btn btn--outline admin-card__edit">Editar</button>
        <button type="button" class="btn btn--ghost admin-card__del">Excluir</button>
      </div>`;
    card.querySelector('.admin-card__name').textContent = p.name;
    card.querySelector('.admin-card__desc').textContent = p.description || '';
    card.querySelector('.admin-card__edit').addEventListener('click', () => openForm(p));
    card.querySelector('.admin-card__del').addEventListener('click', () => askDelete(p));
    grid.appendChild(card);
  });
}

/* ---------------- Formulário add/editar ---------------- */
function openForm(product) {
  const editing = Boolean(product);
  $('pf-title').textContent = editing ? 'Editar troféu' : 'Adicionar troféu';
  $('pf-id').value = editing ? product.id : '';
  $('pf-name').value = editing ? product.name : '';
  selectedCategories =
    editing && Array.isArray(product.categories) ? [...product.categories] : [];
  renderModalidades();
  $('pf-description').value = editing ? product.description || '' : '';
  $('pf-featured').checked = editing ? !!product.featured : false;
  selectedColors = editing && Array.isArray(product.colors) ? product.colors.map((c) => ({ ...c })) : [];
  renderColors();
  pendingImage = null;
  $('pf-error').hidden = true;

  const preview = $('pf-preview');
  const existing = editing ? realImg(product) : '';
  preview.innerHTML = existing ? `<img src="${existing}" alt="" />` : '<span>Sem imagem</span>';
  preview.dataset.existing = existing;
  $('pf-image-clear').hidden = !existing;

  openModal('product-form-modal');
  setTimeout(() => $('pf-name').focus(), 60);
}

$('add-btn').addEventListener('click', () => openForm(null));

$('pf-image-btn').addEventListener('click', () => $('pf-image').click());

// Cor personalizada
$('pf-color-add').addEventListener('click', () => {
  const hex = String($('pf-color-val').value || '').toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(hex)) return;
  const name = $('pf-color-name').value.trim() || hex.toUpperCase();
  if (!selectedColors.some((x) => sameColor(x, { hex }))) {
    selectedColors.push({ name, hex });
    renderColors();
  }
  $('pf-color-name').value = '';
});

$('pf-image').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    pendingImage = await compressImage(file, 1000, 0.82);
    $('pf-preview').innerHTML = `<img src="${pendingImage}" alt="" />`;
    $('pf-image-clear').hidden = false;
  } catch (ex) {
    toast('Não foi possível ler a imagem.', true);
  }
});

$('pf-image-clear').addEventListener('click', () => {
  pendingImage = '';
  $('pf-preview').innerHTML = '<span>Sem imagem</span>';
  $('pf-preview').dataset.existing = '';
  $('pf-image').value = '';
  $('pf-image-clear').hidden = true;
});

$('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('pf-error');
  err.hidden = true;

  const id = $('pf-id').value;
  const name = $('pf-name').value.trim();
  const modalidades = modalidadesEscolhidas();
  const category = modalidades[0] || '';
  const description = $('pf-description').value.trim();
  const featured = $('pf-featured').checked;
  if (!name) {
    err.textContent = 'Preencha o nome do troféu.';
    err.hidden = false;
    return;
  }

  if (!modalidades.length) {
    err.textContent = 'Marque ao menos uma modalidade.';
    err.hidden = false;
    return;
  }

  const saveBtn = $('pf-save');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Salvando';

  try {
    // Resolve a imagem: nova anexada, mantida, ou removida.
    let image;
    if (pendingImage) {
      image = await uploadImage(pendingImage, name);
    } else if (pendingImage === '') {
      image = null; // removida
    } else {
      image = $('pf-preview').dataset.existing || null; // mantém a atual
    }

    const payload = {
      name,
      category,
      categories: modalidades,
      description,
      featured,
      image,
      colors: selectedColors,
    };
    if (id) await updateProduct(id, payload);
    else await addProduct(payload);

    closeModal('product-form-modal');
    toast(id ? 'Troféu atualizado.' : 'Troféu adicionado.');
    await reload();
  } catch (ex) {
    err.textContent = ex.message || 'Erro ao salvar.';
    err.hidden = false;
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Salvar troféu';
  }
});

/* ---------------- Exclusão ---------------- */
function askDelete(product) {
  deleteId = product.id;
  $('del-text').innerHTML = `Excluir <strong></strong>? Esta ação não pode ser desfeita.`;
  $('del-text').querySelector('strong').textContent = product.name;
  openModal('delete-modal', 'aria-hidden');
}

$('del-confirm').addEventListener('click', async () => {
  if (!deleteId) return;
  const btn = $('del-confirm');
  btn.disabled = true;
  try {
    await deleteProduct(deleteId);
    closeModal('delete-modal');
    toast('Troféu excluído.');
    await reload();
  } catch (ex) {
    toast('Erro ao excluir.', true);
  } finally {
    btn.disabled = false;
    deleteId = null;
  }
});

/* ---------------- Modais utilitários ---------------- */
function openModal(id) {
  const m = $(id);
  m.classList.add('open');
  m.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}
function closeModal(id) {
  const m = $(id);
  m.classList.remove('open');
  m.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) closeModal('product-form-modal');
  if (e.target.closest('[data-close-del]')) closeModal('delete-modal');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal('product-form-modal');
    closeModal('delete-modal');
  }
});

/* ---------------- Utilidades ---------------- */

let toastTimer = null;
function toast(msg, isError = false) {
  const t = $('admin-toast');
  t.textContent = msg;
  t.classList.toggle('is-error', isError);
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 3200);
}

boot();
