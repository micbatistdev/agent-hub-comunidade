# Comunidade do Vibe Code Recreative

Personalizações feitas pela comunidade para o **Vibe Code Recreative** (antes Agent Hub), o app desktop que coordena projetos com vários agentes de IA: **temas**, **planos de fundo**, **molduras** e **sons de notificação**. Funciona como nos programas de teclados mecânicos: você abre a loja dentro do app, escolhe e aplica com um clique.

## Como baixar

No Vibe Code Recreative: **Configurações → Comunidade**. Escolha um pacote e clique em **Baixar e aplicar**. Quando o autor publica uma versão nova, o app avisa.

## O que pode ser compartilhado

| Tipo | O que vai no pacote |
|---|---|
| `tema` | só as cores (paleta), no mesmo formato dos temas do app |
| `fundo` | uma imagem (PNG, JPEG, WebP, GIF) ou um vídeo (MP4, WebM), até 25 MB |
| `moldura` | um degradê (de 2 a 6 cores) ou uma imagem (PNG, WebP, GIF), até 5 MB |
| `som` | um som de notificação (MP3, WAV, OGG, M4A), até 5 MB |
| `skin` | uma skin do programa: layout, estilo (CSS conferido), imagens e, opcionais, tema, molduras, ícone, estilo pronto e abertura (veja abaixo) |

**Pacotes são só dados: cores, mídia e, nas skins, estilo CSS conferido; nunca código.** Scripts, páginas (HTML) e executáveis não são aceitos. O app confere cada arquivo (tamanho, formato e o SHA-256 do catálogo) antes de usar.

## Como publicar

1. No Vibe Code Recreative, abra **Configurações → Comunidade → Publicar**, escolha a sua personalização (um tema, fundo, moldura ou som que você criou) e clique em **Exportar para a comunidade**. O app cria uma pasta com o `manifesto.json` e os arquivos.
2. O app abre a página de envio deste repositório. Entre com a sua conta do GitHub e **arraste a pasta** para a página.
3. Escreva uma frase sobre o pacote e clique em **Propose changes**. O GitHub cria uma cópia do repositório na sua conta e uma **proposta (pull request)**.
4. A verificação automática confere o pacote. O dono do repositório revisa e aprova. Depois disso, o catálogo é atualizado sozinho e o pacote aparece na loja.

Ao publicar, você declara que o conteúdo é seu (ou que pode compartilhá-lo) e autoriza que ele seja distribuído pela loja do Vibe Code Recreative.

## Formato de um pacote

Cada pacote é uma pasta em `pacotes/`, com o mesmo nome do `id`:

```
pacotes/
  constelacao/
    manifesto.json
    fundo.png
    previa.png
```

`manifesto.json`:

```json
{
  "formato": 1,
  "id": "constelacao",
  "tipo": "fundo",
  "nome": "Constelação",
  "autor": "Seu nome",
  "descricao": "Céu noturno com estrelas ligadas por linhas finas.",
  "versao": "1.0.0",
  "previa": "previa.png",
  "arquivo": "fundo.png"
}
```

| Campo | Regra |
|---|---|
| `id` | letras minúsculas, números e hífens (até 48); igual ao nome da pasta |
| `nome`, `autor` | até 40 caracteres |
| `descricao` | até 200 caracteres |
| `versao` | como `1.0.0`; aumente a cada atualização para o app avisar quem já baixou |
| `previa` | opcional: imagem pequena (até 1 MB) mostrada na loja; recomendada para fundos e molduras de imagem |
| `arquivo` | fundo, som ou moldura de imagem: nome simples, como `fundo.png` |
| `cores`, `animada`, `brilho` | moldura em degradê: de 2 a 6 cores `#RRGGBB`; animação e brilho opcionais |
| `paleta` | tema: `scheme` (`dark` ou `light`) e as cores `rail`, `sidebar`, `main`, `surface`, `text`, `textSecondary`, `textMuted`, `link`, `accent`, `success`, `warning`, `danger`, `info`; opcionais: `overlay`, `titlebar`, `accentContrast`, `code`, `scrollbar`, `chat` (o fundo da conversa), `glass` e `ajustes` (veja abaixo) |

As cores são sempre hexadecimais (`#RGB`, `#RRGGBB` ou `#RRGGBBAA`). A pasta não pode ter arquivos que o manifesto não cita.

`ajustes` (opcional, numa paleta): cores finas além das principais, pelo nome do token do app: `bubble-out-bg` e `bubble-in-bg` (os balões), `bg-modifier-hover`, `bg-modifier-selected` e `bg-modifier-active` (os realces), `border-subtle` e `border-strong`, `mention-bg` e `mention-text`, `focus-ring` e `avatar-1` a `avatar-6`. Use `#RRGGBBAA` para as translúcidas, como `"bg-modifier-hover": "#0B141A0A"`.

## Skins do programa (`tipo: "skin"`)

As skins oficiais (Foco, Slack, IDE, WhatsApp e League of Legends) estão em `pacotes/` e saem do projeto do app, onde fica a fonte delas (`comunidade/skins/` e `comunidade/fonte/`, publicadas por `scripts/publicar-skins.mjs` de lá).

Uma skin muda o layout inteiro do app. Ela também é só dados: o app traz os arranjos de layout prontos e a skin escolhe um pelo nome; o resto é estilo (CSS conferido), imagens e, se quiser, tema, molduras, ícone, estilo pronto e abertura. Quem desinstala a skin não fica com nada dela no programa.

```json
{
  "formato": 1,
  "id": "minha-skin",
  "tipo": "skin",
  "nome": "Minha skin",
  "autor": "Seu nome",
  "descricao": "Barra no topo e balões dourados.",
  "versao": "1.0.0",
  "previa": "previa.png",
  "layout": "topo",
  "caracteristicas": { "mensagensSemAvatar": true },
  "estilo": "estilo.css",
  "imagens": ["brilho.png", "simbolo.png"],
  "paleta": { "scheme": "dark", "rail": "#010A13", "...": "as cores de um tema" },
  "molduras": [{ "id": "ouro", "nome": "Ouro", "arquivo": "moldura-ouro.png" }],
  "molduraPadrao": "ouro",
  "icone": "icone.ico",
  "estiloPronto": { "destaque": "#C8AA6E", "escurecer": 0, "opacidade": 100, "desfoque": 0, "cores": ["#010A13", "#0A1428", "#7A5F2C", "#C8AA6E"] },
  "abertura": { "estilo": "abertura.css", "simbolo": "simbolo.png", "titulo": "Carregando" }
}
```

| Campo | Regra |
|---|---|
| `id` | até 40 caracteres |
| `layout` | obrigatório: `classico` (projetos, salas, conversa e detalhes lado a lado), `foco` (só a conversa), `coluna` (uma coluna à esquerda), `editor` (como um editor de código) ou `topo` (barra no topo e painel à direita) |
| `caracteristicas` | opcional, `true` ou `false`: `listasDeConversa` (prévia e hora nas listas, como num app de mensagens), `mensagensSemAvatar`, `inicioNoLayout` (a tela inicial fica dentro do layout) |
| `estilo` | obrigatório: um `.css` de até 256 KB (veja as regras abaixo) |
| `imagens` | opcional: até 40 imagens (PNG, JPEG, WebP, GIF, até 5 MB cada), usadas no estilo e na abertura |
| `paleta` | opcional: o tema da skin, como num pacote `tema`; o app veste junto com a skin |
| `outrosTemas` | opcional (precisa da `paleta`): até 3 temas a mais, como o escuro de uma skin clara. Cada um tem `id` (até 24), `nome` (até 40), `paleta` e, opcional, `estiloPronto` (sem `fundo`) |
| `molduras`, `molduraPadrao` | opcional: até 12 molduras (imagem ou degradê, como num pacote `moldura`, com `id` e `nome`); a padrão vai nos avatares de quem não escolheu nenhuma |
| `icone` | opcional: o ícone do programa (`.ico`, até 1 MB), vestido junto com a skin |
| `estiloPronto` | opcional (precisa da `paleta`): aparece em Estilos prontos. `fundo` (um arquivo como o de um pacote `fundo`), `destaque` (`#RRGGBB`), `escurecer` e `opacidade` (0 a 100), `desfoque` (0 a 20), `cores` (4 cores para a miniatura) e `descricao` (até 200; sem ela, vale a da skin) |
| `abertura` | opcional: a abertura do app com a skin vestida. `estilo` (`.css`, com as mesmas regras), `simbolo` (uma das `imagens`) e `titulo` (até 40). O HTML é sempre o do app; o estilo age em `#splash`, `.deco-1` a `.deco-6`, `.center`, `.mark`, `.title`, `.progress span` (largura pela variável `--progress`), `.step`, `.slow` e `.version` |

**Regras do estilo** (o app confere de novo antes de usar): nada de `@import`; nada de barra invertida (escapes); `url()` só para as imagens do próprio pacote, escritas como `url(pacote:brilho.png)`, ou imagens embutidas (`data:image/...`); nada de `expression`, `behavior`, `-moz-binding` ou `javascript:`. O estilo age nas classes estáveis do app (`hf-<Componente>__<classe>`) e nos atributos `data-*`, sempre por baixo de `[data-skin='<id>']`. A soma de todos os arquivos de uma skin vai até 60 MB.

## Para quem mantém o repositório

- `scripts/regras.mjs`: as regras acima. As mesmas regras ficam no app (`src/main/communityRules.ts`, no repositório privado do app); se mudar uma, mude a outra.
- `node scripts/gerar-indice.mjs --conferir`: confere todos os pacotes.
- `node scripts/gerar-indice.mjs`: confere e grava o `indice.json`, o catálogo que o app lê.
- A verificação automática (`.github/workflows/catalogo.yml`) confere cada proposta (e recusa mudanças fora de `pacotes/`). Depois da aprovação, ela regrava o `indice.json`.
