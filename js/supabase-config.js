/* ============================================================
   supabase-config.js: credenciais públicas do Supabase.

   Cole os dois valores em Project Settings > API do projeto
   PRÓPRIO da Podium Premiações. Não reaproveite o projeto da
   Podium Brindes: são catálogos diferentes.

   A chave anon é pública por design; quem protege os dados é o
   RLS. NUNCA cole a chave service_role em arquivo de front-end.

   Enquanto os dois campos estiverem vazios, site e painel rodam
   em modo local (localStorage do navegador).

   O passo a passo completo, com o SQL, está no README.md.
   ============================================================ */

export const SUPABASE_URL = 'https://lemiihusglnbtncdqqkj.supabase.co';

// Cole aqui a chave "anon public", de Project Settings > API.
// Ela começa com "eyJ" e é longa. Enquanto estiver vazia, o site
// continua rodando no modo local, sem tentar falar com a nuvem.
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbWlpaHVzZ2xuYnRuY2RxcWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTk5MDYsImV4cCI6MjEwMTQzNTkwNn0.FVUTmZqZBCgShozsO3YyjM95CajFcB-45XfX_cF9eeQ';

/** Bucket público do Storage onde ficam as fotos dos troféus. */
export const IMAGE_BUCKET = 'produtos';

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
