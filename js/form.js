/* ============================================================
   form.js: formulário de orçamento para o WhatsApp (wa.me)
   Selects dependentes: "Modelo do Troféu" filtrado pela modalidade.
   ============================================================ */

import { CATEGORIES } from '../data/categories.js';
import { listProducts } from './store.js';
import { CONFIG, waLink } from './config.js';

let PRODUCTS = [];

/** Gancho para integração futura (analytics ou backend). No-op por padrão. */
export function onQuoteSubmitted(payload) {
  // Substituir por chamada a backend ou analytics quando existir.
}

function fillModalidades(select) {
  const frag = document.createDocumentFragment();
  const none = new Option('Selecione a modalidade', '');
  none.disabled = true;
  none.selected = true;
  frag.appendChild(none);
  CATEGORIES.forEach((c) => frag.appendChild(new Option(c.label, c.id)));
  select.appendChild(frag);
}

function fillModelos(select, modalidadeId) {
  select.innerHTML = '';
  const frag = document.createDocumentFragment();
  const list = PRODUCTS.filter(
    (p) => !modalidadeId || (p.categories || [p.category]).includes(modalidadeId)
  );

  const first = new Option(
    modalidadeId ? 'Selecione o modelo' : 'Escolha a modalidade antes',
    ''
  );
  first.disabled = !modalidadeId;
  first.selected = true;
  frag.appendChild(first);

  list.forEach((p) => frag.appendChild(new Option(p.name, p.id)));
  frag.appendChild(new Option('Outro / Não sei ainda', 'outro'));

  select.appendChild(frag);
  select.disabled = !modalidadeId;
}

/**
 * "2026-08-03" -> "03/08/2026".
 * Sem `new Date`: uma string ISO só com data é interpretada como meia-noite
 * UTC, e em UTC-3 o toLocaleDateString devolveria o dia anterior.
 */
function formatDateBR(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

function buildMessage(data) {
  const vazio = 'Não informado';
  const modalidade = CATEGORIES.find((c) => c.id === data.modalidade)?.label || vazio;
  const modelo =
    data.modelo === 'outro'
      ? 'Outro / a definir'
      : PRODUCTS.find((p) => p.id === data.modelo)?.name || vazio;

  return [
    `*Solicitação de Orçamento | ${CONFIG.brand}*`,
    '',
    `*Nome:* ${data.nome || vazio}`,
    `*Empresa ou Organização:* ${data.empresa || vazio}`,
    `*WhatsApp:* ${data.whatsapp || vazio}`,
    `*E-mail:* ${data.email || vazio}`,
    `*Modalidade esportiva:* ${modalidade}`,
    `*Modelo do Troféu:* ${modelo}`,
    `*Quantidade:* ${data.quantidade || vazio}`,
    `*Data do evento:* ${formatDateBR(data.data_evento) || vazio}`,
    '',
    '*Mensagem:*',
    data.mensagem || vazio,
  ].join('\n');
}

export async function initForm() {
  const form = document.getElementById('quote-form');
  if (!form) return;

  try {
    PRODUCTS = await listProducts();
  } catch (e) {
    console.error('Falha ao carregar os modelos para o formulário:', e);
    PRODUCTS = [];
  }

  const modalidadeSelect = form.elements.modalidade;
  const modeloSelect = form.elements.modelo;
  const fallback = document.getElementById('form-fallback');
  const fallbackLink = document.getElementById('form-fallback-link');

  fillModalidades(modalidadeSelect);
  fillModelos(modeloSelect, '');

  modalidadeSelect.addEventListener('change', () => {
    fillModelos(modeloSelect, modalidadeSelect.value);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // O form é `novalidate`, então a validação nativa não roda no submit.
    // Este reportValidity() roda a checagem de constraints na mão e mostra
    // os balões do navegador, inclusive o do type="email".
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    const message = buildMessage(data);
    const url = waLink(message);

    onQuoteSubmitted({ ...data, message });

    // Abre o WhatsApp. Se o popup for bloqueado, mostra o link de fallback.
    const win = window.open(url, '_blank', 'noopener');
    if (fallback && fallbackLink) {
      fallbackLink.href = url;
      if (!win || win.closed || typeof win.closed === 'undefined') {
        fallback.hidden = false;
      }
    }
  });

  /** Pré-seleciona modalidade e modelo (usado pelo CTA do card). */
  function prefill(product) {
    if (!product) return;
    modalidadeSelect.value = product.category;
    fillModelos(modeloSelect, product.category);
    modeloSelect.value = product.id;
  }

  return { prefill };
}
