# Terra Perdida

**Dez terras. Duas jornadas. Uma memória esquecida.**

Um jogo de plataforma 2D em pixel art, feito para rodar direto no navegador. Atravesse as cinco terras clássicas, derrote o Rei das Cinzas e escolha um final — depois, se quiser, continue para o Ato II e descubra o que o Reino escondeu embaixo do trono.

> “A estrada não me assusta. Só o silêncio dela.” — Pedro, arquivista do Reino Sem Nome

**Jogue agora:** https://pedro-henrique-pereira-ribas.github.io/Terras-Esquecidas/

---

## O que tem no jogo

- **10 terras** com cenários, plataformas, perigos e chefes próprios. As cinco clássicas são Ruínas Antigas, Trilha Perdida, Serra Sombria, Mina Enferrujada e Última Fronteira; o Ato II acrescenta Forja Profunda, Templo Ancestral, Tumba de Vidro, Fenda do Vazio e Céu Partido.
- **5 heróis jogáveis**, cada um com arma, passiva, peso e estilo de movimento diferentes.
- **10 chefes**: Colosso, Vulto, Corvo Cinzento, Ferrugem e Rei das Cinzas no Ato I; Titã Mecânico, Guardião Ancestral, Faraó Maldito, Imperador do Vazio e Arcanjo Caído no Ato II. Cada um tem fases, ataques e cores próprias.
- **9 degraus de arma por classe** (espada, arco, picareta e cajado), com **20 armas novas** no Ato II. As armas não são compradas: cada chefe de progressão entrega automaticamente o próximo degrau da classe equipada.
- **10 tarefas de fase** com NPCs e alvos únicos, pagando de 200 a 500 moedas. As tarefas voltam a cada Nova Jornada.
- **3 mercadores de encantamentos** no Ato II, um em cada uma das três últimas fases. Eles vendem melhorias permanentes de dano e velocidade de ataque para as armas do herói.
- **Vestiário no acampamento** para comprar roupas e novas paletas para os cinco heróis. As peças são cosméticas, ficam salvas no navegador e valem para as próximas jornadas.
- **Conta local e servidor opcionais**, com nome e chave de acesso guardados apenas no navegador. Dá para jogar como visitante sem criar nada.
- **30 memórias** escondidas pelas dez fases. Elas não aumentam seu poder — mudam o que você pode dizer no final.
- **3 dificuldades** (Raiz, Selva e Ruína) com ajustes reais de dano, vida, velocidade e cura.
- **5 finais**: três clássicos após o Rei das Cinzas e dois no fim do Ato II, incluindo o final verdadeiro do Arcanjo para quem reunir as 30 memórias.
- **Diário de Memórias** no menu de pausa, com as lembranças encontradas, tarefas e pistas para as que faltam.
- **Arte e áudio 100% procedurais**: retratos, cenários, sprites, efeitos e trilha sonora são gerados por código. Nenhum asset externo.

### Conta e servidor

O jogo abre direto no título e pode ser jogado como **Visitante**, sem criar conta. Se quiser guardar um nome e um servidor, use o botão **Entrar** no canto do título para criar uma conta local com nome, uma chave de 4 dígitos e o nome do servidor. A conta, as roupas desbloqueadas e os encantamentos comprados ficam salvos no `localStorage` do próprio navegador — não há login remoto nem envio de dados. Para voltar depois, use a aba **Entrar** com o mesmo nome e chave; o botão **Conta** no título permite trocar de perfil ou voltar a jogar sem conta.

## Controles

| Ação | Teclado | Gamepad / toque |
| --- | --- | --- |
| Mover | `A` / `D` ou setas | analógico / D-pad ou botões na tela |
| Pular | `Espaço`, `W`, `Z` ou `↑` | **A** / botão **SALTO** |
| Atacar | `J` ou `X` | **X** / botão **GOLPE** |
| Esquivar | `Shift` ou `K` / `C` | **B** / botão **»** |
| Falar / abrir loja | `E` | **Y** / botão **FALAR** ou **LOJA** |
| Pausar | `Esc` ou `P` | **Start** / botão **II** |
| Avançar diálogo | `Enter`, `Espaço` ou `E` | **A** / toque na tela |

**Mouse:** clique no canvas para atacar; menus e cartões também respondem ao clique.

**Gamepad (mapeamento padrão):** analógico ou D-pad move, **A** pula, **X** ataca, **B** esquiva, **Y** fala ou abre loja e **Start** pausa. Nos menus, o D-pad navega e **A** confirma.

**Celular:** jogue na horizontal. Em modo retrato, o jogo mostra um aviso para girar o aparelho.

O viajante tem um salto extra no ar. Nas fases com chefes voadores, pule e ataque no ar — o alcance vertical faz parte do combate.

### Alcance das armas

- **Espada e picareta:** curto alcance, dano constante. A picareta do Minerador é pesada, mas abre espaço com cada golpe.
- **Arco:** longa distância. Perto demais, a flecha perde força; no alcance máximo, causa mais dano.
- **Cajado:** distância média. O feitiço é mais forte na faixa ideal e perde força de perto ou longe demais.

As armas não custam moedas. Os chefes de progressão entregam automaticamente o próximo degrau da classe equipada, já em uso. Todos os chefes rendem moedas — de 750 a 2.000 no Ato II — que podem ser gastas no **Vestiário** em roupas para qualquer herói ou nos mercadores das três últimas fases do Ato II em encantamentos permanentes. As roupas são cosméticas e permanecem desbloqueadas no `localStorage` deste navegador, mesmo depois de voltar ao título.

## Ato I → Ato II

O Ato I termina no Rei das Cinzas, com os três finais clássicos. Depois de qualquer um deles, a tela de resultado mostra **CONTINUAR PARA O ATO II**. A escolha é opcional: **Nova Jornada** recomeça o clássico do zero, e **Voltar ao título** encerra a sessão.

Ao continuar, o herói mantém classe, arma, moedas, roupas, encantamentos, tarefas e memórias. O Ato II começa na Forja Profunda e segue por Templo Ancestral, Tumba de Vidro, Fenda do Vazio e Céu Partido. Cada fase tem três memórias, uma tarefa e um chefe que entrega o próximo degrau de arma:

| Fase | Chefe | Arma entregue |
| --- | --- | --- |
| Forja Profunda | Titã Mecânico | Divina |
| Templo Ancestral | Guardião Ancestral | Celestial |
| Tumba de Vidro | Faraó Maldito | Ancestral |
| Fenda do Vazio | Imperador do Vazio | Suprema |
| Céu Partido | Arcanjo Caído | Eterna |

O Arcanjo não usa o acampamento final do Rei. Ao vencê-lo, o jogo mostra automaticamente o final do Ato II: **O Céu Sem Dono** com menos de 30 memórias, ou **A Memória Eterna** com as 30.

## Mercadores de encantamentos

As três últimas fases do Ato II têm um mercador perto do início da fase. Ele não substitui o NPC da tarefa: os dois continuam no mapa, cada um com sua própria interação. Aproxime-se e pressione `E` (ou o botão **LOJA** no toque) para abrir a loja.

| Fase | Mercador | Encantamento | Preço | Efeito |
| --- | --- | --- | ---: | --- |
| Tumba de Vidro | Khepri | Lâmina de Vidro | 1.500 | +5% de dano |
| Tumba de Vidro | Khepri | Passo das Dunas | 1.300 | +4% de velocidade de ataque |
| Fenda do Vazio | Nul | Fio do Vazio | 1.900 | +7% de dano |
| Fenda do Vazio | Nul | Deriva Silenciosa | 1.700 | +5% de velocidade de ataque |
| Céu Partido | Vesper | Julgamento Partido | 2.300 | +9% de dano |
| Céu Partido | Vesper | Asa Restaurada | 2.100 | +6% de velocidade de ataque |

Os bônus somam entre si. Comprar os seis encantamentos custa **10.800 moedas** e deixa o herói com **+21% de dano** e **+15% de velocidade de ataque**. Cada encantamento é comprado uma única vez por herói e vale para **todas as armas do herói** — a melhoria não fica presa a uma arma específica.

As compras são permanentes no navegador e ficam separadas por herói em `terraPerdida.enchantments.v1`. Elas valem em todas as jornadas, inclusive no Ato I e em uma Nova Jornada. O controle de encantamentos fica na própria loja e no menu de pausa: desligá-lo remove os bônus imediatamente, mas não apaga nem devolve as compras. Os mercadores não alteram tarefas, chefes, memórias ou finais.

## Como rodar localmente

Não precisa de build nem de dependências para jogar:

```bash
# opção 1: abra o index.html no navegador
# opção 2: sirva a pasta com qualquer servidor estático
npx serve .
```

Também funciona apenas abrindo `index.html` com dois cliques. O jogo não usa módulos ES, então não exige servidor.

## Estrutura

```
index.html          # telas, HUD e estrutura
css/style.css       # identidade visual e responsividade
js/data.js          # heróis, armas, chefes, memórias, encantamentos e fases
js/game.js          # fluxo da jornada, combate, camp, mercadores, drops e finais
js/ui.js            # telas, HUD, loja de encantamentos, cartões, diálogos e diário
js/art.js           # retratos, ícones de encantamento e arte procedural
js/sprites.js       # sprites de inimigos, chefes e NPCs
js/scenery.js       # cenários de fundo
js/renderer.js      # desenho do mundo no canvas
js/audio.js         # WebAudio procedural (trilha e efeitos)
js/input.js         # teclado, mouse, toque e gamepad
```

O canvas tem resolução interna de **640 × 360** e é ampliado preservando 16:9 com `image-rendering: pixelated`. Em janelas múltiplas de 640 × 360 (como 1280 × 720) a escala é inteira e os pixels ficam sem suavização; em telas menores, o jogo se ajusta ao espaço disponível sem esticar a imagem.

## Publicação

O workflow em `.github/workflows/pages.yml` publica o jogo no GitHub Pages a cada push na branch `main`. O site é estático e não precisa de backend.

## Créditos

Feito por **Pedro Henrique Pereira Ribas**.

Todo o jogo — código, arte procedural, texto e áudio — foi criado para este projeto, sem bibliotecas de jogo, engine ou assets de terceiros.
