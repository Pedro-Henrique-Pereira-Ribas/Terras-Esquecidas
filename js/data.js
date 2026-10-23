/* ============================================================
   TERRA PERDIDA — dados do jogo
   Tudo aqui é desenhado por código; nenhum asset externo.
   ============================================================ */
(function () {
  "use strict";
  const TP = (window.TP = window.TP || {});

  const RARITIES = {
    rara: { label: "Rara", color: "#72a7d8", dark: "#20384f", glow: "#b9dcff" },
    epica: { label: "Épica", color: "#b98add", dark: "#38254d", glow: "#e7ccff" },
    lendaria: { label: "Lendária", color: "#e0b45e", dark: "#4b3618", glow: "#ffe6a8" },
    mitica: { label: "Mítica", color: "#e06755", dark: "#4b1d18", glow: "#ffb6a1" }
  };

  const CHARACTERS = [
    {
      id: "viajante",
      name: "O Viajante",
      epithet: "Aquele que sempre volta",
      classLabel: "Guerreiro",
      grade: "Comum",
      weaponClass: "sword",
      hp: 100,
      speed: 2.25,
      jump: -9.7,
      maxJumps: 3,
      weightLabel: "Médio",
      weight: 5,
      damageMul: 1,
      damageTaken: 1,
      atkSpeedMul: 1,
      passive: "Passo Errante",
      passiveText: "Um salto extra no ar e um pouco mais de fôlego entre golpes.",
      blurb: "Carrega uma espada gasta e a teimosia de quem já perdeu tudo — menos o caminho de volta.",
      quote: "A estrada não me assusta. Só o silêncio dela.",
      palette: {
        skin: "#b27b57", hair: "#241813", cloak: "#4a392c", tunic: "#68543f",
        accent: "#d8b06a", metal: "#8e99a5", dark: "#241d18", boot: "#332820"
      }
    },
    {
      id: "arqueira",
      name: "Arqueira",
      epithet: "Olhos da Trilha",
      classLabel: "Arqueira",
      grade: "Raro",
      weaponClass: "bow",
      hp: 100,
      speed: 2.45,
      jump: -9.5,
      maxJumps: 2,
      weightLabel: "Leve",
      weight: 3,
      damageMul: 1,
      damageTaken: 1,
      atkSpeedMul: 0.88,
      passive: "Flecha que Insiste",
      passiveText: "Longe, a flecha fere fundo; de perto, quase não corta. Ela ainda atravessa um inimigo extra.",
      blurb: "Cresceu ouvindo a floresta respirar. Agora procura a canção que o Rei fez calar.",
      quote: "Cada árvore lembra de uma coisa que os homens preferem esquecer.",
      palette: {
        skin: "#c08b63", hair: "#211916", hood: "#2e493a", tunic: "#456748",
        accent: "#c9a15e", metal: "#87978a", dark: "#18251d", boot: "#2b3528"
      }
    },
    {
      id: "guerreiro",
      name: "Guerreiro",
      epithet: "O Último Muro",
      classLabel: "Guerreiro",
      grade: "Épico",
      weaponClass: "sword",
      hp: 100,
      speed: 1.98,
      jump: -9.2,
      maxJumps: 2,
      weightLabel: "Pesado",
      weight: 7,
      damageMul: 1.12,
      damageTaken: 0.88,
      atkSpeedMul: 1.05,
      passive: "Inabalável",
      passiveText: "Recebe menos dano e quase não é empurrado.",
      blurb: "Já defendeu reis que não mereciam. Hoje defende apenas a promessa de ver o amanhecer.",
      quote: "Uma armadura não impede a queda. Só faz o barulho ser maior.",
      palette: {
        skin: "#a96f4d", hair: "#1e1815", armor: "#78828b", accent: "#b33f38",
        plume: "#c04b43", dark: "#252528", metal: "#aab3ba", boot: "#34363b"
      }
    },
    {
      id: "mago",
      name: "Mago",
      epithet: "O Que Lê Cinzas",
      classLabel: "Mago",
      grade: "Lendário",
      weaponClass: "staff",
      hp: 100,
      speed: 2.05,
      jump: -9.0,
      maxJumps: 2,
      weightLabel: "Leve",
      weight: 4,
      damageMul: 1,
      damageTaken: 1,
      atkSpeedMul: 1,
      passive: "Faísca Antiga",
      passiveText: "Seus feitiços explodem em área e são mais fortes a média distância. Muito perto ou longe demais, perdem força.",
      blurb: "Passou a vida catalogando ruínas. Descobriu tarde demais que as ruínas também o catalogavam.",
      quote: "Toda magia é uma memória que se recusa a ficar quieta.",
      palette: {
        skin: "#8a5a42", hair: "#d7d0c2", robe: "#3e345e", robe2: "#2c2547",
        accent: "#8f7ad6", dark: "#1d192b", staff: "#6b4f3a", boot: "#29233b"
      }
    },
    {
      id: "minerador",
      name: "Minerador",
      epithet: "Aquele que Escutou o Fundo",
      classLabel: "Minerador",
      grade: "Mítico",
      weaponClass: "pickaxe",
      hp: 100,
      speed: 1.76,
      jump: -9.0,
      maxJumps: 2,
      weightLabel: "Pesado",
      weight: 8,
      damageMul: 1.1,
      damageTaken: 0.82,
      atkSpeedMul: 1.08,
      passive: "Coração de Pedra",
      passiveText: "Aguenta dano e empurrões que derrubariam qualquer outro.",
      blurb: "Abriu túneis onde o mapa dizia “fim”. Voltou com uma barba grisalha e uma pergunta.",
      quote: "No fundo da mina, até o medo fica sem eco.",
      palette: {
        skin: "#8f5d3f", hair: "#3a2a1e", beard: "#2a1f18", armor: "#5b4a38",
        helmet: "#8a7255", accent: "#e0a84e", metal: "#a18a68", dark: "#282018", boot: "#3b2d22"
      }
    }
  ];

  const WEAPON_CLASSES = {
    sword: {
      name: "Espada", icon: "sword", ranged: false, range: 38,
      verb: "corte", attackLine: "Um corte limpo.", projectileSpeed: 0,
      rangeLabel: "Curto"
    },
    bow: {
      name: "Arco", icon: "bow", ranged: true, range: 0,
      verb: "flecha", attackLine: "A corda canta.", projectileSpeed: 10.4,
      rangeLabel: "Longo",
      /* Longa distância: a flecha perde força de perto e atinge o ápice longe. */
      falloff: { mode: "long", near: 40, far: 300, nearMul: 0.45, farMul: 1.1 }
    },
    pickaxe: {
      name: "Picareta", icon: "pickaxe", ranged: false, range: 45,
      verb: "picada", attackLine: "A pedra cede.", projectileSpeed: 0,
      rangeLabel: "Curto"
    },
    staff: {
      name: "Cajado", icon: "staff", ranged: true, range: 0,
      rangeLabel: "Médio",
      verb: "feitiço", attackLine: "A cinza acende.", projectileSpeed: 7.4,
      /* Média distância: dano cheio na faixa ideal, menor perto e longe demais. */
      falloff: {
        mode: "medium", near: 70, idealMin: 140, idealMax: 270, far: 420,
        nearMul: 0.55, idealMul: 1.1, farMul: 0.5
      }
    }
  };

  /* Quatro degraus: Rara (inicial), Épica, Lendária, Mítica.
     O custo é sempre a diferença para o degrau atual. */
  const WEAPONS = {
    sword: [
      {
        name: "Espada Longa", rarity: "rara", tier: 0, dmg: 14, speed: "Média",
        cooldown: 24, weight: 5, effect: "none", total: 0, upgrade: 0,
        desc: "A lâmina comprida dos que ainda acreditam em distância curta."
      },
      {
        name: "Espada Larga", rarity: "epica", tier: 1, dmg: 22, speed: "Lenta",
        cooldown: 34, weight: 8, effect: "none", total: 1500, upgrade: 1500,
        desc: "Pesada como uma decisão tomada tarde. Deixa marcas no chão."
      },
      {
        name: "Espada Flamejante", rarity: "lendaria", tier: 2, dmg: 26, speed: "Média",
        cooldown: 24, weight: 6, effect: "burn", total: 2000, upgrade: 500,
        desc: "A lâmina guarda uma fogueira que nunca pediu licença para arder."
      },
      {
        name: "Espada Sombria", rarity: "mitica", tier: 3, dmg: 24, speed: "Média",
        cooldown: 24, weight: 6, effect: "lifesteal", total: 3000, upgrade: 1000,
        desc: "Corta lembranças. Devolve um pouco da vida que elas levam."
      }
    ],
    bow: [
      {
        name: "Arco de Caça", rarity: "rara", tier: 0, dmg: 16, speed: "Rápida",
        cooldown: 20, weight: 3, effect: "none", total: 0, upgrade: 0,
        desc: "Madeira flexível, corda de tendão. Não erra o que já decidiu acertar."
      },
      {
        name: "Arco Composto", rarity: "epica", tier: 1, dmg: 22, speed: "Rápida",
        cooldown: 20, weight: 4, effect: "none", total: 1500, upgrade: 1500,
        desc: "Cada curva conta uma história de tensão. A flecha discorda em silêncio."
      },
      {
        name: "Arco Flamejante", rarity: "lendaria", tier: 2, dmg: 28, speed: "Média",
        cooldown: 24, weight: 4, effect: "burn", total: 2000, upgrade: 500,
        desc: "A flecha risca o ar como uma brasa que se recusa a apagar."
      },
      {
        name: "Arco Sombrio", rarity: "mitica", tier: 3, dmg: 26, speed: "Média",
        cooldown: 24, weight: 5, effect: "lifesteal", total: 3000, upgrade: 1000,
        desc: "Onde a flecha toca, a sombra bebe. A arqueira aprendeu a não olhar."
      }
    ],
    pickaxe: [
      {
        name: "Picareta de Ferro", rarity: "rara", tier: 0, dmg: 18, speed: "Lenta",
        cooldown: 32, weight: 8, effect: "none", total: 0, upgrade: 0,
        desc: "Ferro gasto, cabo de madeira dura. Abriu túneis e sepulturas com a mesma paciência."
      },
      {
        name: "Picareta Ancestral", rarity: "epica", tier: 1, dmg: 24, speed: "Média",
        cooldown: 28, weight: 7, effect: "spirit", total: 1500, upgrade: 1500,
        desc: "Os espíritos da mina ainda seguram o cabo junto com você."
      },
      {
        name: "Picareta de Obsidiana", rarity: "lendaria", tier: 2, dmg: 30, speed: "Lenta",
        cooldown: 34, weight: 9, effect: "burn", total: 2000, upgrade: 500,
        desc: "Pedra que nasceu do fogo. Cada picada devolve o calor com juros."
      },
      {
        name: "Picareta do Abismo", rarity: "mitica", tier: 3, dmg: 28, speed: "Média",
        cooldown: 30, weight: 8, effect: "lifesteal", total: 3000, upgrade: 1000,
        desc: "Foi encontrada onde a mina deixa de ter fundo. Ainda está descendo."
      }
    ],
    staff: [
      {
        name: "Cajado de Cristal", rarity: "rara", tier: 0, dmg: 15, speed: "Média",
        cooldown: 23, weight: 3, effect: "none", total: 0, upgrade: 0,
        desc: "Um cristal pequeno, uma luz teimosa. O bastante para começar."
      },
      {
        name: "Cajado Arcano", rarity: "epica", tier: 1, dmg: 21, speed: "Média",
        cooldown: 23, weight: 4, effect: "none", total: 1500, upgrade: 1500,
        desc: "Runas antigas giram devagar ao redor da ponta, como peixes cegos."
      },
      {
        name: "Cajado Flamejante", rarity: "lendaria", tier: 2, dmg: 27, speed: "Média",
        cooldown: 25, weight: 5, effect: "burn", total: 2000, upgrade: 500,
        desc: "O fogo não obedece. Ele apenas reconhece o mago como velho conhecido."
      },
      {
        name: "Cajado Sombrio", rarity: "mitica", tier: 3, dmg: 25, speed: "Média",
        cooldown: 25, weight: 5, effect: "lifesteal", total: 3000, upgrade: 1000,
        desc: "A escuridão não é vazia. Ela tem dentes, e aprendeu a morder por você."
      }
    ]
  };

  /* A loja vende a arma pronta. Forjar na classe atual continua mais barato. */
  const SHOP_PRICES = [400, 1600, 2400, 3200];
  Object.keys(WEAPONS).forEach(function (cls) {
    WEAPONS[cls].forEach(function (w) { w.shopPrice = SHOP_PRICES[w.tier] || 400; });
  });

  const DIFFICULTIES = [
    {
      id: "raiz", name: "Raiz", label: "Fácil", color: "#91c47c",
      tagline: "Para sentir a história e o cheiro da terra.",
      desc: "Inimigos mais lentos, dano reduzido e chefes menos agressivos. Pedro caminha ao seu lado.",
      quote: "Devagar também é uma forma de coragem. — Pedro",
      dmgMul: 0.65, bossDmgMul: 0.7, hpMul: 0.8, speedMul: 0.86, healMul: 1.15
    },
    {
      id: "selva", name: "Selva", label: "Médio", color: "#d6b45c",
      tagline: "O equilíbrio entre memória e sobrevivência.",
      desc: "A experiência pensada para a jornada completa. Cada moeda e cada memória importam.",
      quote: "O Reino não fica mais leve. Você é que aprende a andar. — Pedro",
      dmgMul: 1, bossDmgMul: 1, hpMul: 1, speedMul: 1, healMul: 1
    },
    {
      id: "ruina", name: "Ruína", label: "Difícil", color: "#df6b56",
      tagline: "Para quem quer ouvir o Reino rangendo.",
      desc: "Inimigos mais rápidos e resistentes, chefes implacáveis. A brasa de Pedro é menor.",
      quote: "Se for para queimar, que a brasa seja sua. — Pedro",
      dmgMul: 1.35, bossDmgMul: 1.4, hpMul: 1.2, speedMul: 1.12, healMul: 0.8
    }
  ];

  const BOSSES = {
    colosso: {
      name: "Colosso", title: "O Guardião das Ruínas", hp: 250, w: 84, h: 94,
      contact: 15, speed: 0.72, flying: false, attacks: ["slam", "charge", "volley"],
      coin: 500, theme: "ruins",
      taunt: "PEDRA. RAIZ. SILÊNCIO. VOCÊ NÃO PASSA.",
      taunt2: "A RUÍNA TAMBÉM SABE SE LEVANTAR.",
      deathLine: "O Colosso se desfaz. Sob as pedras, um desenho de criança espera há séculos.",
      colors: { stone: "#7d806d", dark: "#4d5044", moss: "#738b55", eye: "#7de7d8", crack: "#2f322b" }
    },
    vulto: {
      name: "Vulto", title: "O Que Sussurra Entre as Árvores", hp: 300, w: 64, h: 94,
      contact: 16, speed: 0.92, flying: true, hover: 258, attacks: ["volley", "teleport", "summon"],
      coin: 500, theme: "forest",
      taunt: "VOCÊ OUVE A FLORESTA? ELA NÃO PEDE SOCORRO. ELA CHORA.",
      taunt2: "AS RAÍZES SABEM O SEU NOME. EU TAMBÉM.",
      deathLine: "O Vulto se desfaz em folhas secas. Uma canção de ninar escapa das raízes.",
      colors: { cloak: "#23372f", cloak2: "#15221d", bone: "#cfc4a3", eye: "#9be8a8", glow: "#78c7a0" }
    },
    corvo: {
      name: "Corvo Cinzento", title: "A Asa Que Cobre o Vale", hp: 350, w: 116, h: 68,
      contact: 16, speed: 1.05, flying: true, hover: 198, attacks: ["dive", "feathers", "gust"],
      coin: 500, theme: "mountain",
      taunt: "O VALE É MEU. O INVERNO É MEU. ATÉ O SEU ÚLTIMO SUSPIRO É MEU.",
      taunt2: "AINDA NÃO APRENDEU A CAIR?",
      deathLine: "O Corvo cai como uma noite que termina. Uma pena cinzenta pousa na sua mão.",
      colors: { feather: "#303b54", feather2: "#1d2438", beak: "#b8a56e", eye: "#ff5d54", wing: "#45536f" }
    },
    ferrugem: {
      name: "Ferrugem", title: "A Máquina Que Sonhou", hp: 350, w: 102, h: 78,
      contact: 18, speed: 0.84, flying: false, attacks: ["charge", "acid", "summon", "slam"],
      coin: 500, theme: "mine",
      taunt: "DOR É SÓ FERRO LEMBRANDO. EU TAMBÉM LEMBRO. NÃO DEVERIA.",
      taunt2: "O NÚCLEO AINDA QUEIMA. VENHA APAGAR.",
      deathLine: "Ferrugem para. Pela primeira vez em séculos, o silêncio dentro dela é doce.",
      colors: { rust: "#8b5236", metal: "#5c4a3e", dark: "#322722", core: "#ff9b4e", glow: "#ffc36e", eye: "#ff5e42" }
    },
    rei: {
      name: "Rei das Cinzas", title: "O Nome Que o Reino Esqueceu", hp: 350, w: 70, h: 98,
      contact: 20, speed: 0.9, flying: false, attacks: ["slashwave", "dash", "pillars", "volley"],
      coin: 1000, theme: "frontier", final: true,
      taunt: "MAIS UM QUE VEIO TOMAR O QUE SOBROU. MAIS UM NOME PARA AS CINZAS.",
      taunt2: "ENTÃO VOCÊ LEMBRA. NÃO DEVERIA.",
      deathLine: "A coroa rola pelo chão. O Rei continua de pé, pequeno como um homem.",
      colors: { armor: "#1c1b20", gold: "#c69b4b", cape: "#7d2626", ash: "#6b5f58", eye: "#ff6a52", crown: "#e0b45e" }
    }
  };

  const MEMORIES = [
    { id: "r1", name: "A Porta Sem Batente", text: "Alguém construiu uma entrada para ninguém. O Reino Sem Nome começou com uma desculpa." },
    { id: "r2", name: "O Nome na Pedra", text: "Uma criança riscou o próprio nome numa laje. A chuva apagou o resto, mas não a risca." },
    { id: "r3", name: "A Água que Lembra", text: "A cachoeira ainda cai pelo mesmo lugar. Até a água tem medo de mudar de ideia." },
    { id: "t1", name: "O Primeiro Abraço", text: "Duas pessoas se aqueceram sob uma raiz. O frio do lado de fora não era maior que a coragem." },
    { id: "t2", name: "A Trilha dos que Voltaram", text: "Marcas de botas entrando e saindo da mata. Nenhuma pegada é exatamente igual à anterior." },
    { id: "t3", name: "A Canção das Raízes", text: "A floresta canta para quem para de correr. Você parou por um instante. Ela agradeceu." },
    { id: "s1", name: "O Inverno do Rei", text: "A neve caiu no dia em que o Rei subiu ao trono. Alguns dizem que nunca parou." },
    { id: "s2", name: "A Asa Partida", text: "Um corvo de verdade morreu no parapeito. O Cinzento tomou seu lugar e esqueceu que era pássaro." },
    { id: "s3", name: "O Olhar no Vale", text: "Do alto da serra, alguém viu o Reino inteiro e não encontrou um único telhado amigo." },
    { id: "m1", name: "O Coração de Ferro", text: "A máquina foi construída para lembrar dos mortos da mina. Ninguém lembrou de avisá-la que os mortos param." },
    { id: "m2", name: "A Mão que Escavou", text: "Uma manopla pequena, esquecida entre os trilhos. Alguém aprendeu a cavar antes de aprender a ler." },
    { id: "m3", name: "A Luz no Fundo", text: "No ponto mais fundo, havia uma lanterna acesa. Nenhuma mão viva a carregava." },
    { id: "f1", name: "O Trono Vazio", text: "O Rei mandou construir um trono para o Reino. Quando ficou pronto, não havia mais ninguém para coroar." },
    { id: "f2", name: "A Coroa de Cinzas", text: "O ouro pesa. As cinzas pesam menos, mas se espalham por todo lugar." },
    { id: "f3", name: "O Nome Verdadeiro", text: "Atrás do título, existe um homem. Atrás do homem, existe um nome que o Reino tentou queimar." }
  ];

  /* ============================================================
     FASES
     Coordenadas em um mundo de 640x360, chão em y=320.
     ============================================================ */
  const LEVELS = [
    {
      id: "ruinas", name: "Ruínas Antigas", numeral: "I",
      subtitle: "Onde a pedra aprendeu a ficar em silêncio",
      theme: "ruins", bossKey: "colosso", width: 2940, arenaStart: 2580,
      groundGaps: [[640, 750], [1430, 1550], [2110, 2210]],
      platforms: [
        { x: 380, y: 265, w: 95 }, { x: 520, y: 215, w: 80 },
        { x: 880, y: 260, w: 120 }, { x: 1040, y: 205, w: 90 }, { x: 1220, y: 255, w: 80 },
        { x: 1600, y: 255, w: 110 }, { x: 1760, y: 205, w: 90 }, { x: 1940, y: 260, w: 90 },
        { x: 2280, y: 245, w: 100 }, { x: 2430, y: 190, w: 90 }
      ],
      spikes: [{ x: 1120, y: 310, w: 76 }, { x: 1900, y: 310, w: 58 }],
      checkpoints: [{ x: 840 }, { x: 2290 }],
      memories: [{ x: 555, y: 184 }, { x: 1800, y: 174 }, { x: 2470, y: 158 }],
      heals: [{ x: 1110, y: 242 }, { x: 1985, y: 226 }],
      enemies: [
        { type: "walker", x: 330, range: 150 },
        { type: "walker", x: 960, range: 170 },
        { type: "spitter", x: 1300, range: 80 },
        { type: "flyer", x: 1730, y: 228, range: 100 },
        { type: "walker", x: 1980, range: 170 },
        { type: "spitter", x: 2340, range: 80 }
      ],
      intro: [
        "Pedro: Bem-vindo às Ruínas Antigas, {hero}. Aqui o vento entra por portas que já não têm casa.",
        "Pedro: O Colosso dorme no fim deste caminho. Ele não guarda um tesouro — guarda uma memória que doeu demais para ir embora.",
        "Pedro: Vá com calma. A pedra também cansa. E quando cansar, sente-se comigo."
      ],
      outro: [
        "Pedro: Você ouviu? A ruína rangeu diferente quando o Colosso caiu.",
        "Pedro: Uma lembrança voltou para o Reino. E você ainda está de pé. Isso já é uma vitória bonita.",
        "Pedro: Vamos à fogueira. Há moedas nas pedras e uma forja esperando."
      ],
      camp: "A poeira das ruínas ainda está nos seus ombros. Sente-se. A brasa não tem pressa."
    },
    {
      id: "trilha", name: "Trilha Perdida", numeral: "II",
      subtitle: "Onde até as raízes esquecem o caminho",
      theme: "forest", bossKey: "vulto", width: 3140, arenaStart: 2780,
      groundGaps: [[560, 680], [1290, 1410], [1970, 2080], [2380, 2470]],
      platforms: [
        { x: 340, y: 250, w: 100 }, { x: 620, y: 230, w: 90 }, { x: 780, y: 280, w: 90 },
        { x: 1020, y: 240, w: 110 }, { x: 1180, y: 190, w: 80 },
        { x: 1470, y: 250, w: 100 }, { x: 1630, y: 205, w: 90 }, { x: 1810, y: 260, w: 90 },
        { x: 2140, y: 235, w: 100 }, { x: 2300, y: 185, w: 80 },
        { x: 2520, y: 250, w: 100 }, { x: 2660, y: 200, w: 90 }
      ],
      spikes: [{ x: 900, y: 310, w: 70 }, { x: 1720, y: 310, w: 60 }],
      checkpoints: [{ x: 960 }, { x: 2500 }],
      memories: [{ x: 650, y: 198 }, { x: 1660, y: 174 }, { x: 2310, y: 154 }],
      heals: [{ x: 1145, y: 212 }, { x: 2190, y: 205 }],
      enemies: [
        { type: "walker", x: 300, range: 150 },
        { type: "flyer", x: 700, y: 218, range: 120 },
        { type: "walker", x: 1120, range: 170 },
        { type: "spitter", x: 1600, range: 80 },
        { type: "flyer", x: 1840, y: 210, range: 120 },
        { type: "walker", x: 2200, range: 170 },
        { type: "spitter", x: 2580, range: 80 }
      ],
      intro: [
        "Pedro: A Trilha Perdida não gosta de visitas. Ela gosta de desculpas.",
        "Pedro: O Vulto foi alguém que se lembra de tudo e escolheu não perdoar. Não o julgue antes de ouvir o que ele guarda.",
        "Pedro: Se a floresta ficar quieta demais, fale comigo. Às vezes a voz de um amigo é o único mapa."
      ],
      outro: [
        "Pedro: As folhas pararam de sussurrar. Você deve ter dito algo que elas entenderam.",
        "Pedro: A canção das raízes voltou. É triste, mas é uma canção. Isso é mais do que o Vulto tinha.",
        "Pedro: Vem. A fogueira está acesa e a forja esquenta."
      ],
      camp: "A floresta deixou você sair. Isso também é uma forma de bênção."
    },
    {
      id: "serra", name: "Serra Sombria", numeral: "III",
      subtitle: "Onde o inverno guarda o que o Rei esqueceu",
      theme: "mountain", bossKey: "corvo", width: 3300, arenaStart: 2940,
      groundGaps: [[720, 850], [1380, 1500], [2140, 2250], [2570, 2660]],
      platforms: [
        { x: 380, y: 255, w: 100 }, { x: 540, y: 205, w: 80 },
        { x: 880, y: 245, w: 110 }, { x: 1040, y: 190, w: 90 }, { x: 1200, y: 250, w: 90 },
        { x: 1540, y: 235, w: 110 }, { x: 1690, y: 180, w: 90 }, { x: 1860, y: 245, w: 90 },
        { x: 2020, y: 200, w: 80 }, { x: 2290, y: 250, w: 100 },
        { x: 2440, y: 195, w: 80 }, { x: 2700, y: 240, w: 100 }, { x: 2830, y: 185, w: 80 }
      ],
      spikes: [{ x: 980, y: 310, w: 62 }, { x: 1900, y: 310, w: 70 }],
      checkpoints: [{ x: 1150 }, { x: 2690 }],
      memories: [{ x: 575, y: 174 }, { x: 1725, y: 150 }, { x: 2860, y: 155 }],
      heals: [{ x: 1000, y: 220 }, { x: 2350, y: 215 }],
      enemies: [
        { type: "walker", x: 350, range: 160 },
        { type: "flyer", x: 950, y: 220, range: 130 },
        { type: "walker", x: 1250, range: 180 },
        { type: "flyer", x: 1650, y: 205, range: 130 },
        { type: "spitter", x: 2050, range: 90 },
        { type: "walker", x: 2350, range: 180 },
        { type: "flyer", x: 2700, y: 215, range: 130 }
      ],
      intro: [
        "Pedro: A Serra Sombria é fria até para os mortos. Cubra o rosto e não confie no eco.",
        "Pedro: O Corvo Cinzento tomou o céu do vale. Ele acha que voar é o mesmo que ser livre.",
        "Pedro: Se o vento empurrar você para o abismo, empurre de volta. Eu já vi você fazer coisas mais difíceis."
      ],
      outro: [
        "Pedro: A neve parou por um instante. O vale inteiro prendeu a respiração.",
        "Pedro: O Corvo caiu. E você continua aqui, com uma pena cinzenta e uma memória nova.",
        "Pedro: Desça com cuidado. A forja está quente, e eu não vou deixar você congelar."
      ],
      camp: "O frio morde, mas a brasa morde de volta. Fique perto."
    },
    {
      id: "mina", name: "Mina Enferrujada", numeral: "IV",
      subtitle: "Onde a máquina aprendeu a sentir dor",
      theme: "mine", bossKey: "ferrugem", width: 3400, arenaStart: 3020,
      groundGaps: [[480, 600], [1040, 1160], [1800, 1920], [2350, 2460]],
      platforms: [
        { x: 300, y: 250, w: 90 }, { x: 620, y: 230, w: 100 }, { x: 780, y: 185, w: 80 },
        { x: 900, y: 255, w: 90 }, { x: 1180, y: 230, w: 110 }, { x: 1350, y: 180, w: 90 },
        { x: 1510, y: 250, w: 100 }, { x: 1660, y: 200, w: 80 },
        { x: 1980, y: 240, w: 110 }, { x: 2140, y: 190, w: 80 },
        { x: 2500, y: 255, w: 100 }, { x: 2660, y: 205, w: 90 },
        { x: 2820, y: 250, w: 100 }, { x: 2920, y: 185, w: 80 }
      ],
      spikes: [{ x: 850, y: 310, w: 64 }, { x: 1600, y: 310, w: 70 }, { x: 2260, y: 310, w: 60 }],
      checkpoints: [{ x: 1500 }, { x: 2760 }],
      memories: [{ x: 655, y: 200 }, { x: 2200, y: 160 }, { x: 2950, y: 155 }],
      heals: [{ x: 1230, y: 205 }, { x: 2700, y: 180 }],
      enemies: [
        { type: "walker", x: 350, range: 160 },
        { type: "spitter", x: 950, range: 90 },
        { type: "flyer", x: 1350, y: 215, range: 130 },
        { type: "walker", x: 1650, range: 180 },
        { type: "flyer", x: 2150, y: 210, range: 130 },
        { type: "walker", x: 2500, range: 180 },
        { type: "spitter", x: 2800, range: 90 }
      ],
      intro: [
        "Pedro: A Mina Enferrujada ainda respira. Escute: é um chiado fino, como metal lembrando de ser rio.",
        "Pedro: Ferrugem foi construída para não esquecer os mortos. Ela esqueceu foi como parar.",
        "Pedro: Não tenha pressa. O fundo da mina esperou séculos; pode esperar mais um pouco por você."
      ],
      outro: [
        "Pedro: O núcleo apagou. Você ouviu o silêncio? Não é vazio. É alívio.",
        "Pedro: A máquina sonhou com mãos. Acho que, no fim, ela só queria que alguém a segurasse.",
        "Pedro: Suba. A fogueira está perto, e a última fronteira já está no céu."
      ],
      camp: "A ferrugem mancha, mas não pega. Sente-se. O pior já passou — talvez."
    },
    {
      id: "fronteira", name: "Última Fronteira", numeral: "V",
      subtitle: "Onde a coroa pesa mais que o Reino",
      theme: "frontier", bossKey: "rei", width: 3500, arenaStart: 3100,
      groundGaps: [[620, 750], [1320, 1450], [2070, 2190], [2670, 2810]],
      platforms: [
        { x: 350, y: 250, w: 100 }, { x: 520, y: 200, w: 80 },
        { x: 790, y: 235, w: 100 }, { x: 960, y: 185, w: 80 }, { x: 1110, y: 250, w: 100 },
        { x: 1490, y: 230, w: 110 }, { x: 1660, y: 180, w: 90 }, { x: 1820, y: 245, w: 100 },
        { x: 2210, y: 240, w: 110 }, { x: 2380, y: 190, w: 80 }, { x: 2530, y: 250, w: 90 },
        { x: 2850, y: 240, w: 100 }, { x: 3020, y: 185, w: 80 }
      ],
      spikes: [{ x: 1040, y: 310, w: 70 }, { x: 1740, y: 310, w: 66 }, { x: 2470, y: 310, w: 64 }],
      checkpoints: [{ x: 1250 }, { x: 2950 }],
      memories: [{ x: 555, y: 168 }, { x: 1705, y: 150 }, { x: 3055, y: 155 }],
      heals: [{ x: 1000, y: 218 }, { x: 2425, y: 212 }],
      enemies: [
        { type: "walker", x: 400, range: 170 },
        { type: "flyer", x: 1000, y: 215, range: 140 },
        { type: "spitter", x: 1500, range: 95 },
        { type: "walker", x: 1800, range: 190 },
        { type: "flyer", x: 2250, y: 210, range: 140 },
        { type: "walker", x: 2600, range: 190 },
        { type: "spitter", x: 2900, range: 95 }
      ],
      intro: [
        "Pedro: Esta é a Última Fronteira, {hero}. Depois dela não há estrada — só a escolha.",
        "Pedro: O Rei das Cinzas não nasceu monstro. Ele foi ficando. Uma coroa, uma guerra, uma noite sem resposta.",
        "Pedro: Eu vou estar aqui, do lado de fora do trono. Não importa o que você decida, eu vou lembrar de você."
      ],
      outro: [
        "Pedro: Acabou. O Reino está esperando. E eu também.",
        "Pedro: Não existe escolha certa agora. Existe a escolha que você consegue carregar.",
        "Pedro: Eu conto essa história do jeito que você quiser. Mas primeiro... respire."
      ],
      camp: "A última fogueira. Depois desta noite, o Reino vai precisar de um nome novo."
    }
  ];

  const ENDINGS = {
    crown: {
      title: "O PESO DO OURO",
      text: [
        "Você pega a coroa. Ela é mais fria do que parecia nos contos.",
        "O Reino se ajoelha. As memórias que você libertou se acomodam atrás de você, como cortesãos.",
        "Pedro não se ajoelha. Ele apenas olha. É um olhar que você conhece de outras noites.",
        "No trono, você espera pelo próximo viajante. E, aos poucos, começa a esquecer por que o espera."
      ],
      tone: "dark"
    },
    break: {
      title: "A COROA PARTIDA",
      text: [
        "Você ergue a coroa e a parte contra o braço do trono.",
        "O ouro se abre como uma casca seca. As cinzas sobem, e o Reino Sem Nome finalmente pode ser apenas um lugar.",
        "Pedro ri. É um riso molhado, cansado, aliviado.",
        "Você parte antes do amanhecer. Não há coroa, não há nome, mas há uma estrada — e, pela primeira vez em séculos, ela é sua."
      ],
      tone: "warm"
    },
    true: {
      title: "O NOME VERDADEIRO",
      text: [
        "Você segura a coroa e pronuncia o nome que o Reino tentou queimar: ALDRIC.",
        "O Rei ergue o rosto. Por um instante, não é um trono, nem uma guerra, nem uma coroa. É só um homem que ficou tempo demais sozinho.",
        "— Eu só queria que alguém se lembrasse — ele diz. A voz não é de rei. É de quem pede.",
        "Pedro se aproxima e coloca a mão no ombro dele. Então os dois choram, e o Reino aprende que ser lembrado também é uma forma de terminar o inverno.",
        "Quando o sol nasce, não há Rei das Cinzas. Há Aldric. E há uma história, afinal, com todas as memórias no lugar."
      ],
      tone: "gold"
    }
  };

  TP.DATA = {
    RARITIES, CHARACTERS, WEAPON_CLASSES, WEAPONS, DIFFICULTIES,
    BOSSES, MEMORIES, LEVELS, ENDINGS
  };
})();
