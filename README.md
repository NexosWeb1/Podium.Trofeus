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
supabase/             schema.sql · diagnostico.html
scripts/              git-auth.ps1 · git-auth.sh
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

Todo o esquema mora em [`supabase/schema.sql`](supabase/schema.sql), num arquivo só. Ele é idempotente: rodar de novo não duplica nada nem apaga dados.

### 1. Rodar o SQL

No painel do Supabase, abra **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e execute. Ele cria:

- a tabela `produtos`, com `preco numeric(10,2)` e `specs jsonb`;
- travas de integridade, entre elas um `check` que só aceita as modalidades de `data/categories.js` (sem isso, um erro de digitação cria um produto que nenhum filtro acha);
- os índices que o `listProducts()` usa para ordenar;
- o RLS com leitura pública e escrita só para quem tem login;
- o bucket `produtos` no Storage, público para leitura.

O último bloco do arquivo é uma consulta de conferência. O resultado esperado está comentado logo abaixo dela.

### 2. Criar o usuário do painel

**Authentication > Users > Add user.** Marque **Auto Confirm User**, senão o login fica esperando uma confirmação por e-mail que nunca chega.

Em seguida, **Authentication > Sign In / Providers > Email**: desligue **Allow new users to sign up**. As policies liberam escrita para qualquer usuário `authenticated`, então deixar o cadastro aberto significa deixar o catálogo aberto.

### 3. Colar as credenciais

**Project Settings > API.** Copie o **Project URL** e a chave **anon public** para `js/supabase-config.js`.

A chave anon é pública por design: ela vai no front-end e quem protege os dados é o RLS. **Nunca** use a `service_role` aqui, porque ela ignora o RLS e daria escrita total para qualquer visitante.

### 4. Conferir

Abra [`supabase/diagnostico.html`](supabase/diagnostico.html) no navegador. Ela roda de ponta a ponta:

- credenciais preenchidas e no formato certo, e um aviso se a chave colada for a `service_role`;
- leitura pública da tabela e presença das dez colunas;
- **se um visitante sem login consegue escrever**, que é o teste mais importante: se passar, o RLS está aberto e qualquer pessoa pode alterar o catálogo;
- modalidades gravadas batendo com `data/categories.js`;
- bucket existindo, público, e as fotos já cadastradas respondendo;
- com e-mail e senha do painel: login, cadastro, edição parcial, exclusão e upload, limpando tudo que criou.

A página é interna, tem `noindex` e não faz parte do site.

### Importar o catálogo inicial

Os 31 troféus da primeira carga estão em `data/catalogo-inicial.js`, com as fotos em `Troféus/`. Para subir todos de uma vez, abra [`supabase/importar.html`](supabase/importar.html) com o site servido por HTTP e informe o login do painel.

A página comprime cada foto no navegador, envia ao Storage, cria a linha no banco e mostra o andamento de cada item. Ela **pula** troféus cujo nome já existe, então rodar de novo depois de um erro não duplica nada. Se a linha falhar depois do upload, a foto é removida do Storage para não ficar órfã.

O botão "Só conferir" valida que todas as fotos estão no lugar, sem escrever nada.

Depois da importação o `catalogo-inicial.js` não é mais usado: a fonte de verdade passa a ser a tabela `produtos`, e a edição é pelo painel. Ele fica no repositório como registro do que subiu.

### Migrar do modo local para a nuvem

O que estiver no `localStorage` não sobe sozinho. Se você já cadastrou troféus no modo local, cadastre de novo pelo painel depois de configurar a nuvem. É o caminho mais curto enquanto o catálogo é pequeno.

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
