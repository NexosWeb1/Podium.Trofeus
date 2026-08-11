/* ============================================================
   catalogo-inicial.js: os 31 troféus da primeira carga.

   Serve só para a importação em lote (supabase/importar.html).
   O site NÃO lê este arquivo: depois de importado, a fonte de
   verdade é a tabela `produtos` no Supabase, e a edição é pelo
   painel. Guardado no repositório como registro do que subiu.

   Todas as descrições seguem o mesmo molde:

     <frase de destaque>
     <parágrafo de apoio>

     Características:

     Material Premium: ...

     Personalização: ...

     Aplicação: ...

   `imagem` é o nome do arquivo dentro da pasta Troféus/.
   `category` é a modalidade principal, que vira o selo sobre a foto.
   `categories` lista todas que o modelo atende, e é o que o filtro usa.
   Preço fica nulo em todos: o site mostra "Sob consulta".
   ============================================================ */

/** Monta a descrição no molde, para as 31 saírem idênticas em forma. */
function descrever({ destaque, apoio, material, personalizacao, aplicacao }) {
  return [
    destaque,
    apoio,
    '',
    'Características:',
    '',
    `Material Premium: ${material}`,
    '',
    `Personalização: ${personalizacao}`,
    '',
    `Aplicação: ${aplicacao}`,
  ].join('\n');
}

export const CATALOGO_INICIAL = [
  {
    name: 'Troféu Campeões Super 8',
    imagem: 'Troféu Campeões Super 8.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis'],
    description: descrever({
      destaque: 'Design inspirado na raquete de beach tennis, com presença de sobra',
      apoio:
        'MDF preto com acrílico dourado espelhado, aplique em relevo "Campeões" e espaço central para medalha. Base reforçada e acabamento refinado para valorizar a premiação de duplas.',
      material: 'MDF de alta qualidade com detalhes em acrílico dourado espelhado.',
      personalizacao: 'Medalha ou logomarca no centro e aplique em relevo "Campeões".',
      aplicacao: 'Torneios e campeonatos de beach tennis, com destaque para duplas.',
    }),
  },
  {
    name: 'Troféu Royal Truco',
    imagem: 'Troféu Royal Truco.jpeg',
    category: 'truco',
    categories: ['truco'],
    description: descrever({
      destaque: 'Design criativo inspirado nos naipes do baralho',
      apoio:
        'MDF de alta qualidade nas cores preto, branco e vermelho, com detalhes em relevo e placa frontal para a classificação. Uma peça elegante e resistente para coroar os campeões da mesa.',
      material: 'MDF de alta qualidade com acabamento premium em preto, branco e vermelho.',
      personalizacao:
        'Placa frontal com a colocação (1º, 2º ou 3º lugar), logomarca e identidade do evento.',
      aplicacao: 'Torneios, campeonatos e festivais de truco.',
    }),
  },
  {
    name: 'Troféu Octagon Beach',
    imagem: 'Troféu Octagon Beach.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis', 'futevolei'],
    description: descrever({
      destaque: 'Design geométrico octogonal que transmite força e equilíbrio',
      apoio:
        'MDF preto com acrílico dourado espelhado, silhueta de atleta em movimento e espaço central para logomarca. Base reforçada e acabamento premium para qualquer esporte de areia.',
      material: 'MDF preto de alta qualidade com detalhes em acrílico dourado espelhado.',
      personalizacao: 'Logomarca ou medalhão no centro, com silhueta esportiva em relevo.',
      aplicacao: 'Beach tennis, futevôlei e demais competições em esportes de areia.',
    }),
  },
  {
    name: 'Troféu Destaque Infinity',
    imagem: 'Troféu Destaque Infinity.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis', 'futevolei'],
    description: descrever({
      destaque: 'Linhas elegantes que simbolizam excelência, movimento e superação',
      apoio:
        'MDF de alta qualidade em branco com acrílico dourado espelhado e silhueta esportiva em destaque. O medalhão frontal recebe a identidade do evento e torna cada peça única.',
      material: 'MDF de alta qualidade em branco com detalhes em acrílico dourado espelhado.',
      personalizacao: 'Medalhão frontal com logomarca e placa para categoria ou homenagem.',
      aplicacao: 'Premiações de destaque em beach tennis, futevôlei e esportes de areia.',
    }),
  },
  {
    name: 'Troféu Supreme Fishing',
    imagem: 'Troféu Supreme Fishing.jpeg',
    category: 'pescaria',
    categories: ['pescaria'],
    description: descrever({
      destaque: 'Imponência e sofisticação para as maiores conquistas da pesca esportiva',
      apoio:
        'MDF de alta qualidade em preto e branco com acrílico dourado espelhado, base reforçada e ilustração do peixe em destaque. Um visual moderno para premiações de alto impacto.',
      material: 'MDF de alta qualidade em preto e branco com acrílico dourado espelhado.',
      personalizacao:
        'Logomarca, identidade do evento e aplicação da espécie de peixe em destaque.',
      aplicacao: 'Torneios, campeonatos e festivais de pesca esportiva.',
    }),
  },
  {
    name: 'Troféu Supreme Prestige',
    imagem: 'Troféu Supreme Prestige.jpeg',
    category: 'empresarial',
    categories: ['empresarial', 'futebol', 'futevolei', 'beach-tennis', 'volei'],
    description: descrever({
      destaque: 'Linhas contemporâneas para grandes conquistas, dentro e fora das quadras',
      apoio:
        'MDF preto premium com acrílico dourado espelhado e base reforçada. O espaço central para logomarca torna cada peça exclusiva e valoriza a identidade do evento.',
      material: 'MDF de alta qualidade em preto com detalhes em acrílico dourado espelhado.',
      personalizacao: 'Logomarca e identidade visual do evento no espaço central.',
      aplicacao:
        'Campeonatos, torneios esportivos, eventos corporativos e premiações de alto padrão.',
    }),
  },
  {
    name: 'Troféu Imperial Futevôlei',
    imagem: 'Troféu Imperial Futevôlei.jpeg',
    category: 'futevolei',
    categories: ['futevolei'],
    description: descrever({
      destaque: 'Design circular marcante, criado para os grandes campeões do futevôlei',
      apoio:
        'MDF preto premium com acrílico dourado espelhado numa composição que remete à rede, aos atletas e à bola. Amplo espaço de personalização e base reforçada.',
      material: 'MDF de alta qualidade em preto com detalhes em acrílico dourado espelhado.',
      personalizacao: 'Logomarca, nome do evento e categorias, com elementos do futevôlei em destaque.',
      aplicacao: 'Torneios, campeonatos e festivais de futevôlei.',
    }),
  },
  {
    name: 'Troféu Infinity Arena',
    imagem: 'Troféu Infinity Arena.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis', 'futevolei', 'futebol', 'volei'],
    description: descrever({
      destaque: 'Inspirado no símbolo do infinito: superação, movimento e excelência',
      apoio:
        'MDF preto premium com acrílico dourado espelhado, medalhão central personalizável e silhueta do atleta em destaque. Base reforçada e acabamento moderno.',
      material: 'MDF de alta qualidade em preto com detalhes em acrílico dourado espelhado.',
      personalizacao: 'Medalhão central com logomarca e identidade do evento.',
      aplicacao: 'Torneios, campeonatos e eventos multiesportivos.',
    }),
  },
  {
    name: 'Troféu Grand Slam',
    imagem: 'Troféu Grand Slam.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis'],
    description: descrever({
      destaque: 'A imponência das grandes competições de raquete numa peça marcante',
      apoio:
        'MDF de alta qualidade em preto e branco com acrílico dourado espelhado, numa composição que remete à rede e ao atleta em ação. Base reforçada e acabamento premium.',
      material: 'MDF de alta qualidade em preto e branco com acrílico dourado espelhado.',
      personalizacao: 'Logomarca, categoria e identidade do evento, com silhueta de atleta em destaque.',
      aplicacao: 'Torneios, campeonatos e festivais de beach tennis e modalidades de raquete.',
    }),
  },
  {
    name: 'Troféu Elite Spike',
    imagem: 'Troféu Elite Spike.jpeg',
    category: 'futevolei',
    categories: ['futevolei'],
    description: descrever({
      destaque: 'Linhas marcantes para grandes conquistas no futevôlei',
      apoio:
        'MDF preto com acrílico dourado espelhado, silhueta do atleta em movimento e elementos inspirados na rede. Área central personalizável e base reforçada.',
      material: 'MDF de alta qualidade em preto com detalhes em acrílico dourado espelhado.',
      personalizacao: 'Logomarca e identidade visual do evento na área central.',
      aplicacao: 'Campeonatos, torneios e festivais de futevôlei.',
    }),
  },
  {
    name: 'Troféu Victory Gold',
    imagem: 'Troféu Victory Gold.jpeg',
    category: 'futebol',
    categories: ['futebol'],
    description: descrever({
      destaque: 'Visual contemporâneo para os campeões do futsal e do futebol',
      apoio:
        'MDF preto com detalhes em branco e acrílico dourado espelhado, com bola estilizada no topo. Base reforçada e grande impacto visual na mesa de premiação.',
      material: 'MDF de alta qualidade em preto com acrílico dourado espelhado e detalhes em branco.',
      personalizacao: 'Logomarca e identidade visual do evento na área central.',
      aplicacao: 'Campeonatos, copas, ligas e torneios de futsal e futebol.',
    }),
  },
  {
    name: 'Troféu Pink Smash',
    imagem: 'Troféu Pink Smash.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis'],
    description: descrever({
      destaque: 'Personalidade e brilho com a raquete em acrílico rosa espelhado',
      apoio:
        'MDF preto com elementos em branco e a raquete em rosa espelhado, num visual moderno e cheio de identidade. Base reforçada e acabamento sofisticado.',
      material: 'MDF de alta qualidade em preto com raquete em acrílico rosa espelhado.',
      personalizacao: 'Logomarca e identidade do evento.',
      aplicacao: 'Torneios, campeonatos e festivais de beach tennis.',
    }),
  },
  {
    name: 'Troféu Beach Crown',
    imagem: 'Troféu Beach Crown.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis'],
    description: descrever({
      destaque: 'A energia do beach tennis num design que remete ao cenário praiano',
      apoio:
        'MDF preto com detalhes em acrílico amarelo de alto brilho e área central totalmente personalizável. Base reforçada e acabamento sofisticado.',
      material: 'MDF de alta qualidade em preto com detalhes em acrílico colorido de alto brilho.',
      personalizacao: 'Logomarca e identidade visual do evento na área central.',
      aplicacao: 'Torneios, ligas, campeonatos e festivais de beach tennis.',
    }),
  },
  {
    name: 'Troféu Destaque Elite Futvôlei',
    imagem: 'Troféu Destaque Elite Futvôlei.jpeg',
    category: 'futevolei',
    categories: ['futevolei'],
    description: descrever({
      destaque: 'Formas marcantes para performances de alto nível',
      apoio:
        'MDF preto premium com detalhes em acrílico dourado e silhueta do atleta em movimento, reforçando o dinamismo do esporte. Base reforçada e espaço para a marca do evento.',
      material: 'MDF de alta qualidade em preto com detalhes em acrílico dourado.',
      personalizacao: 'Logomarca e identidade visual do evento.',
      aplicacao: 'Campeonatos, torneios de futevôlei e premiações esportivas.',
    }),
  },
  {
    name: 'Troféu Vortex Gold Arena',
    imagem: 'Troféu Vortex Gold Arena.jpeg',
    category: 'empresarial',
    categories: ['empresarial', 'futebol', 'futevolei', 'beach-tennis', 'volei'],
    description: descrever({
      destaque: 'Formas orgânicas e contrastes marcantes, de alto impacto visual',
      apoio:
        'MDF em preto e off-white com acrílico dourado espelhado destacando a silhueta de um atleta em movimento. Espaço central para logomarca e base reforçada.',
      material: 'MDF de alta qualidade em preto e off-white com acrílico dourado espelhado.',
      personalizacao: 'Logomarca no destaque central.',
      aplicacao: 'Campeonatos, torneios esportivos e eventos corporativos.',
    }),
  },
  {
    name: 'Troféu Majestic Gold Fishing',
    imagem: 'Troféu Majestic Gold Fishing.jpeg',
    category: 'pescaria',
    categories: ['pescaria'],
    description: descrever({
      destaque: 'Imponência e realismo para as grandes conquistas da pesca esportiva',
      apoio:
        'MDF preto premium com acrílico dourado espelhado e aplique do peixe em relevo com pintura realista. Linhas curvas, base reforçada e alto padrão de acabamento.',
      material: 'MDF de alta qualidade em preto com detalhes em acrílico dourado espelhado.',
      personalizacao: 'Aplique de peixe em relevo com pintura realista e identidade do evento.',
      aplicacao: 'Torneios de pesca esportiva e eventos especiais.',
    }),
  },
  {
    name: 'Troféu Excellence Black Gold',
    imagem: 'Troféu Excellence Black Gold.jpeg',
    category: 'empresarial',
    categories: ['empresarial'],
    description: descrever({
      destaque: 'Design minimalista e sofisticado para premiações de prestígio',
      apoio:
        'MDF preto fosco com acrílico dourado espelhado e personalização central em alto relevo. Base robusta com placa metálica para gravação e visual moderno e memorável.',
      material: 'MDF preto com acrílico dourado espelhado.',
      personalizacao: 'Logomarca em alto relevo e placa na base.',
      aplicacao: 'Premiações corporativas, campanhas e reconhecimentos.',
    }),
  },
  {
    name: 'Troféu Beach Tennis Super 8',
    imagem: 'Troféu Beach Tennis Super 8.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis'],
    description: descrever({
      destaque: 'Design esportivo e marcante para grandes conquistas',
      apoio:
        'MDF preto com detalhes dourados e elementos que remetem à raquete e ao beach tennis. Um modelo moderno e totalmente personalizado para valorizar a premiação.',
      material: 'MDF preto com acrílico dourado e detalhes em acrílico branco.',
      personalizacao: 'Nome do evento, categoria, logomarca e informações da premiação.',
      aplicacao: 'Campeonatos, torneios e premiações de beach tennis.',
    }),
  },
  {
    name: 'Troféu Futevôlei Elite',
    imagem: 'Troféu Futevôlei Elite.jpeg',
    category: 'futevolei',
    categories: ['futevolei'],
    description: descrever({
      destaque: 'Design sofisticado que representa força e superação',
      apoio:
        'MDF em preto e off-white com detalhes dourados e o atleta em destaque. Uma peça moderna e imponente para valorizar grandes conquistas.',
      material: 'MDF com acabamento preto e off-white e detalhes em acrílico dourado.',
      personalizacao: 'Logomarca, nome do torneio, categoria e mensagem na base.',
      aplicacao: 'Torneios de futevôlei, campeonatos e premiações esportivas.',
    }),
  },
  {
    name: 'Troféu Arena Tropical',
    imagem: 'Troféu Arena Tropical.jpeg',
    category: 'futevolei',
    categories: ['futevolei', 'beach-tennis'],
    description: descrever({
      destaque: 'Design tropical e sofisticado para grandes conquistas',
      apoio:
        'MDF preto com detalhes em acrílico off-white e elementos que remetem ao ambiente tropical. Uma peça marcante e personalizada para valorizar a premiação.',
      material: 'MDF preto com detalhes em acrílico off-white.',
      personalizacao: 'Logomarca, nome do evento, categoria e placa na base.',
      aplicacao: 'Torneios de futevôlei, beach tennis e eventos esportivos.',
    }),
  },
  {
    name: 'Troféu Beach Tennis Prestige',
    imagem: 'Troféu Beach Tennis Prestige.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis'],
    description: descrever({
      destaque: 'Design moderno e marcante para grandes conquistas',
      apoio:
        'MDF preto com detalhes em acrílico dourado e o atleta em destaque. Uma peça sofisticada e personalizada para valorizar a identidade do torneio.',
      material: 'MDF preto com detalhes em acrílico dourado espelhado.',
      personalizacao: 'Logomarca, nome do evento, categoria e placa na base.',
      aplicacao: 'Torneios de beach tennis, campeonatos e premiações esportivas.',
    }),
  },
  {
    name: 'Troféu Beach Summer',
    imagem: 'Troféu Beach Summer.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis'],
    description: descrever({
      destaque: 'Design esportivo, moderno e vibrante',
      apoio:
        'Visual marcante que combina os elementos do beach tennis com cores fortes e acabamento sofisticado. Ideal para valorizar grandes conquistas.',
      material: 'MDF preto com detalhes em acrílico dourado espelhado e laranja.',
      personalizacao: 'Logomarca, categoria e identificação do campeão.',
      aplicacao: 'Campeonatos de beach tennis, torneios e eventos esportivos.',
    }),
  },
  {
    name: 'Troféu Raquete Rosa',
    imagem: 'Troféu Raquete Rosa.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis'],
    description: descrever({
      destaque: 'Elegância, esporte e celebração em um único troféu',
      apoio:
        'Design moderno e marcante, com destaque para as raquetes em acrílico rosa metálico sobre estrutura preta. Uma peça criada para valorizar grandes conquistas no esporte.',
      material: 'MDF preto com detalhes em acrílico rosa metálico e acabamento sofisticado.',
      personalizacao:
        'Logos, nomes de equipes, categorias e placas com Campeã, Vice-Campeã e demais colocações.',
      aplicacao:
        'Torneios de beach tennis, campeonatos, eventos e homenagens a atletas.',
    }),
  },
  {
    name: 'Troféu Impacto Vôlei',
    imagem: 'Troféu Impacto Vôlei.jpeg',
    category: 'volei',
    categories: ['volei', 'empresarial'],
    description: descrever({
      destaque: 'Força, velocidade e conquista em um só design',
      apoio:
        'Peça moderna e imponente, inspirada na dinâmica do voleibol, com composição em preto e dourado que transmite sofisticação e espírito de competição.',
      material:
        'MDF e acrílico com acabamento preto brilhante e detalhes em dourado metálico.',
      personalizacao:
        'Logos, nomes de equipes, categorias, posições e informações do campeonato.',
      aplicacao:
        'Campeonatos de vôlei, torneios, eventos corporativos e homenagens a atletas.',
    }),
  },
  {
    name: 'Troféu Mapa em Destaque',
    imagem: 'Troféu Mapa em Destaque.jpeg',
    category: 'empresarial',
    categories: ['empresarial', 'futebol', 'futevolei', 'beach-tennis', 'volei'],
    description: descrever({
      destaque: 'Uma conquista marcada na história',
      apoio:
        'Placa comemorativa sofisticada que une o mapa personalizado da região ao destaque da premiação, criando uma peça elegante e exclusiva.',
      material:
        'MDF preto com acabamento sofisticado, acrílico branco e detalhes em dourado metálico.',
      personalizacao:
        'Mapa da cidade ou região, logotipo do evento, ano, categoria, colocação e nome do homenageado.',
      aplicacao:
        'Campeonatos, eventos esportivos, premiações municipais e homenagens.',
    }),
  },
  {
    name: 'Troféu Raquete de Ouro',
    imagem: 'Troféu Raquete de Ouro.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis'],
    description: descrever({
      destaque: 'Sofisticação e paixão pelo esporte',
      apoio:
        'Design moderno que valoriza a raquete e a identidade do beach tennis, combinando transparência, dourado e preto numa peça de grande impacto visual.',
      material:
        'Acrílico cristal com detalhes em acrílico dourado e base em MDF preto.',
      personalizacao:
        'Logotipo, nome do evento, categoria, colocação, ano e nome do atleta ou equipe.',
      aplicacao:
        'Campeonatos de beach tennis, torneios, premiações e homenagens a atletas.',
    }),
  },
  {
    name: 'Troféu Beach Tennis Premium',
    imagem: 'Troféu Beach Tennis Premium.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis'],
    description: descrever({
      destaque: 'Design marcante para celebrar grandes conquistas',
      apoio:
        'Peça sofisticada que une a identidade do beach tennis a um visual moderno, com destaque para a raquete dourada e composição elegante em preto e branco.',
      material:
        'MDF preto e branco com detalhes em acrílico dourado e acabamento de alto padrão.',
      personalizacao:
        'Logotipo, nome do campeonato, categoria, colocação, ano e nome do atleta ou dupla.',
      aplicacao:
        'Campeonatos de beach tennis, circuitos, torneios e eventos especiais.',
    }),
  },
  {
    name: 'Troféu Raquete Ranking',
    imagem: 'Troféu Raquete Ranking.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis'],
    description: descrever({
      destaque: 'Destaque, desempenho e reconhecimento em cada conquista',
      apoio:
        'Design que combina a silhueta da raquete com uma área exclusiva para as informações do ranking, valorizando o atleta e a competição.',
      material:
        'Acrílico cristal e preto com detalhe em acrílico dourado e base preta sofisticada.',
      personalizacao:
        'Logotipo, nome do ranking, categoria, ano, colocação e nome do atleta.',
      aplicacao:
        'Rankings de beach tennis, campeonatos, circuitos e premiações de desempenho.',
    }),
  },
  {
    name: 'Troféu Vértice Futevôlei',
    imagem: 'Troféu Vértice Futevôlei.jpeg',
    category: 'futevolei',
    categories: ['futevolei'],
    description: descrever({
      destaque: 'Força, movimento e superação em cada conquista',
      apoio:
        'Design marcante inspirado na dinâmica do futevôlei, com silhueta do atleta, rede e composição geométrica que transmite velocidade e competitividade.',
      material:
        'MDF de alta qualidade em preto e branco com detalhes em acrílico dourado e laranja.',
      personalizacao:
        'Logomarca, nome do evento, etapa, categoria e classificação na área central.',
      aplicacao: 'Campeonatos, circuitos, etapas e torneios de futevôlei.',
    }),
  },
  {
    name: 'Troféu Victory Premium',
    imagem: 'Troféu Victory Premium.jpeg',
    category: 'empresarial',
    categories: ['empresarial', 'futebol', 'futevolei', 'beach-tennis', 'volei'],
    description: descrever({
      destaque: 'Elegância que representa a conquista',
      apoio:
        'Linhas sofisticadas com detalhes em dourado e prata, criando uma premiação de alto impacto visual e base reforçada.',
      material:
        'MDF de alta qualidade em preto com detalhes em acrílico dourado e prata.',
      personalizacao:
        'Logomarca, nome do evento, categoria, colocação e demais informações da premiação.',
      aplicacao:
        'Campeonatos, torneios esportivos, eventos corporativos e premiações de alto padrão.',
    }),
  },
  {
    name: 'Troféu Elite Beach',
    imagem: 'Troféu Elite Beach.jpeg',
    category: 'beach-tennis',
    categories: ['beach-tennis'],
    description: descrever({
      destaque: 'Potência, movimento e estilo em uma única premiação',
      apoio:
        'Design esportivo que combina a silhueta da raquete e do atleta com detalhes em dourado, verde e prata, destacando a identidade do beach tennis.',
      material:
        'MDF em preto, branco e verde com acrílico dourado espelhado e elementos prateados.',
      personalizacao:
        'Logomarca, nome do torneio, categoria, colocação e identidade visual do evento.',
      aplicacao: 'Torneios, campeonatos e copas de beach tennis.',
    }),
  },
];
