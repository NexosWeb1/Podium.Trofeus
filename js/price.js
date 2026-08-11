/* ============================================================
   price.js: formatação e leitura de preço em BRL.

   NAO ESTA EM USO. O catálogo foi para "sem preço" a pedido do
   cliente, então nem o card, nem o modal, nem o painel exibem ou
   pedem valor. A coluna `preco` continua no banco e o store segue
   mapeando, então religar é só voltar a importar isto.

   Fica guardado por causa do que ele documenta: o parser trata a
   ambiguidade de "1.234" (milhar pt-BR contra decimal en-US) e
   explica por que o input tem de ser `text` e nunca `number`.

   Num teclado pt-BR, digitar "1234,56" num <input type="number">
   coloca o campo em validity.badInput e `input.value` devolve string
   vazia: o painel salvaria nulo sem avisar. Colar "R$ 1.200,00" da
   planilha falha do mesmo jeito. Os dois modos de falha são
   silenciosos, que é o pior caso para preço.
   ============================================================ */

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const PRICE_EMPTY_LABEL = 'Sob consulta';

/** true quando há um preço real (e não vazio ou inválido). */
export function hasPrice(value) {
  if (value === null || value === undefined || value === '') return false;
  return Number.isFinite(Number(value));
}

/** number|null -> "R$ 1.234,56" ou "Sob consulta". */
export function formatPrice(value) {
  return hasPrice(value) ? BRL.format(Number(value)) : PRICE_EMPTY_LABEL;
}

/**
 * Texto digitado -> number | null.
 * Aceita "1234", "1234,56", "1.234,56", "1234.56", "1,234.56" e "R$ 1.234,56".
 * Devolve null tanto para vazio quanto para entrada inválida. Quem chama
 * distingue os dois olhando se a string original estava vazia, para poder
 * mostrar erro em vez de salvar silenciosamente.
 */
export function parsePriceBR(raw) {
  if (raw === null || raw === undefined) return null;

  // Remove "R$" e todo espaço em branco. O \s do JS já cobre o NBSP (U+00A0) e
  // o narrow no-break (U+202F), que o Intl.NumberFormat insere após o símbolo.
  let s = String(raw).trim().replace(/r\$/gi, '').replace(/\s/g, '');
  if (!s) return null;

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  if (hasComma && hasDot) {
    // O separador decimal é o que aparece por último.
    s =
      s.lastIndexOf(',') > s.lastIndexOf('.')
        ? s.replace(/\./g, '').replace(',', '.') // 1.234,56
        : s.replace(/,/g, ''); // 1,234.56
  } else if (hasComma) {
    s = s.replace(',', '.'); // 1234,56
  } else if (hasDot && /^\d{1,3}(\.\d{3})+$/.test(s)) {
    // Só ponto e no padrão de milhar: "1.234" é 1234 (viés pt-BR).
    // "1234.5" continua sendo decimal.
    s = s.replace(/\./g, '');
  }

  if (!/^\d+(\.\d+)?$/.test(s)) return null;

  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

/** number|null -> string pronta para o input do painel. */
export function priceToInput(value) {
  return hasPrice(value) ? BRL.format(Number(value)) : '';
}
