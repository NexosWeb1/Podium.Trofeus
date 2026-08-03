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

export const SUPABASE_URL = '';
export const SUPABASE_ANON_KEY = '';

/** Bucket público do Storage onde ficam as fotos dos troféus. */
export const IMAGE_BUCKET = 'produtos';

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
