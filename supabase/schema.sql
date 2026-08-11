-- ============================================================
-- Podium Premiações: esquema do catálogo no Supabase.
--
-- Cole este arquivo inteiro no SQL Editor do projeto e rode uma vez.
-- É idempotente: rodar de novo não duplica nada nem apaga dados.
--
-- Depois disto faltam dois passos que NÃO dão para fazer por SQL,
-- porque são configuração do painel. Estão no fim do arquivo.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Tabela de produtos
-- ------------------------------------------------------------
-- Os nomes das colunas são em português porque o js/store.js faz o
-- mapeamento para o shape do app em fromRow/toRow. Mexer aqui exige
-- mexer lá.
create table if not exists public.produtos (
  id          uuid        primary key default gen_random_uuid(),
  nome        text        not null,
  categoria   text        not null,
  descricao   text        not null default '',
  preco       numeric(10,2),
  imagem_url  text,
  destaque    boolean     not null default false,
  cores       jsonb,
  specs       jsonb,
  criado_em   timestamptz not null default now()
);

-- `categorias` guarda TODAS as modalidades que o troféu atende; `categoria`
-- continua sendo a principal, que é o selo mostrado sobre a foto. Vários
-- modelos servem beach tennis e futevôlei ao mesmo tempo, e sem esta coluna
-- eles sumiriam do filtro de uma das duas.
alter table public.produtos add column if not exists categorias text[];

-- Backfill: quem não tem a lista recebe a principal.
update public.produtos
   set categorias = array[categoria]
 where categorias is null or cardinality(categorias) = 0;

alter table public.produtos alter column categorias set default '{}';

-- Gatilho que normaliza a lista: garante a principal dentro dela, remove
-- repetidas e preserva a ordem. Assim um insert que mande só `categoria`
-- (pela Table Editor, por exemplo) não esbarra na trava mais abaixo.
create or replace function public.produtos_normaliza_categorias()
returns trigger
language plpgsql
as $$
begin
  new.categorias := (
    select array_agg(c order by ordem)
      from (
        select c, min(ord) as ordem
          from unnest(
                 array[new.categoria] || coalesce(new.categorias, '{}'::text[])
               ) with ordinality as t(c, ord)
         group by c
      ) distintas
  );
  return new;
end;
$$;

drop trigger if exists produtos_normaliza_categorias_trg on public.produtos;
create trigger produtos_normaliza_categorias_trg
  before insert or update on public.produtos
  for each row execute function public.produtos_normaliza_categorias();

-- `specs` existe porque o toRow() do store.js grava essa coluna quando o
-- produto tem ficha técnica. Sem ela, um insert com specs falharia com
-- "column specs does not exist".
alter table public.produtos add column if not exists specs jsonb;

-- `preco` fica nulo quando o troféu é "Sob consulta".
-- numeric(10,2): duas casas fixas, até R$ 99.999.999,99.

comment on table  public.produtos is 'Catálogo de troféus do site.';
comment on column public.produtos.categoria is
  'Slug da modalidade, igual ao id em data/categories.js: futebol, futevolei, beach-tennis, volei, pescaria, empresarial.';
comment on column public.produtos.preco is
  'Nulo faz o site mostrar "Sob consulta".';


-- ------------------------------------------------------------
-- 2. Integridade
-- ------------------------------------------------------------
-- A modalidade precisa casar com data/categories.js. Sem esta trava, um
-- erro de digitação no cadastro cria um produto que nenhum filtro acha.
-- Ao acrescentar uma modalidade em data/categories.js, acrescente aqui e
-- RODE ESTE ARQUIVO DE NOVO. Sem isso o cadastro da modalidade nova é
-- recusado pelo banco com "violates check constraint".
alter table public.produtos drop constraint if exists produtos_categoria_valida;
alter table public.produtos add constraint produtos_categoria_valida
  check (categoria in (
    'futebol', 'futevolei', 'beach-tennis', 'volei', 'pescaria', 'truco', 'empresarial'
  ));

-- Toda modalidade da lista precisa ser válida, e a principal precisa estar
-- dentro dela. Sem a segunda parte, um troféu poderia sumir do filtro da
-- própria modalidade que mostra no selo.
alter table public.produtos drop constraint if exists produtos_categorias_validas;
alter table public.produtos add constraint produtos_categorias_validas
  check (
    categorias is not null
    and categorias <@ array[
      'futebol', 'futevolei', 'beach-tennis', 'volei', 'pescaria', 'truco', 'empresarial'
    ]::text[]
    and categoria = any(categorias)
  );

alter table public.produtos drop constraint if exists produtos_nome_preenchido;
alter table public.produtos add constraint produtos_nome_preenchido
  check (length(btrim(nome)) > 0);

alter table public.produtos drop constraint if exists produtos_preco_nao_negativo;
alter table public.produtos add constraint produtos_preco_nao_negativo
  check (preco is null or preco >= 0);


-- ------------------------------------------------------------
-- 3. Índices
-- ------------------------------------------------------------
-- O filtro do catálogo busca por modalidade.
create index if not exists produtos_categoria_idx
  on public.produtos (categoria);

-- GIN para consultas do tipo "contém esta modalidade". O site filtra no
-- navegador, mas o índice deixa a porta aberta para filtrar no servidor
-- quando o catálogo crescer.
create index if not exists produtos_categorias_idx
  on public.produtos using gin (categorias);

-- O listProducts() ordena por destaque desc, criado_em asc.
create index if not exists produtos_ordem_idx
  on public.produtos (destaque desc, criado_em asc);


-- ------------------------------------------------------------
-- 4. RLS: leitura pública, escrita só autenticada
-- ------------------------------------------------------------
-- Sem RLS ligado, a chave anon (que é pública, está no front-end)
-- daria escrita para qualquer visitante.
alter table public.produtos enable row level security;

drop policy if exists "produtos_select_public" on public.produtos;
create policy "produtos_select_public" on public.produtos
  for select to anon, authenticated
  using (true);

drop policy if exists "produtos_insert_auth" on public.produtos;
create policy "produtos_insert_auth" on public.produtos
  for insert to authenticated
  with check (true);

drop policy if exists "produtos_update_auth" on public.produtos;
create policy "produtos_update_auth" on public.produtos
  for update to authenticated
  using (true) with check (true);

drop policy if exists "produtos_delete_auth" on public.produtos;
create policy "produtos_delete_auth" on public.produtos
  for delete to authenticated
  using (true);


-- ------------------------------------------------------------
-- 4b. Privilégios da Data API
-- ------------------------------------------------------------
-- RLS decide QUAIS LINHAS cada um enxerga. O GRANT decide se o papel
-- pode tocar na tabela. São coisas diferentes e as duas precisam existir.
--
-- Quando "Automatically expose new tables" está DESLIGADO no projeto (que
-- é a recomendação do próprio Supabase), uma tabela nova não recebe grant
-- nenhum, e o site levaria "permission denied for table produtos".
-- Os grants abaixo são explícitos, então o esquema funciona com a opção
-- ligada ou desligada. Reaplicar não causa efeito colateral.
grant usage on schema public to anon, authenticated;

grant select on public.produtos to anon, authenticated;
grant insert, update, delete on public.produtos to authenticated;


-- ------------------------------------------------------------
-- 5. Storage: bucket público das fotos
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do update set public = true;

drop policy if exists "produtos_storage_read" on storage.objects;
create policy "produtos_storage_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'produtos');

drop policy if exists "produtos_storage_insert" on storage.objects;
create policy "produtos_storage_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'produtos');

drop policy if exists "produtos_storage_update" on storage.objects;
create policy "produtos_storage_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'produtos') with check (bucket_id = 'produtos');

drop policy if exists "produtos_storage_delete" on storage.objects;
create policy "produtos_storage_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'produtos');


-- ------------------------------------------------------------
-- 6. Conferência
-- ------------------------------------------------------------
-- Rode o bloco abaixo depois. Ele deve devolver uma linha dizendo "ok".
select
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'produtos')            as colunas,
  (select relrowsecurity from pg_class
    where oid = 'public.produtos'::regclass)                              as rls_ligado,
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename = 'produtos')               as policies_tabela,
  (select count(*) from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname like 'produtos_storage%')                            as policies_storage,
  (select public from storage.buckets where id = 'produtos')              as bucket_publico,
  (select count(*) from information_schema.role_table_grants
    where table_schema = 'public' and table_name = 'produtos'
      and grantee = 'anon' and privilege_type = 'SELECT')                 as anon_le,
  (select count(*) from information_schema.role_table_grants
    where table_schema = 'public' and table_name = 'produtos'
      and grantee = 'authenticated'
      and privilege_type in ('INSERT', 'UPDATE', 'DELETE'))               as auth_escreve,
  (select count(*) from pg_trigger
    where tgrelid = 'public.produtos'::regclass
      and tgname = 'produtos_normaliza_categorias_trg')                    as gatilho,
  (select count(*) from public.produtos
    where categorias is null or not (categoria = any(categorias)))         as linhas_inconsistentes;
-- Esperado: colunas=11, rls_ligado=true, policies_tabela=4,
--           policies_storage=4, bucket_publico=true,
--           anon_le=1, auth_escreve=3, gatilho=1,
--           linhas_inconsistentes=0


-- ============================================================
-- PASSOS QUE NÃO SÃO SQL (fazer no painel do Supabase)
--
-- 1. Authentication > Users > Add user
--    Crie o usuário do painel com e-mail e senha.
--    Marque "Auto Confirm User", senão o login trava esperando
--    a confirmação por e-mail.
--
-- 2. Authentication > Sign In / Providers > Email
--    Desligue "Allow new users to sign up".
--    Sem isso qualquer pessoa cria conta e passa a ter escrita no
--    catálogo, porque as policies acima liberam para `authenticated`.
--
-- 3. Project Settings > API
--    Copie "Project URL" e a chave "anon public" para
--    js/supabase-config.js.
--    A anon é pública por design; quem protege é o RLS.
--    NUNCA use a service_role no front-end: ela ignora RLS.
--
-- 4. Abra supabase/diagnostico.html no navegador para conferir
--    tudo de ponta a ponta.
-- ============================================================
