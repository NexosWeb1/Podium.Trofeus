/* ============================================================
   categories.js: modalidades de partida (ordem do escopo).

   Modalidade nova se cria pelo painel, botão "Nova modalidade". Esta
   lista é a semente da tabela `modalidades` (ver supabase/schema.sql)
   e a reserva que o store.js usa se a leitura do banco falhar.

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
