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

**Pacotes são só dados: cores e mídia, nunca código.** Aberturas, scripts, páginas e executáveis não são aceitos. O app confere cada arquivo (tamanho, formato e o SHA-256 do catálogo) antes de usar.

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
| `paleta` | tema: `scheme` (`dark` ou `light`) e as cores `rail`, `sidebar`, `main`, `surface`, `text`, `textSecondary`, `textMuted`, `link`, `accent`, `success`, `warning`, `danger`, `info`; opcionais: `overlay`, `titlebar`, `accentContrast`, `code`, `scrollbar` e `glass` |

As cores são sempre hexadecimais (`#RGB`, `#RRGGBB` ou `#RRGGBBAA`). A pasta não pode ter arquivos que o manifesto não cita.

## Para quem mantém o repositório

- `scripts/regras.mjs`: as regras acima. As mesmas regras ficam no app (`src/main/communityRules.ts`, no repositório privado do app); se mudar uma, mude a outra.
- `node scripts/gerar-indice.mjs --conferir`: confere todos os pacotes.
- `node scripts/gerar-indice.mjs`: confere e grava o `indice.json`, o catálogo que o app lê.
- A verificação automática (`.github/workflows/catalogo.yml`) confere cada proposta (e recusa mudanças fora de `pacotes/`). Depois da aprovação, ela regrava o `indice.json`.
