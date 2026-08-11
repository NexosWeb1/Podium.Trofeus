/* ============================================================
   categories.js: modalidades esportivas (ordem do escopo).

   Adicionar uma modalidade = 1 objeto aqui. O chip do filtro, o
   select do formulário e o filtro do painel se atualizam sozinhos.

   Os `id` são slug ASCII de propósito: eles vão para a coluna
   `categoria` do Supabase e para `product.category`. Acento em chave
   gera divergência de normalização entre o que o painel grava e o
   que o filtro compara. O acento fica no `label`.
   ============================================================ */

export const CATEGORIES = [
  { id: 'futebol', label: 'Futebol' },
  { id: 'futevolei', label: 'Futevôlei' },
  { id: 'beach-tennis', label: 'Beach Tennis' },
  { id: 'volei', label: 'Vôlei' },
  { id: 'pescaria', label: 'Pescaria' },
  { id: 'truco', label: 'Truco' },
  { id: 'empresarial', label: 'Empresarial' },
];
