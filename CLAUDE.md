# CLAUDE.md: Podium Premiações (Landing Page)

Contexto e convenções deste projeto. Leia antes de editar.

## O que é

Landing page de conversão para a **Podium Premiações**, troféus personalizados para eventos esportivos e corporativos. Página única, PT-BR, com catálogo administrável.

Empresa irmã da **Podium Brindes** (`../Podium Brindes/`), de onde vem a arquitetura. Mesma família visual, marca diferente: quem conhece a Brindes precisa reconhecer o parentesco e perceber na hora que é outra empresa.

## Stack (sem build step)

- HTML, CSS e JavaScript puros. Nada de framework ou bundler.
- JS em ES modules nativos (`<script type="module">`), com `import` e `export`.
- Libs por CDN, versão fixada: GSAP 3.12.5 e ScrollTrigger, Lenis 1.1.13, Google Fonts, e `@supabase/supabase-js` por `esm.sh` em import dinâmico (só quando a nuvem está configurada).

## Identidade (o que a separa da Podium Brindes)

| | Podium Brindes | Podium Premiações |
|---|---|---|
| Acento primário | ouro | **prata** (`--silver-ink` no claro, `--silver` no escuro) |
| Acento secundário | prata | **ouro** (CTA, palavra de destaque do h1, selo da modalidade) |
| Apoio | nenhum | **azul de arena** `#1E3A8A`, uso pontual |
| Neutros | quentes (stone) | **frios** (slate) |
| Fonte de título | Space Grotesk | **Sora** |
| Motivo do divisor | barras do pódio | **estrela de campeonato** em anel pontilhado |
| Ritmo das seções | `D L L D L L D` | **`D D L L L D`** |
| Numerais do "Como Funciona" | bolinhas de 64px | **numerais gigantes vazados** |
| Chips do filtro | pílulas preenchidas | **abas de placar** |

## Regras de manutenção

- **Cores e tema:** só em `css/tokens.css`. Nunca hardcode hex em componente.
- **Rampa da prata:** `--silver` só em fundo escuro, `--silver-deep` só em não-texto, `--silver-ink` é o papel prata em fundo claro. O bloco de comentário no topo do `tokens.css` explica e traz as razões de contraste medidas.
- **`--grad-metal` é cromo**, não ouro. O CTA usa `--grad-gold-cta`, cuja faixa de luminância é estreita para o texto `--gold-ink` passar AA em todos os stops.
- **Catálogo:** nova modalidade é um objeto em `data/categories.js`. Produto se cadastra pelo painel, nunca editando HTML.
- **Contato:** WhatsApp, telefone, e-mail, Instagram, endereço e horário só em `js/config.js`.
- **Sem preço:** o catálogo não mostra valor em lugar nenhum. A coluna `preco` e o mapeamento do store continuam de pé; o `js/price.js` está parado, sem importador. Se voltar a ter preço, o input do painel tem de ser `type="text"`, nunca `number`: o `number` engole vírgula decimal em pt-BR e devolve string vazia sem avisar.
- **Scroll:** toda âncora usa `lenis.scrollTo`, nunca `scrollIntoView`.
- **Animações:** só `transform` e `opacity`. O estado base do CSS é visível; o JS adiciona `.js-anim` para revelar, então conteúdo nunca fica preso escondido. Tudo desliga sob `prefers-reduced-motion`.
- **Header:** fundo sólido depois do scroll (`--header-bg`). Nada de `backdrop-filter` no header: ele cria um containing block que quebra o `position: fixed` do menu mobile, que é filho dele.
- **`main` tem `overflow-x: clip`:** os reveals horizontais deslocam elementos em 32px e criavam scroll lateral no celular. `clip` corta sem virar container de rolagem, então o `position: sticky` da barra de filtros continua funcionando (o que não aconteceria com `hidden`).
- **A11y:** semântica, um único `<h1>` (hero), `:focus-visible` sempre visível, `<label>` reais, alt em imagem, foco e Esc e trava de scroll nos modais.

## Armadilhas já resolvidas (não reintroduzir)

- `new Date('2026-08-03').toLocaleDateString('pt-BR')` devolve o **dia anterior** em UTC-3, porque ISO só com data parseia como meia-noite UTC. O `formatDateBR` em `js/form.js` faz regex na string, sem `new Date`.
- `toRow()` em `js/store.js` omite chaves `undefined`. Sem isso, um `updateProduct(id, { featured: true })` apagaria nome, categoria e a lista de modalidades.
- `lsWrite()` tem guarda de quota: no modo local as fotos são dataURL base64 na mesma chave, e o teto de ~5 MB chega rápido.
- O marquee repete a lista até ter 12 itens antes de duplicar. Com meia dúzia de modalidades, a metade não preenchia telas largas e aparecia um vão.
- **Acrescentar modalidade mexe em dois lugares:** o objeto em `data/categories.js` e os dois `check` de `supabase/schema.sql`, que precisam ser re-rodados no SQL Editor. Só o primeiro e o cadastro é recusado pelo banco com "violates check constraint". A contagem nos testes deriva da lista, então essa não precisa de ajuste.
- **Um troféu tem uma modalidade principal e uma lista.** `categoria` é a principal, e é ela que vira o selo sobre a foto. `categorias` é a lista completa, e é ela que todo filtro usa (catálogo, formulário e painel). A principal está sempre dentro da lista: o banco garante por gatilho, o `store.js` garante por `normalizeCategories`, e há uma trava conferindo. Filtrar por `categoria` esconderia um troféu de beach tennis que também serve futevôlei.
- `.admin-card__media img` usa `contain`, não `cover`: troféu é alto e estreito e o `cover` cortava a taça.
- **`.about` e `.hero` são escuros por regra própria, sem a classe `.section--dark`.** Toda regra de contexto escuro precisa listar os três, senão um token de fundo claro (`--accent`, `--gold-cta`) vaza para cima do grafite e reprova contraste. Já aconteceu com `.eyebrow` e com `.link-arrow`.
- **`.field input` não pode pegar checkbox nem radio.** Com `width: 100%` e `min-height: 48px` eles viram um quadradão, e o estrago só aparece quando o rótulo ao lado quebra em duas linhas. A exclusão vai dentro de `:where()`, que tem especificidade zero: sem isso o seletor sobe de 0,1,1 para 0,3,1 e passa na frente de `.color-custom input[type=color]`.
- **A foto do card tem `padding-top: 3rem`** para o selo da modalidade não cair em cima do troféu. Se o selo mudar de tamanho, o padding acompanha.
- **Ouro sólido no texto é a assinatura da Podium Brindes.** A palavra de destaque do h1 usa a rampa do pódio inteira (`--grad-podium-text`), não ouro puro. Já foi cromo, e nesse tom ela sumia ao lado do branco da linha de cima.
- **A fita do topo da foto do hero mora no `.hero__shine`**, e não no `.hero__stage`. O shine tem `overflow: hidden` e o mesmo raio da foto; no stage, que não recorta, as pontas da barra sobravam para fora do canto arredondado. Por isso o `prefers-reduced-motion` esconde só o `::after` do shine, nunca o elemento.
- **O hero não é `min-height: 100dvh` abaixo de 900px.** Empilhado, o conteúdo passa da altura da tela, e com `align-items: center` o excedente vaza pelos dois lados igualmente, comendo o `padding-top` que segura a foto embaixo do header fixo. No empilhado a altura mínima sai e o espaço vira padding de verdade.
- **A seção depois do `.section-divider` tem `padding-top: 0`.** O padding do divisor é a pausa inteira entre as duas seções, os dois lados dela. Somar o `--section-y` do catálogo em cima disso punha a estrela com o triplo de espaço embaixo do que em cima.
- **Rótulo centrado precisa de compensação.** O traço do pódio é item do flex do `.eyebrow` e entra na largura da caixa: centrar a caixa deixa o texto meio traço à direita do eixo. O `.section-head--center .eyebrow` leva um `padding-inline-end` do tamanho do traço mais o gap, medido pela variável `--eyebrow-tick` para os dois não desencontrarem.
- A barra de filtros do catálogo é `sticky` e opaca, então rola por cima do conteúdo. As lavagens coloridas da seção começam **abaixo** dela de propósito; se subirem, aparece um retângulo branco deslizando.

## Como a cor entra

Três papéis, e cada cor só faz o seu. Manter essa divisão ao adicionar componente novo.

**Fita do pódio** (`--grad-podium`: bronze, prata, ouro) é a **assinatura**. Aparece antes de cada `.eyebrow` (menos o do hero abaixo de 900px, onde o rótulo centra e o traço ficaria sobrando ao lado da primeira linha), no sublinhado do nav, embaixo da barra de filtros, no topo do card em hover, recortada na palavra de destaque do h1 do hero (classe `.text-podium`), no topo da foto do hero, na linha de progresso do "Como Funciona", no topo do formulário e fechando o rodapé. Vem direto da rampa que está na logo.

**Azul** (`--sport`) é **interação**: link, foco, chip de modalidade ativo, página atual do paginador, "Ver detalhes" do card, asterisco de campo obrigatório, numerais acesos do "Como Funciona", hover do botão de contorno. Em fundo escuro usa `--sport-bright` (o `--sport` daria 1,9:1).

**Ouro** é **valor**: botão de CTA, selo da modalidade sobre a foto, estrela do divisor, rótulos de seção e títulos do rodapé. Em fundo claro sempre `--gold-cta` (5:1); em fundo escuro sempre `--gold` (9,47:1).

Uma exceção deliberada ao azul, para o metal aparecer onde a marca pede: os **links do rodapé** vão de `--bronze` (5,60:1 sobre `--graphite-950`), com `--bronze-light` no hover. É o terceiro metal da rampa, que só apareceria em gradiente.

O miolo claro não é branco puro: catálogo, "Como Funciona" e orçamento levam lavagens radiais bem fracas (`--wash-gold`, `--wash-bronze`, `--wash-sport`) sobre a base branca. É o que tira o ar de página morta sem virar site colorido.

Há uma auditoria de contraste que mede o pixel renderizado (apaga o texto, fotografa, lê o fundo real em cinco pontos por linha). Rodar depois de qualquer mexida em cor: calcular contraste pela cor declarada dá falso positivo em tudo que está sobre gradiente, e metade das seções usa gradiente.

## Verificar antes de entregar

- 6 seções na ordem do escopo, sem seção de benefícios.
- Filtro do catálogo mostra só a modalidade escolhida; modalidade sem produto mostra estado vazio.
- Card mostra foto e nome; o selo da modalidade não pode cobrir o troféu.
- Painel: login, CRUD, upload, caixas de modalidade, filtro, e o site reflete tudo.
- Formulário com os 9 campos abre `wa.me` pré-preenchido, com quebras de linha reais. Testar o fallback de popup bloqueado.
- Responsivo em 360, 768 e 1280, sem scroll horizontal. Menu vira hamburger com fundo sólido abaixo de 900px.
- Console sem erros nas duas páginas.
- Lighthouse mobile: Performance acima de 90, Acessibilidade acima de 95, Boas Práticas e SEO acima de 95.
- Rodar a limpeza de copy (skill `remove-IAs-signal`) e a varredura `publish-in-git` antes de qualquer commit.
