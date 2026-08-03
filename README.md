# Podium Premiações

Landing page de conversão para a Podium Premiações, especializada em troféus personalizados para eventos esportivos e corporativos. Página única, PT-BR, com catálogo administrável.

HTML, CSS e JavaScript puros. Sem build step, sem framework, sem `node_modules`. Para rodar local, basta um servidor estático:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`. O painel fica em `/admin.html`.

## Estrutura

```
index.html            site (6 seções)
admin.html            painel do catálogo (noindex)
css/                  reset · tokens · base · layout · components · sections · animations · admin
js/                   config · supabase-config · store · price · main · smooth-scroll
                      animations · catalog · product-modal · form · nav · admin
data/                 categories.js · products.js · colors.js
assets/img/           hero · about · logo · og
assets/favicon/       favicon.ico · apple-touch-icon · icon-192 · icon-512
Img/                  arquivos originais do cliente (não são usados pelo site)
```

A ordem dos `<link>` de CSS importa: `tokens` define as variáveis que todos os outros consomem.

## Onde mexer em cada coisa

| Quero mudar | Arquivo |
|---|---|
| WhatsApp, telefone, e-mail, Instagram, endereço, horário | `js/config.js` |
| Cores, fontes, espaçamento, sombras | `css/tokens.css` |
| Modalidades esportivas | `data/categories.js` |
| Acabamentos oferecidos no painel | `data/colors.js` |
| Troféus do catálogo | pelo painel, em `admin.html` |
| Credenciais do Supabase | `js/supabase-config.js` |

Não hardcode cor em componente: tudo vem de `css/tokens.css`.

## Catálogo: dois modos

O `js/store.js` expõe uma API única (`listProducts`, `addProduct`, `updateProduct`, `deleteProduct`, `uploadImage`, `signIn`, `signOut`, `currentUser`) e escolhe o back-end sozinho:

- **Nuvem (Supabase)** quando `js/supabase-config.js` está preenchido. É o modo de produção.
- **Local (localStorage)** enquanto estiver vazio. Serve para testar sem configurar nada. A senha do painel nesse modo é `podium2026`, definida em `js/store.js`.

### Limites do modo local

As fotos ficam como dataURL base64 dentro de uma única chave do `localStorage`, que tem teto de aproximadamente 5 MB. Na prática isso dá 20 a 30 fotos comprimidas. Passando disso, o painel mostra um erro pedindo para configurar o Supabase. Configure a nuvem **antes** de cadastrar o catálogo real.

## Backend (Supabase)

Crie um projeto Supabase **próprio da Podium Premiações**. Não reaproveite o projeto da Podium Brindes: são catálogos diferentes.

### 1. SQL Editor: tabela e RLS

```sql
create table if not exists public.produtos (
  id          uuid primary key default gen_random_uuid(),
  nome        text        not null,
  categoria   text        not null,
  descricao   text        default '',
  preco       numeric(10,2),
  imagem_url  text,
  destaque    boolean     not null default false,
  cores       jsonb,
  criado_em   timestamptz not null default now()
);

create index if not exists produtos_categoria_idx on public.produtos (categoria);
create index if not exists produtos_ordem_idx     on public.produtos (destaque desc, criado_em asc);

alter table public.produtos enable row level security;

-- Leitura pública: o catálogo aparece para qualquer visitante, sem login.
create policy "produtos_select_public" on public.produtos
  for select to anon, authenticated using (true);

-- Escrita só para o usuário do painel.
create policy "produtos_insert_auth" on public.produtos
  for insert to authenticated with check (true);

create policy "produtos_update_auth" on public.produtos
  for update to authenticated using (true) with check (true);

create policy "produtos_delete_auth" on public.produtos
  for delete to authenticated using (true);
```

`preco` é `numeric(10,2)`: duas casas fixas, até R$ 99.999.999,99. Deixar nulo faz o site mostrar "Sob consulta".

A coluna `categoria` guarda o `id` da modalidade em slug ASCII (`futebol`, `futevolei`, `beach-tennis`, `volei`, `empresarial`), conforme `data/categories.js`.

### 2. Storage: bucket público

```sql
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

create policy "produtos_storage_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'produtos');

create policy "produtos_storage_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'produtos');

create policy "produtos_storage_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'produtos') with check (bucket_id = 'produtos');

create policy "produtos_storage_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'produtos');
```

### 3. Authentication

Crie o usuário do painel com e-mail e senha, marcando "Auto Confirm". Em seguida, desligue o cadastro público em Authentication, Providers, Email, opção "Enable signups".

### 4. Credenciais

Em Project Settings, API, copie o **Project URL** e a chave **anon public** para `js/supabase-config.js`.

A chave anon é pública por design: quem protege os dados é o RLS. **Nunca** cole a chave `service_role` em arquivo de front-end.

Não use seed automático de produtos fictícios. Cadastre os troféus reais pelo painel.

## Preço

O preço é opcional em cada troféu. Vazio vira "Sob consulta" no card e no modal. Preenchido, é formatado em BRL com `Intl.NumberFormat('pt-BR')`.

O campo do painel é `type="text"` de propósito, não `number`. Num teclado pt-BR, digitar `1234,56` num `input[type=number]` coloca o campo em `validity.badInput` e `value` devolve string vazia: o painel salvaria nulo sem avisar. O parser em `js/price.js` aceita `1234`, `1234,56`, `1.234,56`, `1234.56`, `1,234.56` e `R$ 1.234,56`, e devolve erro visível para entrada inválida.

## Fotos dos troféus

Envie com **fundo branco**. O card e o modal usam `object-fit: contain`, então a peça nunca é cortada. O painel comprime a imagem no navegador (canvas, lado maior de 1000px, JPEG 0.82) antes de subir.

## Acessibilidade e cores

A prata é o acento primário da marca, mas prata clara não passa contraste em fundo claro. Por isso ela é uma rampa de três faixas com papéis fixos, documentada no topo de `css/tokens.css`:

- `--silver` (cromo claro): texto e ícone **só em fundo escuro**.
- `--silver-deep` (aço médio): **só não-texto**, como borda e traço de ícone.
- `--silver-ink` (aço escuro): é o papel "prata" em fundo claro.

Nenhum seletor pode combinar `color: var(--silver)`, `var(--silver-light)` ou `var(--gold)` com fundo claro.

## Pendências do cliente

Enquanto não chegarem, o site funciona com placeholders marcados.

- **Contatos** (`js/config.js`, todos vazios): WhatsApp em E.164, telefone de exibição, e-mail, Instagram, endereço e horário. Linhas vazias somem do rodapé em vez de aparecer em branco.
- **Foto do hero** (`assets/img/hero/trofeus-hero.jpg`, 1200x900): vários modelos de troféu. Hoje é um placeholder.
- **Foto institucional** (`assets/img/about/producao-podium.jpg`, 1200x1200): produção ou equipe. Hoje é um placeholder.
- **Imagem de compartilhamento** (`assets/img/og/podium-og.jpg`, 1200x630): hoje é só a logomarca.
- **Fotos, descrições e preços dos troféus**: cadastrar pelo painel.
- **Credenciais do Supabase**: seguir os passos acima.

## Publicar no GitHub

O site é estático e não lê o `.env` em nenhum momento. O arquivo existe só para as operações de Git.

### 1. Preencher o `.env`

```bash
cp .env.example .env
```

Abra o `.env` e cole o token em `GITHUB_TOKEN`. O `.env.example` explica onde gerar e qual escopo marcar. Use um **fine-grained token** restrito só a este repositório, com `Contents: Read and write` (mais `Administration: Read and write` se for criar o repositório pelo `gh`), e defina uma validade.

Preencha também `GIT_AUTHOR_NAME` e `GIT_AUTHOR_EMAIL`: o Git global desta máquina está configurado com uma conta de trabalho, e sem isso os commits sairiam com aquela autoria.

### 2. Carregar o token na sessão

```powershell
. .\scripts\git-auth.ps1     # PowerShell (repare no ponto no início)
```

```bash
source scripts/git-auth.sh   # Git Bash
```

O token fica só na memória da sessão. Ele não é gravado no `.git/config`, então não aparece num `git remote -v` nem vai junto para quem clonar. Precisa rodar de novo a cada terminal novo.

### 3. Criar o repositório e subir

```bash
git add .
git commit -m "Primeira versao do site"
gh repo create "$GITHUB_OWNER/$GITHUB_REPO" --private --source=. --remote=origin --push
```

### Regras

- O `.env` está no `.gitignore` e **nunca** pode ser commitado. Confira com `git check-ignore -v .env` antes do primeiro push.
- Não cole o token em chat, issue, print ou e-mail. Se ele vazar, revogue em Settings, Developer settings, e gere outro: apagar do repositório não desfaz o vazamento.
- Não embuta o token na URL do remote (`https://TOKEN@github.com/...`). Isso grava a credencial em texto puro no `.git/config`.
- Rodar a varredura de segredos antes de cada commit.

## Antes de publicar

- Rodar a limpeza de copy e a varredura de segredos.
- Conferir que `js/supabase-config.js` está vazio no repositório. As credenciais reais entram só no servidor.
- Lighthouse mobile: Performance acima de 90, Acessibilidade acima de 95, Boas Práticas e SEO acima de 95.
