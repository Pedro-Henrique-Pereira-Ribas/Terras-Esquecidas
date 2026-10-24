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
    mitica: { label: "Mítica", color: "#e06755", dark: "#4b1d18", glow: "#ffb6a1" },
    divina: { label: "Divina", color: "#f3df9b", dark: "#493715", glow: "#fff6cf" },
    celestial: { label: "Celestial", color: "#9bd8ff", dark: "#17384f", glow: "#dff4ff" },
    ancestral: { label: "Ancestral", color: "#cba47a", dark: "#3f2b1c", glow: "#f1d7b2" },
    suprema: { label: "Suprema", color: "#ff9b58", dark: "#4c2415", glow: "#ffd0a6" },
    eterna: { label: "Eterna", color: "#d7a8ff", dark: "#33204a", glow: "#f1d9ff" }
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

  /* Sete trajes por herói. O inicial é gratuito; os outros são comprados
     uma única vez com moedas dos chefes. Os trajes 2 a 6 dão bônus leves
     (2%, 2%, 2%, 3% e 4%). O sétimo é o traje final: 250 de vida máxima,
     sem outro bônus. As cores são aplicadas sobre a paleta base. */
  const OUTFITS = {
    viajante: [
      {
        id: "base", name: "Traje de Estrada", price: 0, colors: {}, bonus: null, fx: null,
        desc: "O casaco gasto de quem já dormiu em todas as encruzilhadas."
      },
      {
        id: "brasa", name: "Manto da Brasa", price: 500,
        colors: { hood: "#55251e", cloak: "#6b2f25", tunic: "#8d4a32", accent: "#ffb45e", metal: "#b98457", dark: "#2a1712", boot: "#3b241b" },
        bonus: { damage: 0.02 }, fx: { type: "embers", color: "#ff9b52", glow: "#ffd39a" },
        desc: "Tecido tingido no fogo de Pedro. A brasa esquenta o corte: +2% de dano."
      },
      {
        id: "lua", name: "Manto da Lua", price: 1000,
        colors: { hood: "#2b3652", cloak: "#33415f", tunic: "#4a5878", accent: "#a9c9e8", metal: "#c7d2dd", dark: "#1a2030", boot: "#293247" },
        bonus: { speed: 0.02 }, fx: { type: "moon", color: "#a9c9e8", glow: "#e6f3ff" },
        desc: "Um manto da cor das noites em que o Reino esquece de amanhecer. Passos mais leves: +2% de velocidade."
      },
      {
        id: "raiz", name: "Manto de Raiz", price: 1600,
        colors: { hood: "#30442a", cloak: "#3a4e30", tunic: "#576d40", accent: "#b9c96e", metal: "#89936d", dark: "#1d271a", boot: "#2e3b24" },
        bonus: { defense: 0.02 }, fx: { type: "leaves", color: "#a9d88e", glow: "#e0ffc0" },
        desc: "Fibras antigas costuradas com paciência. A terra segura o golpe: +2% de defesa."
      },
      {
        id: "vento", name: "Manto do Vento", price: 2000,
        colors: { hood: "#2c4a46", cloak: "#37605a", tunic: "#4f7a6e", accent: "#d9f2df", metal: "#a9c9b8", dark: "#182a27", boot: "#28413a" },
        bonus: { speed: 0.03 }, fx: { type: "wind", color: "#cfe7df", glow: "#f0fff8" },
        desc: "O tecido não pesa; a estrada é que parece correr para trás. +3% de velocidade."
      },
      {
        id: "tempestade", name: "Manto da Tempestade", price: 2600,
        colors: { hood: "#26364f", cloak: "#31496b", tunic: "#41618a", accent: "#9fc6ff", metal: "#b9cde0", dark: "#141d2d", boot: "#22334d" },
        bonus: { damage: 0.04 }, fx: { type: "storm", color: "#8fb8ff", glow: "#d9e8ff" },
        desc: "Cada trovão dentro do capuz é uma promessa de corte. +4% de dano."
      },
      {
        id: "horizonte", name: "Manto do Horizonte", price: 3200, final: true, maxHp: 250,
        colors: { hood: "#4a2f1d", cloak: "#6b4326", tunic: "#9a6433", accent: "#ffe0a0", metal: "#e0b45e", dark: "#2a1810", boot: "#4a2e1c" },
        bonus: null, fx: { type: "horizon", color: "#ffd27a", glow: "#fff1c2" },
        desc: "O último traje de quem já viu o fim da estrada. Não dá mais força: dá mais vida. 250 de vida máxima."
      }
    ],
    arqueira: [
      {
        id: "base", name: "Traje de Trilha", price: 0, colors: {}, bonus: null, fx: null,
        desc: "O manto leve de quem aprendeu a desaparecer entre as árvores."
      },
      {
        id: "musgo", name: "Musgo Antigo", price: 500,
        colors: { hood: "#3d5b3f", tunic: "#5b7b4a", accent: "#d8b76a", metal: "#9aaa8d", dark: "#1c2a1c", boot: "#33452d" },
        bonus: { defense: 0.02 }, fx: { type: "leaves", color: "#8fbf6a", glow: "#d8f0b0" },
        desc: "O verde que só existe onde a floresta ainda se lembra de ser jovem. +2% de defesa."
      },
      {
        id: "crepusculo", name: "Crepúsculo", price: 1000,
        colors: { hood: "#413354", tunic: "#5a4672", accent: "#c9a5e4", metal: "#9c8bb5", dark: "#221b2e", boot: "#372c47" },
        bonus: { speed: 0.02 }, fx: { type: "dusk", color: "#c9a5e4", glow: "#f0dcff" },
        desc: "A última luz da tarde presa nas dobras do capuz. +2% de velocidade."
      },
      {
        id: "neve", name: "Neve Silenciosa", price: 1600,
        colors: { hood: "#c8d7d3", tunic: "#a6bbb7", accent: "#e5c77c", metal: "#dbe6e3", dark: "#687c78", boot: "#7d918d" },
        bonus: { damage: 0.02 }, fx: { type: "snow", color: "#dff3ff", glow: "#ffffff" },
        desc: "O traje dos caçadores da serra. Branco o bastante para perdoar o inverno. +2% de dano."
      },
      {
        id: "orvalho", name: "Orvalho", price: 2000,
        colors: { hood: "#2f5a4f", tunic: "#4f7f6a", accent: "#a9ffe0", metal: "#b7d8c8", dark: "#18302a", boot: "#2a4a3f" },
        bonus: { defense: 0.03 }, fx: { type: "dew", color: "#8fe3c9", glow: "#d8fff2" },
        desc: "A primeira gota da manhã escorre pela flecha antes de partir. +3% de defesa."
      },
      {
        id: "aurora", name: "Aurora", price: 2600,
        colors: { hood: "#3b2d55", tunic: "#5a4a7a", accent: "#a9ffd0", metal: "#c9b9e8", dark: "#20162e", boot: "#35284a" },
        bonus: { speed: 0.04 }, fx: { type: "aurora", color: "#9fffd2", glow: "#d9ffe9" },
        desc: "Um céu inteiro costurado nas costas. A flecha chega antes do frio. +4% de velocidade."
      },
      {
        id: "coracao", name: "Coração da Floresta", price: 3200, final: true, maxHp: 250,
        colors: { hood: "#234a2a", tunic: "#3f6b3a", accent: "#c8ff9a", metal: "#b8d88f", dark: "#122414", boot: "#28402a" },
        bonus: null, fx: { type: "forestheart", color: "#b6ff8a", glow: "#e6ffd0" },
        desc: "O traje que a própria Trilha ofereceu. Não pede pontaria: pede fôlego. 250 de vida máxima."
      }
    ],
    guerreiro: [
      {
        id: "base", name: "Armadura do Muro", price: 0, colors: {}, bonus: null, fx: null,
        desc: "Metal amassado em mais noites do que qualquer canção consegue contar."
      },
      {
        id: "ferro", name: "Ferro Negro", price: 500,
        colors: { armor: "#383d44", metal: "#727c86", accent: "#b33f38", plume: "#c04b43", dark: "#1d2024", boot: "#2c3036" },
        bonus: { defense: 0.02 }, fx: { type: "sparks", color: "#b7c2cc", glow: "#e8f1f8" },
        desc: "A armadura dos que preferem ser difíceis de derrubar. +2% de defesa."
      },
      {
        id: "ouro", name: "Ouro do Rei", price: 1000,
        colors: { armor: "#6f5a2e", metal: "#d4b05a", accent: "#e5c06a", plume: "#e5c06a", dark: "#2e2718", boot: "#3b3020" },
        bonus: { damage: 0.02 }, fx: { type: "gold", color: "#ffd36e", glow: "#fff0b0" },
        desc: "Uma armadura que já serviu a um trono. Agora serve a uma promessa. +2% de dano."
      },
      {
        id: "sangue", name: "Sangue Antigo", price: 1600,
        colors: { armor: "#5a2a28", metal: "#a9675a", accent: "#e26a56", plume: "#e26a56", dark: "#2a1515", boot: "#3a2020" },
        bonus: { speed: 0.02 }, fx: { type: "embers", color: "#ff7b62", glow: "#ffc0a8" },
        desc: "Vermelho escuro como o ferro depois da batalha. Ainda não pede descanso. +2% de velocidade."
      },
      {
        id: "aco", name: "Aço Tempestuoso", price: 2000,
        colors: { armor: "#3b4a57", metal: "#8fa6b8", accent: "#9fd8ff", plume: "#b9e6ff", dark: "#1b242b", boot: "#2a3640" },
        bonus: { defense: 0.03 }, fx: { type: "steel", color: "#9fd8ff", glow: "#e0f4ff" },
        desc: "O metal foi temperado no vento da serra. +3% de defesa."
      },
      {
        id: "trovao", name: "Trovão", price: 2600,
        colors: { armor: "#303a5a", metal: "#8f9fd0", accent: "#c9d8ff", plume: "#e0e8ff", dark: "#171c2e", boot: "#252d47" },
        bonus: { damage: 0.04 }, fx: { type: "storm", color: "#b6c8ff", glow: "#eef3ff" },
        desc: "A armadura que responde antes do trovão. +4% de dano."
      },
      {
        id: "muralha", name: "Muralha do Amanhecer", price: 3200, final: true, maxHp: 250,
        colors: { armor: "#6b542e", metal: "#d8b56a", accent: "#ffe0a0", plume: "#ffcf7a", dark: "#2e2416", boot: "#4a3820" },
        bonus: null, fx: { type: "dawnwall", color: "#ffd28a", glow: "#fff0c8" },
        desc: "A última armadura não é para atacar. É para continuar de pé quando o sol nascer. 250 de vida máxima."
      }
    ],
    mago: [
      {
        id: "base", name: "Manto de Cinzas", price: 0, colors: {}, bonus: null, fx: null,
        desc: "O robe de quem passou a vida catalogando ruínas e perdendo o medo delas."
      },
      {
        id: "cinza", name: "Cinza Fria", price: 500,
        colors: { robe: "#3f474f", robe2: "#2d3339", accent: "#b9c4d0", dark: "#1d2226", staff: "#6b5b4c", boot: "#2a3035" },
        bonus: { defense: 0.02 }, fx: { type: "ash", color: "#c3ccd6", glow: "#eef3f8" },
        desc: "Um manto sóbrio, da cor do que sobra quando a magia termina. +2% de defesa."
      },
      {
        id: "estrela", name: "Estrela Partida", price: 1000,
        colors: { robe: "#2d3f63", robe2: "#202f4c", accent: "#8ec7ff", dark: "#141c2d", staff: "#6b4f3a", boot: "#22324d" },
        bonus: { speed: 0.02 }, fx: { type: "stars", color: "#9ecbff", glow: "#e0efff" },
        desc: "Os fios guardam uma luz azul que não ilumina nada além do caminho. +2% de velocidade."
      },
      {
        id: "abismo", name: "Abismo", price: 1600,
        colors: { robe: "#432c4c", robe2: "#2d1e36", accent: "#d58ae6", dark: "#1a1220", staff: "#4b3547", boot: "#30213a" },
        bonus: { damage: 0.02 }, fx: { type: "void", color: "#d58ae6", glow: "#f2d8ff" },
        desc: "Roupas que parecem feitas de uma pergunta. A resposta é melhor não vestir. +2% de dano."
      },
      {
        id: "neblina", name: "Neblina", price: 2000,
        colors: { robe: "#4a5f5e", robe2: "#354746", accent: "#c6e7e3", dark: "#1e2b2a", staff: "#6b5b4c", boot: "#2a3837" },
        bonus: { defense: 0.03 }, fx: { type: "mist", color: "#c6e7e3", glow: "#effffc" },
        desc: "O ar fica espesso antes do feitiço. O golpe chega mais devagar. +3% de defesa."
      },
      {
        id: "eclipse", name: "Eclipse", price: 2600,
        colors: { robe: "#2e2340", robe2: "#20182e", accent: "#d8b6ff", dark: "#120d1a", staff: "#4b3547", boot: "#241a30" },
        bonus: { damage: 0.04 }, fx: { type: "eclipse", color: "#d8b6ff", glow: "#f5e6ff" },
        desc: "Uma sombra passou pelo sol e não devolveu a luz. +4% de dano."
      },
      {
        id: "coroa", name: "Coroa de Cinzas", price: 3200, final: true, maxHp: 250,
        colors: { robe: "#4a3a28", robe2: "#33281c", accent: "#ffe0a0", dark: "#1e1710", staff: "#6b4f3a", boot: "#30241a" },
        bonus: null, fx: { type: "ashcrown", color: "#ffe0a0", glow: "#fff4d0" },
        desc: "O manto que o Reino tentou queimar. Ele ainda cabe em você. 250 de vida máxima."
      }
    ],
    minerador: [
      {
        id: "base", name: "Traje de Fundo", price: 0, colors: {}, bonus: null, fx: null,
        desc: "Lona, couro e poeira. O uniforme de quem voltou de onde o mapa termina."
      },
      {
        id: "cobre", name: "Cobre Velho", price: 500,
        colors: { armor: "#6b432d", helmet: "#b0703e", accent: "#e0a84e", metal: "#bd854e", dark: "#2a1a12", boot: "#42291b" },
        bonus: { defense: 0.02 }, fx: { type: "embers", color: "#e0a84e", glow: "#ffe0a0" },
        desc: "As placas de cobre que a mina deixou como lembrança. +2% de defesa."
      },
      {
        id: "cristal", name: "Cristal da Mina", price: 1000,
        colors: { armor: "#3b4a55", helmet: "#7fa2b0", accent: "#8fe3df", metal: "#9dbac4", dark: "#1c262d", boot: "#2a363f" },
        bonus: { speed: 0.02 }, fx: { type: "crystal", color: "#8fe3df", glow: "#d8fffb" },
        desc: "Pedra clara o bastante para devolver a luz que o fundo engoliu. +2% de velocidade."
      },
      {
        id: "obsidiana", name: "Obsidiana", price: 1600,
        colors: { armor: "#2c2435", helmet: "#4a3e5c", accent: "#b98add", metal: "#6f5a85", dark: "#18131f", boot: "#241d2d" },
        bonus: { damage: 0.02 }, fx: { type: "void", color: "#b98add", glow: "#e7ccff" },
        desc: "Vidro vulcânico polido pelo tempo. Corta a escuridão antes de cortar a pedra. +2% de dano."
      },
      {
        id: "veio", name: "Veio de Ouro", price: 2000,
        colors: { armor: "#6b542e", helmet: "#c9a44e", accent: "#ffe08a", metal: "#d8b56a", dark: "#2e2416", boot: "#4a3820" },
        bonus: { defense: 0.03 }, fx: { type: "gold", color: "#ffd36e", glow: "#fff0b0" },
        desc: "O ouro que a mina escondeu do Rei. A rocha agora protege você. +3% de defesa."
      },
      {
        id: "magma", name: "Magma", price: 2600,
        colors: { armor: "#4a2420", helmet: "#8a3a2a", accent: "#ff8a4e", metal: "#c96a45", dark: "#24100e", boot: "#3a1a16" },
        bonus: { damage: 0.04 }, fx: { type: "magma", color: "#ff8a4e", glow: "#ffd0a0" },
        desc: "A pedra ainda não esfriou. A picareta também não. +4% de dano."
      },
      {
        id: "coracao", name: "Coração da Montanha", price: 3200, final: true, maxHp: 250,
        colors: { armor: "#3a3a42", helmet: "#8a8a98", accent: "#ffcf7a", metal: "#c9c9d8", dark: "#1c1c22", boot: "#2e2e38" },
        bonus: null, fx: { type: "mountainheart", color: "#ffcf7a", glow: "#fff0c8" },
        desc: "A montanha inteira bate dentro do peito. O fundo não assusta mais. 250 de vida máxima."
      }
    ]
  };

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
     A progressão vem dos chefes, não de moedas. */
  const WEAPONS = {
    sword: [
      {
        name: "Espada Longa", rarity: "rara", tier: 0, dmg: 14, speed: "Média",
        cooldown: 24, weight: 5, effect: "none",
        desc: "A lâmina comprida dos que ainda acreditam em distância curta."
      },
      {
        name: "Espada Larga", rarity: "epica", tier: 1, dmg: 22, speed: "Lenta",
        cooldown: 34, weight: 8, effect: "none",
        desc: "Pesada como uma decisão tomada tarde. Deixa marcas no chão."
      },
      {
        name: "Espada Flamejante", rarity: "lendaria", tier: 2, dmg: 26, speed: "Média",
        cooldown: 24, weight: 6, effect: "burn",
        desc: "A lâmina guarda uma fogueira que nunca pediu licença para arder."
      },
      {
        name: "Espada Sombria", rarity: "mitica", tier: 3, dmg: 24, speed: "Média",
        cooldown: 24, weight: 6, effect: "lifesteal",
        desc: "Corta lembranças. Devolve um pouco da vida que elas levam."
      },
      {
        name: "Espada da Eternidade", rarity: "divina", tier: 4, dmg: 48, speed: "Muito Rápida",
        cooldown: 17, weight: 5, effect: "burn", bonus: 25, bonusLabel: "Precisão",
        desc: "A lâmina lembra de todas as mãos que a ergueram. Nenhuma delas soltou."
      },
      {
        name: "Espada Celestial", rarity: "celestial", tier: 5, dmg: 42, speed: "Rápida",
        cooldown: 19, weight: 5, effect: "spirit", bonus: 20, bonusLabel: "Precisão",
        desc: "Cada corte deixa uma luz fina no ar, como uma promessa que não sabe cair."
      },
      {
        name: "Espada Ancestral", rarity: "ancestral", tier: 6, dmg: 38, speed: "Média",
        cooldown: 22, weight: 6, effect: "burn", bonus: 18, bonusLabel: "Precisão",
        desc: "O punho é de pedra. A vontade que a move é mais antiga que o Reino."
      },
      {
        name: "Espada Suprema", rarity: "suprema", tier: 7, dmg: 56, speed: "Muito Rápida",
        cooldown: 16, weight: 5, effect: "lifesteal", bonus: 30, bonusLabel: "Precisão",
        desc: "Não pede licença ao vazio. Corta primeiro, ouve o silêncio depois."
      },
      {
        name: "Espada Eterna", rarity: "eterna", tier: 8, dmg: 62, speed: "Rápida",
        cooldown: 19, weight: 6, effect: "eternal", bonus: 35, bonusLabel: "Precisão",
        desc: "A última lâmina do Ato II. Queima e devolve vida: o fim que insiste em continuar."
      }
    ],
    bow: [
      {
        name: "Arco de Caça", rarity: "rara", tier: 0, dmg: 16, speed: "Rápida",
        cooldown: 20, weight: 3, effect: "none",
        desc: "Madeira flexível, corda de tendão. Não erra o que já decidiu acertar."
      },
      {
        name: "Arco Composto", rarity: "epica", tier: 1, dmg: 22, speed: "Rápida",
        cooldown: 20, weight: 4, effect: "none",
        desc: "Cada curva conta uma história de tensão. A flecha discorda em silêncio."
      },
      {
        name: "Arco Flamejante", rarity: "lendaria", tier: 2, dmg: 28, speed: "Média",
        cooldown: 24, weight: 4, effect: "burn",
        desc: "A flecha risca o ar como uma brasa que se recusa a apagar."
      },
      {
        name: "Arco Sombrio", rarity: "mitica", tier: 3, dmg: 26, speed: "Média",
        cooldown: 24, weight: 5, effect: "lifesteal",
        desc: "Onde a flecha toca, a sombra bebe. A arqueira aprendeu a não olhar."
      },
      {
        name: "Arco da Floresta Eterna", rarity: "divina", tier: 4, dmg: 36, speed: "Muito Rápida",
        cooldown: 17, weight: 4, effect: "burn", bonus: 20, bonusLabel: "Precisão",
        desc: "A madeira ainda está viva. Cada flecha nasce de um galho que se ofereceu."
      },
      {
        name: "Arco das Sombras", rarity: "celestial", tier: 5, dmg: 34, speed: "Rápida",
        cooldown: 19, weight: 5, effect: "lifesteal", bonus: 18, bonusLabel: "Precisão",
        desc: "A sombra puxa a corda junto com você. O alvo nunca vê de onde veio."
      },
      {
        name: "Arco Solar", rarity: "ancestral", tier: 6, dmg: 38, speed: "Muito Rápida",
        cooldown: 17, weight: 4, effect: "spirit", bonus: 22, bonusLabel: "Precisão",
        desc: "Dispara a última luz da tarde. Onde acerta, deixa um dia inteiro para trás."
      },
      {
        name: "Arco do Caos", rarity: "suprema", tier: 7, dmg: 42, speed: "Muito Rápida",
        cooldown: 16, weight: 5, effect: "burn", bonus: 25, bonusLabel: "Precisão",
        desc: "A corda range como o Reino se partindo. A flecha escolhe um caos e o segue."
      },
      {
        name: "Arco da Lua Sangrenta", rarity: "eterna", tier: 8, dmg: 40, speed: "Rápida",
        cooldown: 19, weight: 4, effect: "eternal", bonus: 24, bonusLabel: "Precisão",
        desc: "Atira sob uma lua que nunca nasce. A ferida que abre também alimenta quem atirou."
      }
    ],
    pickaxe: [
      {
        name: "Picareta de Ferro", rarity: "rara", tier: 0, dmg: 18, speed: "Lenta",
        cooldown: 32, weight: 8, effect: "none",
        desc: "Ferro gasto, cabo de madeira dura. Abriu túneis e sepulturas com a mesma paciência."
      },
      {
        name: "Picareta Ancestral", rarity: "epica", tier: 1, dmg: 24, speed: "Média",
        cooldown: 28, weight: 7, effect: "spirit",
        desc: "Os espíritos da mina ainda seguram o cabo junto com você."
      },
      {
        name: "Picareta de Obsidiana", rarity: "lendaria", tier: 2, dmg: 30, speed: "Lenta",
        cooldown: 34, weight: 9, effect: "burn",
        desc: "Pedra que nasceu do fogo. Cada picada devolve o calor com juros."
      },
      {
        name: "Picareta do Abismo", rarity: "mitica", tier: 3, dmg: 28, speed: "Média",
        cooldown: 30, weight: 8, effect: "lifesteal",
        desc: "Foi encontrada onde a mina deixa de ter fundo. Ainda está descendo."
      },
      {
        name: "Picareta da Eternidade", rarity: "divina", tier: 4, dmg: 46, speed: "Muito Rápida",
        cooldown: 18, weight: 5, effect: "spirit", bonus: 20, bonusLabel: "Precisão",
        desc: "Cava devagar, mas cada golpe encontra uma camada que o tempo esqueceu."
      },
      {
        name: "Picareta Celestial", rarity: "celestial", tier: 5, dmg: 40, speed: "Rápida",
        cooldown: 21, weight: 5, effect: "burn", bonus: 22, bonusLabel: "Precisão",
        desc: "A ponta brilha como um pedaço de céu. A pedra se abre para não ser tocada."
      },
      {
        name: "Picareta Ancestral", rarity: "ancestral", tier: 6, dmg: 36, speed: "Média",
        cooldown: 24, weight: 6, effect: "lifesteal", bonus: 24, bonusLabel: "Precisão",
        desc: "O cabo tem marcas de mãos que viveram antes das minas. Elas ainda puxam junto."
      },
      {
        name: "Picareta Suprema", rarity: "suprema", tier: 7, dmg: 52, speed: "Rápida",
        cooldown: 20, weight: 5, effect: "spirit", bonus: 28, bonusLabel: "Precisão",
        desc: "Não quebra a pedra: convence a pedra de que já era pó."
      },
      {
        name: "Picareta Eterna", rarity: "eterna", tier: 8, dmg: 58, speed: "Muito Rápida",
        cooldown: 18, weight: 6, effect: "eternal", bonus: 32, bonusLabel: "Precisão",
        desc: "O último golpe do Ato II. Abre a terra e devolve a vida que ela guardou."
      }
    ],
    staff: [
      {
        name: "Cajado de Cristal", rarity: "rara", tier: 0, dmg: 15, speed: "Média",
        cooldown: 23, weight: 3, effect: "none",
        desc: "Um cristal pequeno, uma luz teimosa. O bastante para começar."
      },
      {
        name: "Cajado Arcano", rarity: "epica", tier: 1, dmg: 21, speed: "Média",
        cooldown: 23, weight: 4, effect: "none",
        desc: "Runas antigas giram devagar ao redor da ponta, como peixes cegos."
      },
      {
        name: "Cajado Flamejante", rarity: "lendaria", tier: 2, dmg: 27, speed: "Média",
        cooldown: 25, weight: 5, effect: "burn",
        desc: "O fogo não obedece. Ele apenas reconhece o mago como velho conhecido."
      },
      {
        name: "Cajado Sombrio", rarity: "mitica", tier: 3, dmg: 25, speed: "Média",
        cooldown: 25, weight: 5, effect: "lifesteal",
        desc: "A escuridão não é vazia. Ela tem dentes, e aprendeu a morder por você."
      },
      {
        name: "Cajado do Vórtice", rarity: "divina", tier: 4, dmg: 34, speed: "Muito Rápida",
        cooldown: 18, weight: 5, effect: "burn", bonus: 25, bonusLabel: "Inteligência",
        desc: "Gira o ar até ele esquecer para onde ia. O que sobra vira fogo."
      },
      {
        name: "Cajado dos Elementos", rarity: "celestial", tier: 5, dmg: 28, speed: "Média",
        cooldown: 23, weight: 6, effect: "spirit", bonus: 20, bonusLabel: "Inteligência",
        desc: "Pedra, vento e água discutem dentro do cristal. Você só precisa escolher o lado."
      },
      {
        name: "Cajado do Arcano", rarity: "ancestral", tier: 6, dmg: 32, speed: "Lenta",
        cooldown: 29, weight: 7, effect: "burn", bonus: 30, bonusLabel: "Inteligência",
        desc: "As runas são mais velhas que a linguagem. Elas não pedem permissão para queimar."
      },
      {
        name: "Cajado do Abismo", rarity: "suprema", tier: 7, dmg: 36, speed: "Média",
        cooldown: 23, weight: 6, effect: "lifesteal", bonus: 35, bonusLabel: "Inteligência",
        desc: "O fundo do mundo cabe na palma da mão. Ele bebe primeiro e pergunta depois."
      },
      {
        name: "Cajado da Névoa Lunar", rarity: "eterna", tier: 8, dmg: 30, speed: "Média",
        cooldown: 25, weight: 5, effect: "eternal", bonus: 28, bonusLabel: "Inteligência",
        desc: "A névoa cobre o campo e a vida escorre de volta para quem a conjurou."
      }
    ]
  };

  /* As armas não são compradas: os chefes de progressão entregam
     automaticamente o próximo degrau da classe equipada. Todos os
     chefes também rendem moedas para o vestiário. */

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
      coin: 500, dropTier: 1, theme: "ruins",
      taunt: "PEDRA. RAIZ. SILÊNCIO. VOCÊ NÃO PASSA.",
      taunt2: "A RUÍNA TAMBÉM SABE SE LEVANTAR.",
      deathLine: "O Colosso se desfaz. Sob as pedras, um desenho de criança espera há séculos.",
      colors: { stone: "#7d806d", dark: "#4d5044", moss: "#738b55", eye: "#7de7d8", crack: "#2f322b" }
    },
    vulto: {
      name: "Vulto", title: "O Que Sussurra Entre as Árvores", hp: 300, w: 64, h: 94,
      contact: 16, speed: 0.92, flying: true, hover: 258, attacks: ["volley", "teleport", "summon"],
      coin: 500, dropTier: 2, theme: "forest",
      taunt: "VOCÊ OUVE A FLORESTA? ELA NÃO PEDE SOCORRO. ELA CHORA.",
      taunt2: "AS RAÍZES SABEM O SEU NOME. EU TAMBÉM.",
      deathLine: "O Vulto se desfaz em folhas secas. Uma canção de ninar escapa das raízes.",
      colors: { cloak: "#23372f", cloak2: "#15221d", bone: "#cfc4a3", eye: "#9be8a8", glow: "#78c7a0" }
    },
    corvo: {
      name: "Corvo Cinzento", title: "A Asa Que Cobre o Vale", hp: 350, w: 116, h: 68,
      contact: 16, speed: 1.05, flying: true, hover: 198, attacks: ["dive", "feathers", "gust"],
      coin: 500, dropTier: 3, theme: "mountain",
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
    },
    titao: {
      name: "Titã Mecânico", title: "O Coração da Forja", hp: 450, w: 110, h: 88,
      contact: 22, speed: 0.8, flying: false, attacks: ["slam", "charge", "volley", "pillars"],
      coin: 750, dropTier: 4, theme: "forge", attackColor: "#ffb066",
      taunt: "A FORJA NÃO ESQUENTOU PARA VOCÊ. ELA ESQUENTOU PARA O QUE VAI SER FEITO DE VOCÊ.",
      taunt2: "O CORAÇÃO AINDA BATE. ISSO É O PIOR.",
      deathLine: "O Titã para. As engrenagens continuam girando por um instante, sem lembrar por quê.",
      colors: { metal: "#6f6258", dark: "#332c28", rust: "#a65d3f", core: "#ff9b4e", glow: "#ffd18a", eye: "#ff6b45" }
    },
    guardiao: {
      name: "Guardião Ancestral", title: "A Pedra Que Lembra", hp: 550, w: 96, h: 100,
      contact: 24, speed: 0.88, flying: false, attacks: ["slashwave", "pillars", "summon", "slam"],
      coin: 900, dropTier: 5, theme: "temple", attackColor: "#d8c58a",
      taunt: "ESTE TEMPLO NÃO GUARDA OURO. GUARDA O QUE VOCÊ AINDA VAI PERDER.",
      taunt2: "A PEDRA LEMBRA. VOCÊ NÃO.",
      deathLine: "O Guardião se ajoelha. Pela primeira vez, a pedra parece descansar.",
      colors: { stone: "#8d846c", dark: "#453f35", moss: "#7d8a5b", gold: "#d8bd72", eye: "#8fe6cb" }
    },
    farao: {
      name: "Faraó Maldito", title: "O Rei de Vidro e Areia", hp: 650, w: 88, h: 96,
      contact: 26, speed: 0.94, flying: false, attacks: ["rain", "acid", "dash", "pillars"],
      coin: 1050, dropTier: 6, theme: "desert", attackColor: "#e8c36a",
      taunt: "A AREIA TOMA TUDO. ATÉ O NOME QUE VOCÊ ACHA QUE É SEU.",
      taunt2: "O SOL JÁ MORREU. POR QUE VOCÊ NÃO?",
      deathLine: "O Faraó se desfaz em vidro moído. O deserto respira como quem dormiu demais.",
      colors: { bandage: "#c9b184", bandage2: "#8f7651", gold: "#e0b45e", glass: "#7fd8cf", eye: "#ffcf5e", dark: "#3b3024" }
    },
    imperador: {
      name: "Imperador do Vazio", title: "Aquele Que Não Tem Nome", hp: 750, w: 100, h: 94,
      contact: 30, speed: 1, flying: true, hover: 252, attacks: ["teleport", "volley", "dash", "rain"],
      coin: 1200, dropTier: 7, theme: "void", attackColor: "#b48cff",
      taunt: "OLHE PARA O TRONO. ELE ESTÁ VAZIO PORQUE VOCÊ NUNCA ESTEVE LÁ.",
      taunt2: "O VAZIO NÃO É UM LUGAR. É UMA DECISÃO.",
      deathLine: "O Imperador se apaga como uma vela. O vazio fica, mas perde a voz.",
      colors: { cloak: "#241a3d", cloak2: "#120f21", void: "#55368a", glow: "#b48cff", eye: "#e6d6ff", gold: "#8d6bc7" }
    },
    arcanjo: {
      name: "Arcanjo Caído", title: "A Última Asa do Céu", hp: 900, w: 104, h: 98,
      contact: 34, speed: 1.08, flying: true, hover: 238, attacks: ["feathers", "dive", "pillars", "volley"],
      coin: 2000, dropTier: 8, theme: "celestial", act2Final: true, attackColor: "#fff0b0",
      taunt: "O CÉU NÃO FOI FEITO PARA OS QUE SOBEM. FOI FEITO PARA OS QUE NÃO TÊM PARA ONDE VOLTAR.",
      taunt2: "AINDA HÁ UMA ASA. ELA BASTA PARA O SEU FIM.",
      deathLine: "O Arcanjo cai sem pressa. A última pena dourada escolhe o chão, não o céu.",
      colors: { wing: "#e7dfc4", wing2: "#b9ae91", robe: "#7c6a8f", gold: "#f0cf7c", halo: "#fff0b0", eye: "#fff6d8", dark: "#3a3442" }
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
    { id: "f3", name: "O Nome Verdadeiro", text: "Atrás do título, existe um homem. Atrás do homem, existe um nome que o Reino tentou queimar." },
    { id: "a1", name: "A Engrenagem Mãe", text: "A primeira peça da forja ainda gira no escuro. Ela não move mais nada, mas se recusa a parar." },
    { id: "a2", name: "O Turno Que Não Acabou", text: "Os operários saíram para o jantar e nunca voltaram. As máquinas continuaram trabalhando por eles, por hábito." },
    { id: "a3", name: "A Manopla Vazia", text: "Uma manopla de couro descansa sobre a bigorna. Dentro dela, cinco dedos de ar ainda seguram o martelo." },
    { id: "a4", name: "A Prece de Pedra", text: "O templo não tem deuses. Tem paredes que aprenderam a repetir as palavras dos que rezaram antes de partir." },
    { id: "a5", name: "O Guardião Sem Nome", text: "Ele foi esculpido para proteger um nome que ninguém mais lembra. Por isso não pode descansar." },
    { id: "a6", name: "A Oferenda de Barro", text: "Alguém deixou uma tigela vazia no altar. O barro rachou esperando um alimento que nunca veio." },
    { id: "a7", name: "O Sol Engolido", text: "O Faraó mandou selar o sol dentro da tumba. O deserto ficou escuro por três gerações, e ninguém reclamou." },
    { id: "a8", name: "A Fome do Faraó", text: "Ele não queria ouro. Queria que o tempo parasse quando ele dissesse. O tempo não obedeceu." },
    { id: "a9", name: "A Última Vassoura", text: "Uma serva varreu o mesmo corredor por quarenta anos. A areia sempre voltava. Ela também." },
    { id: "a10", name: "O Chão Que Falta", text: "No vazio, não há chão. Há apenas a memória de um passo que você ainda não deu." },
    { id: "a11", name: "A Voz Que Volta", text: "Tudo o que você grita aqui retorna com a sua voz, mas um pouco mais velho e sem perdão." },
    { id: "a12", name: "O Trono Sem Nome", text: "O Imperador se sentou no trono para ser lembrado. O trono esqueceu o corpo, mas manteve o formato." },
    { id: "a13", name: "A Asa Cortada", text: "O Arcanjo caiu porque olhou para baixo. A asa ficou no céu, ainda batendo, procurando o resto dele." },
    { id: "a14", name: "O Céu Sem Dono", text: "Depois que o último anjo caiu, o céu ficou livre. Ninguém quis. Ninguém sabia como possuir uma coisa tão grande." },
    { id: "a15", name: "A Memória Eterna", text: "Todas as trinta memórias se encontram aqui. O Reino não termina. Ele apenas aprende a continuar sem esquecer." }
  ];

  /* ============================================================
     TAREFAS DE FASE
     Cada fase tem um NPC único e um alvo único. Falar com o NPC
     aceita a tarefa; derrotar o alvo entrega as moedas. As tarefas
     voltam a cada Nova Jornada.
     ============================================================ */
  const QUESTS = [
    {
      id: "eco", levelId: "ruinas", reward: 200,
      npc: {
        name: "Iara", role: "Catadora de Ecos", x: 800, kind: "scholar",
        palette: { skin: "#a66b4b", hair: "#2b1b17", cloth: "#5c4a3a", accent: "#7de7d8", dark: "#241a16" }
      },
      target: {
        name: "Eco do Colosso", type: "walker", x: 1250, range: 120,
        hpMul: 2.35, dmgMul: 1.1,
        palette: { body: "#6f7a68", body2: "#8a947c", dark: "#3a4035", eye: "#7de7d8", glow: "#7de7d8", accent: "#a9b89a" }
      },
      lines: {
        intro: [
          "Você não é o primeiro a passar por aqui. O Colosso deixou um eco para trás — uma pedra que aprendeu a andar e a contar moedas.",
          "Se você derrotar o Eco do Colosso, eu tomo conta do que ele carrega. Duascentas moedas para você, e uma memória a menos para a ruína."
        ],
        active: "O Eco ainda anda entre as pedras. Ele não é o Colosso, mas também não é só uma sombra.",
        done: "Você o derrotou. As moedas já estão com você. A ruína ficou um pouco mais silenciosa."
      }
    },
    {
      id: "lobo", levelId: "trilha", reward: 200,
      npc: {
        name: "Bento", role: "Vigia das Raízes", x: 980, kind: "hunter",
        palette: { skin: "#8b5a3c", hair: "#3a2a1c", cloth: "#3f5a3a", accent: "#a9d88e", dark: "#1e2a1a" }
      },
      target: {
        name: "Lobo de Musgo", type: "walker", x: 1600, range: 150,
        hpMul: 2.45, dmgMul: 1.15,
        palette: { body: "#5e7d4d", body2: "#78935c", dark: "#2c3d27", eye: "#c9e982", glow: "#a9d88e", accent: "#8fb16a" }
      },
      lines: {
        intro: [
          "A floresta não odeia você. Ela só não sabe mais distinguir fome de saudade. O Lobo de Musgo é o que sobrou dessa confusão.",
          "Ele guarda moedas de viajantes que não voltaram. Derrote-o e eu levo as moedas para a fogueira. Duascentas para você."
        ],
        active: "O Lobo ainda fareja a trilha. Não deixe que ele fareje você primeiro.",
        done: "O musgo parou de se mexer. A floresta respirou. As moedas são suas."
      }
    },
    {
      id: "pena", levelId: "serra", reward: 250,
      npc: {
        name: "Sora", role: "Alpinista Cega", x: 1180, kind: "climber",
        palette: { skin: "#c08a63", hair: "#d8d0c0", cloth: "#4a5a70", accent: "#a9c7ee", dark: "#232b38" }
      },
      target: {
        name: "Pena Negra", type: "flyer", x: 1700, y: 220, range: 150,
        hpMul: 2.3, dmgMul: 1.15,
        palette: { body: "#303b54", body2: "#45536f", dark: "#1d2438", eye: "#ff5d54", glow: "#a9c7ee", accent: "#b8a56e" }
      },
      lines: {
        intro: [
          "Eu não vejo o vale, mas ouço o que cai nele. Uma Pena Negra está roubando o vento dos viajantes.",
          "Ela carrega duzentas e cinquenta moedas no bico. Se você a derrubar, eu as conto para você."
        ],
        active: "A Pena ainda corta o céu. Escute o bater de asas antes de saltar.",
        done: "O céu ficou mais leve. As moedas estão com você, e o vale pode dormir."
      }
    },
    {
      id: "sombra", levelId: "mina", reward: 250,
      npc: {
        name: "Tino", role: "Aprendiz de Fundo", x: 1250, kind: "miner",
        palette: { skin: "#9a6a4a", hair: "#2a1a12", cloth: "#6b4a32", accent: "#ffb066", dark: "#2a1a12" }
      },
      target: {
        name: "Sombra de Ferrugem", type: "spitter", x: 1720, range: 100,
        hpMul: 2.5, dmgMul: 1.1,
        palette: { body: "#8c583e", body2: "#aa6f4b", dark: "#432b22", eye: "#ffb05a", glow: "#ff8b45", accent: "#c99463" }
      },
      lines: {
        intro: [
          "Ferrugem teve filhos de ferrugem. Um deles ainda anda no fundo, cuspindo ácido e guardando moedas que não são dele.",
          "Duzentas e cinquenta moedas se você apagar a Sombra de Ferrugem. Eu não vou descer lá para conferir."
        ],
        active: "A Sombra ainda está no fundo. Se o chão brilhar, saia do caminho.",
        done: "O fundo ficou quieto. Você trouxe as moedas e eu trouxe a coragem de volta."
      }
    },
    {
      id: "cinza", levelId: "fronteira", reward: 300,
      npc: {
        name: "Clara", role: "Última Sentinela", x: 1280, kind: "sentinel",
        palette: { skin: "#7a4a3a", hair: "#1b1310", cloth: "#5a2a2a", accent: "#ff8a5c", dark: "#241012" }
      },
      target: {
        name: "Cinza do Rei", type: "walker", x: 1850, range: 170,
        hpMul: 2.65, dmgMul: 1.2,
        palette: { body: "#6a4540", body2: "#85564c", dark: "#2c1b1c", eye: "#ff825f", glow: "#ff6e4a", accent: "#9b5e4b" }
      },
      lines: {
        intro: [
          "O Rei deixou um pedaço de si na estrada. Uma cinza que ainda acredita ser coroa. Ela não pode chegar ao trono.",
          "Trezentas moedas para quem apagar a Cinza do Rei. É o último pagamento que esta sentinela pode fazer."
        ],
        active: "A Cinza ainda queima. Não deixe que ela veja o trono.",
        done: "A estrada está limpa. As moedas são suas, e a última sentinela pode descansar."
      }
    },
    {
      id: "forja", levelId: "forja", reward: 300,
      npc: {
        name: "Lira", role: "Engenheira de Cinzas", x: 960, kind: "miner",
        palette: { skin: "#b97a55", hair: "#3a2118", cloth: "#58443a", accent: "#ffb066", dark: "#251914" }
      },
      target: {
        name: "Sentinela de Escória", type: "walker", x: 2280, range: 150,
        hpMul: 2.8, dmgMul: 1.2,
        palette: { body: "#7a5a45", body2: "#9a7458", dark: "#3a2a22", eye: "#ffb066", glow: "#ff8a4e", accent: "#b7825b" }
      },
      lines: {
        intro: [
          "O Titã não é a forja. É o que a forja se tornou depois de passar séculos sem ninguém para aquecer.",
          "Uma Sentinela de Escória ainda patrulha o corredor oeste. Se você a parar, eu pago trezentas moedas e volto a acreditar que este lugar pode ser desligado."
        ],
        active: "A Sentinela ainda anda. Ouça as engrenagens antes de chegar perto.",
        done: "O corredor ficou quieto. As moedas são suas, e a forja pode esfriar em paz."
      }
    },
    {
      id: "pedra", levelId: "templo", reward: 350,
      npc: {
        name: "Tovan", role: "Ancião do Templo", x: 1040, kind: "scholar",
        palette: { skin: "#a9825e", hair: "#d8d0c0", cloth: "#6b6148", accent: "#d8c58a", dark: "#2b271e" }
      },
      target: {
        name: "Guardião de Pedra", type: "walker", x: 2460, range: 170,
        hpMul: 2.9, dmgMul: 1.2,
        palette: { body: "#8d846c", body2: "#a49a7d", dark: "#453f35", eye: "#8fe6cb", glow: "#8fe6cb", accent: "#d8bd72" }
      },
      lines: {
        intro: [
          "O Guardião Ancestral protege a porta há mais tempo do que o templo existe. Nós construímos o templo ao redor dele.",
          "Um Guardião de Pedra menor ainda bloqueia a nave leste. Duzentas e cinquenta... não, trezentas e cinquenta moedas. O templo não precisa de ouro, mas você precisa de um motivo."
        ],
        active: "A pedra ainda está de pé. Ela não sente dor, mas sente a sua pressa.",
        done: "A nave está aberta. As moedas são suas. O templo lembrará de você por mais tempo do que gostaria."
      }
    },
    {
      id: "areia", levelId: "tumba", reward: 400,
      npc: {
        name: "Nefra", role: "Ladra de Túmulos", x: 900, kind: "hunter",
        palette: { skin: "#8b5a3c", hair: "#1b1310", cloth: "#8a6a3f", accent: "#e8c36a", dark: "#2b2116" }
      },
      target: {
        name: "Múmia de Vidro", type: "spitter", x: 2520, range: 100,
        hpMul: 2.9, dmgMul: 1.2,
        palette: { body: "#c9b184", body2: "#8f7651", dark: "#3b3024", eye: "#ffcf5e", glow: "#7fd8cf", accent: "#e0b45e" }
      },
      lines: {
        intro: [
          "Eu não vim roubar o Faraó. Vim roubar o que ele roubou primeiro. A diferença é importante para o meu sono.",
          "Uma Múmia de Vidro guarda a câmara central. Quatrocentas moedas se você a quebrar. O vidro não grita, mas a areia lembra."
        ],
        active: "A Múmia ainda está lá. O vidro reflete o que você não quer ver.",
        done: "O vidro virou pó. As moedas são suas. Eu vou sair antes que o deserto mude de ideia."
      }
    },
    {
      id: "vazio", levelId: "fenda", reward: 450,
      npc: {
        name: "Eco de Aldric", role: "Voz sem Corpo", x: 1000, kind: "sentinel",
        palette: { skin: "#6f5a7d", hair: "#241a3d", cloth: "#3a2a55", accent: "#b48cff", dark: "#120f21" }
      },
      target: {
        name: "Devorador do Vazio", type: "flyer", x: 2580, y: 220, range: 160,
        hpMul: 3, dmgMul: 1.25,
        palette: { body: "#35254f", body2: "#55368a", dark: "#120f21", eye: "#e6d6ff", glow: "#b48cff", accent: "#8d6bc7" }
      },
      lines: {
        intro: [
          "Você ouve a minha voz? Então ainda existe alguém para ouvir. O Imperador não gostou disso.",
          "Um Devorador do Vazio está entre nós e o trono. Ele come nomes. Quatrocentas e cinquenta moedas se você chegar antes que ele coma o seu."
        ],
        active: "O Devorador ainda está faminto. Não diga o seu nome em voz alta.",
        done: "A voz ficou mais fraca. Ou mais livre. As moedas são suas, e o vazio aprendeu a engolir sem mastigar."
      }
    },
    {
      id: "asa", levelId: "ceu", reward: 500,
      npc: {
        name: "Seraphina", role: "Anja Exilada", x: 1120, kind: "sentinel",
        palette: { skin: "#e0c7a8", hair: "#f0e6d0", cloth: "#7c6a8f", accent: "#fff0b0", dark: "#3a3442" }
      },
      target: {
        name: "Arauto do Arcanjo", type: "flyer", x: 2700, y: 210, range: 170,
        hpMul: 3.1, dmgMul: 1.25,
        palette: { body: "#d8cfb6", body2: "#f0e6d0", dark: "#7c6a8f", eye: "#fff0b0", glow: "#fff0b0", accent: "#f0cf7c" }
      },
      lines: {
        intro: [
          "Eu servi ao Arcanjo antes de ele decidir que o céu era pequeno demais para nós dois.",
          "Um Arauto ainda carrega a ordem dele: impedir que qualquer um chegue à última porta. Quinhentas moedas para calar o mensageiro. A mensagem já está velha."
        ],
        active: "O Arauto ainda anuncia a queda. Ele não sabe que já caiu.",
        done: "O céu ficou em silêncio. As moedas são suas. Agora só resta a última asa."
      }
    }
  ];

  /* ============================================================
     FASES
     Coordenadas em um mundo de 640x360, chão em y=320.
     ============================================================ */
  const LEVELS = [
    {
      id: "ruinas", name: "Ruínas Antigas", numeral: "I",
      subtitle: "Onde a pedra aprendeu a ficar em silêncio",
      theme: "ruins", bossKey: "colosso", quest: "eco", width: 2940, arenaStart: 2580,
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
      theme: "forest", bossKey: "vulto", quest: "lobo", width: 3140, arenaStart: 2780,
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
      theme: "mountain", bossKey: "corvo", quest: "pena", width: 3300, arenaStart: 2940,
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
      theme: "mine", bossKey: "ferrugem", quest: "sombra", width: 3400, arenaStart: 3020,
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
      theme: "frontier", bossKey: "rei", quest: "cinza", width: 3500, arenaStart: 3100,
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
    },
    {
      id: "forja", name: "Forja Profunda", numeral: "VI", act: 2,
      subtitle: "Onde o ferro sonha com o dia em que parou",
      theme: "forge", bossKey: "titao", quest: "forja", width: 3600, arenaStart: 3220,
      groundGaps: [[620, 740], [1340, 1460], [2050, 2160], [2680, 2780]],
      platforms: [
        { x: 360, y: 250, w: 100 }, { x: 500, y: 195, w: 80 },
        { x: 820, y: 255, w: 110 }, { x: 980, y: 205, w: 90 }, { x: 1140, y: 250, w: 100 },
        { x: 1520, y: 235, w: 110 }, { x: 1690, y: 185, w: 90 }, { x: 1850, y: 245, w: 100 },
        { x: 2230, y: 240, w: 110 }, { x: 2400, y: 190, w: 80 }, { x: 2550, y: 250, w: 100 },
        { x: 2880, y: 235, w: 110 }, { x: 3050, y: 180, w: 80 }
      ],
      spikes: [{ x: 1050, y: 310, w: 70 }, { x: 1760, y: 310, w: 64 }, { x: 2470, y: 310, w: 60 }],
      checkpoints: [{ x: 1220 }, { x: 2960 }],
      memories: [{ x: 535, y: 162 }, { x: 1730, y: 152 }, { x: 3070, y: 150 }],
      heals: [{ x: 1015, y: 215 }, { x: 2440, y: 210 }],
      enemies: [
        { type: "walker", x: 380, range: 160 },
        { type: "walker", x: 900, range: 180 },
        { type: "spitter", x: 1200, range: 90 },
        { type: "flyer", x: 1600, y: 215, range: 140 },
        { type: "walker", x: 1950, range: 180 },
        { type: "spitter", x: 2350, range: 90 },
        { type: "walker", x: 2850, range: 190 }
      ],
      intro: [
        "Pedro: O trono ficou para trás, {hero}. Mas o Reino não terminou — ele só mostrou a porta de baixo.",
        "Pedro: Esta é a Forja Profunda. O lugar onde fizeram o primeiro coração de ferro e esqueceram de desligá-lo.",
        "Pedro: O que ainda anda aqui não é gente. É trabalho que não soube parar."
      ],
      outro: [
        "Pedro: O Titã parou. A forja continua quente, mas já não tem dono.",
        "Pedro: Ainda tem uma estrada descendo. E eu não vou te pedir para voltar."
      ],
      camp: "A forja estala atrás de você. O calor demora a ir embora, como uma culpa bem-feita."
    },
    {
      id: "templo", name: "Templo Ancestral", numeral: "VII", act: 2,
      subtitle: "Onde a pedra ainda reza por um nome",
      theme: "temple", bossKey: "guardiao", quest: "pedra", width: 3750, arenaStart: 3370,
      groundGaps: [[700, 820], [1400, 1520], [2120, 2240], [2760, 2860]],
      platforms: [
        { x: 390, y: 250, w: 100 }, { x: 550, y: 195, w: 80 },
        { x: 900, y: 255, w: 110 }, { x: 1060, y: 205, w: 90 }, { x: 1220, y: 250, w: 100 },
        { x: 1580, y: 235, w: 110 }, { x: 1750, y: 185, w: 90 }, { x: 1910, y: 245, w: 100 },
        { x: 2300, y: 240, w: 110 }, { x: 2470, y: 190, w: 80 }, { x: 2620, y: 250, w: 100 },
        { x: 2950, y: 235, w: 110 }, { x: 3120, y: 180, w: 80 }, { x: 3240, y: 200, w: 80 }
      ],
      spikes: [{ x: 980, y: 310, w: 70 }, { x: 1830, y: 310, w: 64 }, { x: 2530, y: 310, w: 60 }],
      checkpoints: [{ x: 1280 }, { x: 3120 }],
      memories: [{ x: 570, y: 162 }, { x: 1800, y: 152 }, { x: 3160, y: 150 }],
      heals: [{ x: 1040, y: 215 }, { x: 2500, y: 210 }],
      enemies: [
        { type: "walker", x: 360, range: 160 },
        { type: "spitter", x: 870, range: 90 },
        { type: "flyer", x: 1250, y: 215, range: 140 },
        { type: "walker", x: 1700, range: 180 },
        { type: "spitter", x: 2000, range: 90 },
        { type: "walker", x: 2380, range: 180 },
        { type: "flyer", x: 2700, y: 215, range: 140 },
        { type: "walker", x: 3200, range: 190 }
      ],
      intro: [
        "Pedro: Este templo é mais velho que o Reino. Ele já estava aqui quando o primeiro rei aprendeu a mentir.",
        "Pedro: As paredes rezam por um nome que ninguém lembra. O Guardião ainda acha que precisa protegê-lo.",
        "Pedro: Não destrua a pedra por raiva. Ela só está fazendo o que mandaram."
      ],
      outro: [
        "Pedro: O Guardião descansou. A prece acabou, mas o templo continua de pé.",
        "Pedro: Há uma porta atrás do altar. Ela estava esperando alguém que não tivesse medo de areia."
      ],
      camp: "O templo fica em silêncio quando você para de andar. Até a pedra parece respirar."
    },
    {
      id: "tumba", name: "Tumba de Vidro", numeral: "VIII", act: 2,
      subtitle: "Onde o sol foi enterrado com o rei",
      theme: "desert", bossKey: "farao", quest: "areia", width: 3900, arenaStart: 3520,
      groundGaps: [[560, 680], [1280, 1400], [1980, 2100], [2660, 2780], [3180, 3280]],
      platforms: [
        { x: 350, y: 250, w: 100 }, { x: 510, y: 195, w: 80 },
        { x: 820, y: 255, w: 110 }, { x: 980, y: 205, w: 90 }, { x: 1140, y: 250, w: 100 },
        { x: 1480, y: 235, w: 110 }, { x: 1650, y: 185, w: 90 }, { x: 1810, y: 245, w: 100 },
        { x: 2200, y: 240, w: 110 }, { x: 2370, y: 190, w: 80 }, { x: 2520, y: 250, w: 100 },
        { x: 2860, y: 235, w: 110 }, { x: 3030, y: 180, w: 80 }, { x: 3340, y: 200, w: 80 }
      ],
      spikes: [{ x: 880, y: 310, w: 70 }, { x: 1720, y: 310, w: 64 }, { x: 2440, y: 310, w: 60 }, { x: 3110, y: 310, w: 60 }],
      checkpoints: [{ x: 1200 }, { x: 3350 }],
      memories: [{ x: 540, y: 162 }, { x: 1700, y: 152 }, { x: 3380, y: 150 }],
      heals: [{ x: 940, y: 215 }, { x: 2430, y: 210 }],
      enemies: [
        { type: "walker", x: 380, range: 160 },
        { type: "spitter", x: 860, range: 90 },
        { type: "flyer", x: 1180, y: 215, range: 140 },
        { type: "walker", x: 1600, range: 180 },
        { type: "spitter", x: 1900, range: 90 },
        { type: "walker", x: 2280, range: 180 },
        { type: "flyer", x: 2900, y: 215, range: 140 },
        { type: "walker", x: 3300, range: 190 }
      ],
      intro: [
        "Pedro: O deserto não é natural, {hero}. Ele nasceu quando o Faraó mandou enterrar o sol.",
        "Pedro: A tumba é feita de vidro porque o rei queria ver o que estava perdendo. Ainda está tudo aqui.",
        "Pedro: Respire pelo pano. A areia tem memória, e ela morde."
      ],
      outro: [
        "Pedro: O Faraó virou pó. O sol não voltou, mas o deserto ficou menos faminto.",
        "Pedro: A próxima passagem não tem chão. Só uma fenda. Eu preferia que você não olhasse para baixo."
      ],
      camp: "A areia não esfria. Você senta mesmo assim, e o vento cobre seus pés como uma promessa antiga."
    },
    {
      id: "fenda", name: "Fenda do Vazio", numeral: "IX", act: 2,
      subtitle: "Onde o Reino esqueceu de terminar",
      theme: "void", bossKey: "imperador", quest: "vazio", width: 4050, arenaStart: 3670,
      groundGaps: [[620, 760], [1380, 1500], [2140, 2260], [2840, 2960]],
      platforms: [
        { x: 380, y: 250, w: 100 }, { x: 540, y: 195, w: 80 },
        { x: 880, y: 255, w: 110 }, { x: 1040, y: 205, w: 90 }, { x: 1200, y: 250, w: 100 },
        { x: 1580, y: 235, w: 110 }, { x: 1750, y: 185, w: 90 }, { x: 1910, y: 245, w: 100 },
        { x: 2320, y: 240, w: 110 }, { x: 2490, y: 190, w: 80 }, { x: 2640, y: 250, w: 100 },
        { x: 3040, y: 235, w: 110 }, { x: 3210, y: 180, w: 80 }, { x: 3480, y: 200, w: 80 }
      ],
      spikes: [{ x: 960, y: 310, w: 70 }, { x: 1820, y: 310, w: 64 }, { x: 2500, y: 310, w: 60 }],
      checkpoints: [{ x: 1280 }, { x: 3500 }],
      memories: [{ x: 550, y: 162 }, { x: 1760, y: 152 }, { x: 3540, y: 150 }],
      heals: [{ x: 1020, y: 215 }, { x: 2500, y: 210 }],
      enemies: [
        { type: "walker", x: 400, range: 160 },
        { type: "spitter", x: 900, range: 90 },
        { type: "flyer", x: 1240, y: 215, range: 140 },
        { type: "walker", x: 1650, range: 180 },
        { type: "spitter", x: 1980, range: 90 },
        { type: "flyer", x: 2380, y: 205, range: 150 },
        { type: "walker", x: 2760, range: 190 },
        { type: "walker", x: 3300, range: 190 }
      ],
      intro: [
        "Pedro: A partir daqui, o Reino não tem chão. Ele tem escolhas que você ainda não fez.",
        "Pedro: O Imperador do Vazio não quer conquistar nada. Ele quer que nada exista para ser conquistado.",
        "Pedro: Se ouvir a sua própria voz voltando, não responda. Ela está do lado dele."
      ],
      outro: [
        "Pedro: O trono vazio ficou vazio de verdade. O Imperador não estava lá.",
        "Pedro: Só falta o céu. E o céu está partido."
      ],
      camp: "A fenda se fecha devagar atrás de você. O silêncio que sobra é quase gentil."
    },
    {
      id: "ceu", name: "Céu Partido", numeral: "X", act: 2,
      subtitle: "Onde a última asa ainda procura o chão",
      theme: "celestial", bossKey: "arcanjo", quest: "asa", width: 4200, arenaStart: 3820,
      groundGaps: [[700, 820], [1460, 1580], [2220, 2340], [2960, 3080]],
      platforms: [
        { x: 400, y: 250, w: 100 }, { x: 560, y: 195, w: 80 },
        { x: 920, y: 255, w: 110 }, { x: 1080, y: 205, w: 90 }, { x: 1240, y: 250, w: 100 },
        { x: 1660, y: 235, w: 110 }, { x: 1830, y: 185, w: 90 }, { x: 1990, y: 245, w: 100 },
        { x: 2420, y: 240, w: 110 }, { x: 2590, y: 190, w: 80 }, { x: 2740, y: 250, w: 100 },
        { x: 3180, y: 235, w: 110 }, { x: 3350, y: 180, w: 80 }, { x: 3680, y: 200, w: 80 }
      ],
      spikes: [{ x: 1000, y: 310, w: 70 }, { x: 1900, y: 310, w: 64 }, { x: 2600, y: 310, w: 60 }, { x: 3270, y: 310, w: 60 }],
      checkpoints: [{ x: 1360 }, { x: 3700 }],
      memories: [{ x: 570, y: 162 }, { x: 1860, y: 152 }, { x: 3740, y: 150 }],
      heals: [{ x: 1060, y: 215 }, { x: 2600, y: 210 }],
      enemies: [
        { type: "walker", x: 420, range: 160 },
        { type: "spitter", x: 940, range: 90 },
        { type: "flyer", x: 1320, y: 215, range: 140 },
        { type: "walker", x: 1750, range: 180 },
        { type: "spitter", x: 2080, range: 90 },
        { type: "flyer", x: 2500, y: 205, range: 150 },
        { type: "walker", x: 2880, range: 180 },
        { type: "walker", x: 3400, range: 190 }
      ],
      intro: [
        "Pedro: Este é o Céu Partido, {hero}. O lugar onde os anjos caíram e ninguém teve coragem de recolher as asas.",
        "Pedro: O Arcanjo Caído era o último. Ele acredita que ficar no céu é uma forma de morrer sem testemunha.",
        "Pedro: Eu não sei o que existe depois dele. Mas eu sei que você não vai estar sozinho."
      ],
      outro: [
        "Pedro: A última asa caiu. O céu não tem mais dono.",
        "Pedro: O Reino inteiro está esperando. E eu também. Dessa vez, não há coroa — só o que você escolheu lembrar."
      ],
      camp: "O céu se abre pela primeira vez em séculos. Não há mais nada acima de você — só espaço."
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
    },
    act2: {
      title: "O CÉU SEM DONO",
      text: [
        "O Arcanjo cai. A última pena dourada pousa no chão, e o céu fica sem voz.",
        "Você atravessa a porta partida. O Reino Sem Nome não tem mais coroa, mais forja, mais faraó ou mais vazio para oferecer.",
        "Pedro caminha ao seu lado. Nenhum dos dois sabe o que vem depois, mas a estrada é larga o bastante para os dois.",
        "Algumas memórias ficaram para trás. O céu não cobra por elas. Ele apenas espera que alguém volte para contá-las."
      ],
      tone: "warm"
    },
    act2true: {
      title: "A MEMÓRIA ETERNA",
      text: [
        "O Arcanjo cai, e você não o deixa sozinho. A asa partida encontra o chão antes do corpo.",
        "As trinta memórias se erguem ao seu redor. Não são fantasmas: são tudo o que o Reino tentou esquecer e você decidiu carregar.",
        "Pedro pronuncia o seu nome. Não o título, não a classe, não o grau. O seu nome.",
        "O céu não se fecha. O Reino não termina. A forja, o templo, a tumba e o vazio continuam existindo — mas agora alguém sabe por quê.",
        "Quando o sol nasce, ele nasce para todos. E a história, finalmente, tem um lugar para ficar."
      ],
      tone: "gold"
    }
  };

  TP.DATA = {
    RARITIES, CHARACTERS, OUTFITS, WEAPON_CLASSES, WEAPONS, DIFFICULTIES,
    BOSSES, MEMORIES, QUESTS, LEVELS, ENDINGS
  };
})();
