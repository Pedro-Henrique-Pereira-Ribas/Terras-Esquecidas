# Terra Perdida

**Cinco terras. Uma memória esquecida.**

Um jogo de plataforma 2D em pixel art, feito para rodar direto no navegador. Atravesse cinco terras esquecidas, enfrente os guardiões que sobraram e reúna as memórias que o Reino Sem Nome tentou apagar.

> “A estrada não me assusta. Só o silêncio dela.” — Pedro, arquivista do Reino Sem Nome

**Jogue agora:** https://pedro-henrique-pereira-ribas.github.io/Terras-Esquecidas/

---

## O que tem no jogo

- **5 terras** com cenários, plataformas, perigos e chefes próprios: Ruínas Antigas, Trilha Perdida, Serra Sombria, Mina Enferrujada e Última Fronteira.
- **5 heróis jogáveis**, cada um com arma, passiva, peso e estilo de movimento diferentes.
- **4 chefes** pelo caminho e o **Rei das Cinzas** no fim, com fases e padrões de ataque distintos.
- **4 degraus de arma** por classe, forjados com as moedas deixadas pelos chefes.
- **Loja no acampamento** para comprar armas de qualquer classe e trocar a equipada antes de seguir viagem.
- **15 memórias** escondidas pelas fases. Elas não aumentam seu poder — mudam o que você pode dizer no final.
- **3 dificuldades** (Raiz, Selva e Ruína) com ajustes reais de dano, vida, velocidade e cura.
- **3 finais**, incluindo um final verdadeiro para quem encontrar todas as memórias.
- **Diário de Memórias** no menu de pausa, com as lembranças encontradas e pistas para as que faltam.
- **Arte e áudio 100% procedurais**: retratos, cenários, sprites, efeitos e trilha sonora são gerados por código. Nenhum asset externo.

## Controles

| Ação | Teclado | Gamepad / toque |
| --- | --- | --- |
| Mover | `A` / `D` ou setas | analógico / D-pad ou botões na tela |
| Pular | `Espaço`, `W`, `Z` ou `↑` | **A** / botão **SALTO** |
| Atacar | `J` ou `X` | **X** / botão **GOLPE** |
| Esquivar | `Shift` ou `K` / `C` | **B** / botão **»** |
| Pausar | `Esc` ou `P` | **Start** / botão **II** |
| Avançar diálogo | `Enter`, `Espaço` ou `E` | **A** / toque na tela |

**Mouse:** clique no canvas para atacar; menus e cartões também respondem ao clique.

**Gamepad (mapeamento padrão):** analógico ou D-pad move, **A** pula, **X** ataca, **B** esquiva e **Start** pausa. Nos menus, o D-pad navega e **A** confirma.

**Celular:** jogue na horizontal. Em modo retrato, o jogo mostra um aviso para girar o aparelho.

O viajante tem um salto extra no ar. Nas fases com chefes voadores, pule e ataque no ar — o alcance vertical faz parte do combate.

### Alcance das armas

- **Espada e machado:** curto alcance, dano constante.
- **Arco:** longa distância. Perto demais, a flecha perde força; no alcance máximo, causa mais dano.
- **Cajado:** distância média. O feitiço é mais forte na faixa ideal e perde força de perto ou longe demais.

As armas compradas na loja ficam na mochila da jornada. A forja melhora a classe atualmente equipada, então vale escolher bem antes de gastar as moedas.

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
js/data.js          # heróis, armas, dificuldades, chefes, memórias e fases
js/game.js          # fluxo da jornada, combate, camp, forja e finais
js/ui.js            # telas, HUD, cartões, diálogos e diário
js/art.js           # retratos, ícones e arte procedural
js/sprites.js       # sprites de inimigos e chefes
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
