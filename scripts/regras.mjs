// Regras de um pacote da comunidade do Agent Hub.
// As mesmas regras ficam no app (src/main/communityRules.ts do repositório agent-hub):
// se mudar aqui, mude lá também. Pacotes são só dados (cores, mídia e, nas skins, estilo CSS
// conferido), nunca código.

export const FORMATO = 1

export const TIPOS = ['tema', 'fundo', 'moldura', 'som', 'skin']

/** Tamanho máximo de cada arquivo (o envio pela página do GitHub aceita até 25 MB). */
export const LIMITES = {
  previa: 1 * 1024 * 1024,
  fundo: 25 * 1024 * 1024,
  moldura: 5 * 1024 * 1024,
  som: 5 * 1024 * 1024,
  // Arquivos de uma skin (etapa 125 do app).
  estilo: 256 * 1024,
  imagem: 5 * 1024 * 1024,
  icone: 1 * 1024 * 1024
}

/** Extensões aceitas por tipo de arquivo. */
export const EXTENSOES = {
  previa: ['png', 'jpg', 'webp', 'gif'],
  fundo: ['png', 'jpg', 'webp', 'gif', 'mp4', 'webm'],
  moldura: ['png', 'webp', 'gif'],
  som: ['mp3', 'wav', 'ogg', 'm4a'],
  estilo: ['css'],
  imagem: ['png', 'jpg', 'webp', 'gif'],
  icone: ['ico']
}

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const VERSAO = /^\d{1,3}\.\d{1,3}\.\d{1,3}$/
const COR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const COR6 = /^#[0-9a-fA-F]{6}$/
const ARQUIVO = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(png|jpg|webp|gif|mp4|webm|mp3|wav|ogg|m4a|css|ico)$/
const CONTROLE = /[\u0000-\u001f\u007f]/

/** Cores obrigatórias e opcionais de um tema (as mesmas do ThemePalette do app). */
export const CORES_OBRIGATORIAS = [
  'rail', 'sidebar', 'main', 'surface', 'text', 'textSecondary', 'textMuted',
  'link', 'accent', 'success', 'warning', 'danger', 'info'
]
export const CORES_OPCIONAIS = ['overlay', 'titlebar', 'accentContrast', 'code', 'scrollbar', 'chat']
/** Tokens finos que a paleta pode ajustar em "ajustes" (sempre cores; #RRGGBBAA para as translúcidas). */
export const AJUSTES_DA_PALETA = [
  'bubble-out-bg',
  'bubble-in-bg',
  'bg-modifier-hover',
  'bg-modifier-selected',
  'bg-modifier-active',
  'border-subtle',
  'border-strong',
  'mention-bg',
  'mention-text',
  'focus-ring',
  'avatar-1',
  'avatar-2',
  'avatar-3',
  'avatar-4',
  'avatar-5',
  'avatar-6'
]

function texto(valor, campo, max, erros, obrigatorio = true) {
  if (valor === undefined && !obrigatorio) return
  if (typeof valor !== 'string' || !valor.trim()) return erros.push(`"${campo}" precisa ser um texto`)
  if (valor.length > max) erros.push(`"${campo}" tem mais de ${max} caracteres`)
  if (CONTROLE.test(valor)) erros.push(`"${campo}" tem caracteres de controle`)
}

function nomeDeArquivo(valor, campo, tipoArquivo, erros) {
  if (typeof valor !== 'string' || !ARQUIVO.test(valor)) {
    return erros.push(`"${campo}" precisa ser um nome simples de arquivo, como "fundo.png" (letras minúsculas, números e hífens)`)
  }
  const ext = valor.split('.').pop()
  if (!EXTENSOES[tipoArquivo].includes(ext)) erros.push(`"${campo}": .${ext} não é aceito (use ${EXTENSOES[tipoArquivo].join(', ')})`)
}

/**
 * Confere o manifesto de um pacote. Devolve a lista de erros (vazia = válido)
 * e os arquivos que ele usa, com o tipo de cada um (para o limite de tamanho).
 */
export function validarManifesto(m, pasta) {
  const erros = []
  const arquivos = []
  if (!m || typeof m !== 'object' || Array.isArray(m)) return { erros: ['o manifesto precisa ser um objeto JSON'], arquivos }
  if (m.formato !== FORMATO) erros.push(`"formato" precisa ser ${FORMATO}`)
  if (typeof m.id !== 'string' || !ID.test(m.id) || m.id.length > 48) erros.push('"id" precisa ter só letras minúsculas, números e hífens (até 48)')
  else if (pasta !== undefined && m.id !== pasta) erros.push(`"id" (${m.id}) precisa ser igual ao nome da pasta (${pasta})`)
  if (!TIPOS.includes(m.tipo)) erros.push(`"tipo" precisa ser um destes: ${TIPOS.join(', ')}`)
  texto(m.nome, 'nome', 40, erros)
  texto(m.autor, 'autor', 40, erros)
  texto(m.descricao, 'descricao', 200, erros)
  if (typeof m.versao !== 'string' || !VERSAO.test(m.versao)) erros.push('"versao" precisa ser como 1.0.0')
  if (m.previa !== undefined) {
    nomeDeArquivo(m.previa, 'previa', 'previa', erros)
    arquivos.push({ arquivo: m.previa, tipo: 'previa' })
  }

  const permitidos = new Set(['formato', 'id', 'tipo', 'nome', 'autor', 'descricao', 'versao', 'previa'])
  if (m.tipo === 'tema') {
    permitidos.add('paleta')
    validarPaleta(m.paleta, erros)
  } else if (m.tipo === 'skin') {
    for (const k of CAMPOS_DA_SKIN) permitidos.add(k)
    validarSkin(m, erros, arquivos)
  } else if (m.tipo === 'fundo' || m.tipo === 'som') {
    permitidos.add('arquivo')
    nomeDeArquivo(m.arquivo, 'arquivo', m.tipo, erros)
    arquivos.push({ arquivo: m.arquivo, tipo: m.tipo })
  } else if (m.tipo === 'moldura') {
    for (const k of ['arquivo', 'cores', 'animada', 'brilho']) permitidos.add(k)
    if (m.arquivo !== undefined) {
      if (m.cores !== undefined) erros.push('uma moldura usa "arquivo" (imagem) ou "cores" (degradê), não os dois')
      nomeDeArquivo(m.arquivo, 'arquivo', 'moldura', erros)
      arquivos.push({ arquivo: m.arquivo, tipo: 'moldura' })
    } else if (!Array.isArray(m.cores) || m.cores.length < 2 || m.cores.length > 6 || !m.cores.every((c) => typeof c === 'string' && COR6.test(c))) {
      erros.push('"cores" precisa ter de 2 a 6 cores #RRGGBB (ou use "arquivo" com uma imagem)')
    }
    if (m.animada !== undefined && typeof m.animada !== 'boolean') erros.push('"animada" precisa ser true ou false')
    if (m.brilho !== undefined && typeof m.brilho !== 'boolean') erros.push('"brilho" precisa ser true ou false')
  }
  for (const k of Object.keys(m)) if (!permitidos.has(k)) erros.push(`"${k}" não é um campo conhecido`)
  const vistos = new Set()
  for (const a of arquivos) {
    if (vistos.has(a.arquivo)) erros.push(`"${a.arquivo}" aparece duas vezes no manifesto`)
    vistos.add(a.arquivo)
  }
  return { erros, arquivos }
}

// --- Skin do programa (etapa 125 do app) -------------------------------------------------------
// Uma skin é só dados: o arranjo de layout (código do app, escolhido pelo nome), as
// características, o estilo (CSS conferido), imagens e, opcionais, o tema, as molduras, o ícone do
// programa (.ico), o estilo pronto e a abertura. Nada de script nem HTML.

export const ARRANJOS = ['classico', 'foco', 'coluna', 'editor', 'topo']
export const CARACTERISTICAS = ['listasDeConversa', 'mensagensSemAvatar', 'inicioNoLayout']
const CAMPOS_DA_SKIN = ['layout', 'caracteristicas', 'estilo', 'imagens', 'paleta', 'outrosTemas', 'molduras', 'molduraPadrao', 'icone', 'estiloPronto', 'abertura']
/** Temas a mais de uma skin, além da "paleta" (o claro e o escuro da WhatsApp, por exemplo). */
export const MAX_OUTROS_TEMAS = 3
/** Soma de todos os arquivos de uma skin. */
export const LIMITE_DA_SKIN = 60 * 1024 * 1024

const objeto = (v) => !!v && typeof v === 'object' && !Array.isArray(v)
const porcento = (v, max = 100) => v === undefined || (Number.isInteger(v) && v >= 0 && v <= max)

function validarPaleta(p, erros, onde = 'paleta') {
  if (!objeto(p)) return erros.push(`"${onde}" precisa ser um objeto com as cores`)
  if (p.scheme !== 'dark' && p.scheme !== 'light') erros.push(`"${onde}.scheme" precisa ser "dark" ou "light"`)
  for (const c of CORES_OBRIGATORIAS) if (typeof p[c] !== 'string' || !COR.test(p[c])) erros.push(`"${onde}.${c}" precisa ser uma cor como #1E1F22`)
  for (const c of CORES_OPCIONAIS) if (p[c] !== undefined && (typeof p[c] !== 'string' || !COR.test(p[c]))) erros.push(`"${onde}.${c}" precisa ser uma cor como #1E1F22`)
  if (p.glass !== undefined && typeof p.glass !== 'boolean') erros.push(`"${onde}.glass" precisa ser true ou false`)
  if (p.ajustes !== undefined) {
    if (!objeto(p.ajustes)) erros.push(`"${onde}.ajustes" precisa ser um objeto`)
    else
      for (const [k, v] of Object.entries(p.ajustes)) {
        if (!AJUSTES_DA_PALETA.includes(k)) erros.push(`"${onde}.ajustes.${k}" não é um campo conhecido (use ${AJUSTES_DA_PALETA.join(', ')})`)
        else if (typeof v !== 'string' || !COR.test(v)) erros.push(`"${onde}.ajustes.${k}" precisa ser uma cor como #1E1F22 ou #1E1F2280`)
      }
  }
  const conhecidas = new Set(['scheme', 'glass', 'ajustes', ...CORES_OBRIGATORIAS, ...CORES_OPCIONAIS])
  for (const k of Object.keys(p)) if (!conhecidas.has(k)) erros.push(`"${onde}.${k}" não é um campo conhecido`)
}

/** Confere um estilo pronto (o da skin ou o de um dos "outrosTemas"; esses, sem fundo). */
function validarEstiloPronto(e, onde, erros, arquivo) {
  if (!objeto(e)) return erros.push(`"${onde}" precisa ser um objeto`)
  const campos = arquivo ? ['fundo', 'destaque', 'escurecer', 'opacidade', 'desfoque', 'cores', 'descricao'] : ['destaque', 'escurecer', 'opacidade', 'desfoque', 'cores', 'descricao']
  for (const k of Object.keys(e)) if (!campos.includes(k)) erros.push(`"${onde}.${k}" não é um campo conhecido`)
  if (arquivo && e.fundo !== undefined) arquivo(e.fundo, `${onde}.fundo`, 'fundo')
  if (e.destaque !== undefined && (typeof e.destaque !== 'string' || !COR6.test(e.destaque))) erros.push(`"${onde}.destaque" precisa ser #RRGGBB`)
  if (e.descricao !== undefined) texto(e.descricao, `${onde}.descricao`, 200, erros)
  if (!porcento(e.escurecer) || !porcento(e.opacidade) || !porcento(e.desfoque, 20)) erros.push(`"${onde}": escurecer e opacidade vão de 0 a 100, desfoque de 0 a 20`)
  if (e.cores !== undefined && (!Array.isArray(e.cores) || e.cores.length !== 4 || !e.cores.every((c) => typeof c === 'string' && COR6.test(c))))
    erros.push(`"${onde}.cores" precisa ter 4 cores #RRGGBB`)
}

function validarSkin(m, erros, arquivos) {
  const arquivo = (valor, campo, tipo) => {
    const antes = erros.length
    nomeDeArquivo(valor, campo, tipo, erros)
    if (erros.length === antes) arquivos.push({ arquivo: valor, tipo })
  }
  if (typeof m.id === 'string' && m.id.length > 40) erros.push('"id" de uma skin tem até 40 caracteres')
  if (!ARRANJOS.includes(m.layout)) erros.push(`"layout" precisa ser um destes: ${ARRANJOS.join(', ')}`)
  if (m.caracteristicas !== undefined) {
    if (!objeto(m.caracteristicas)) erros.push('"caracteristicas" precisa ser um objeto')
    else
      for (const [k, v] of Object.entries(m.caracteristicas)) {
        if (!CARACTERISTICAS.includes(k)) erros.push(`"caracteristicas.${k}" não é um campo conhecido (use ${CARACTERISTICAS.join(', ')})`)
        else if (typeof v !== 'boolean') erros.push(`"caracteristicas.${k}" precisa ser true ou false`)
      }
  }
  arquivo(m.estilo, 'estilo', 'estilo')
  const imagens = new Set()
  if (m.imagens !== undefined) {
    if (!Array.isArray(m.imagens) || m.imagens.length > 40) erros.push('"imagens" precisa ser uma lista de até 40 arquivos')
    else
      for (const nome of m.imagens) {
        arquivo(nome, 'imagens', 'imagem')
        imagens.add(nome)
      }
  }
  if (m.paleta !== undefined) validarPaleta(m.paleta, erros)
  const molduras = new Set()
  if (m.molduras !== undefined) {
    if (!Array.isArray(m.molduras) || m.molduras.length > 12) erros.push('"molduras" precisa ser uma lista de até 12')
    else
      m.molduras.forEach((f, i) => {
        const onde = (campo) => `"molduras[${i}]${campo ? '.' + campo : ''}"`
        if (!objeto(f)) return erros.push(`${onde()} precisa ser um objeto`)
        if (typeof f.id !== 'string' || !ID.test(f.id) || f.id.length > 24) erros.push(`${onde('id')} inválido`)
        else if (molduras.has(f.id)) erros.push(`${onde('id')} repetido`)
        else molduras.add(f.id)
        texto(f.nome, `molduras[${i}].nome`, 40, erros)
        for (const k of Object.keys(f)) if (!['id', 'nome', 'arquivo', 'cores', 'animada', 'brilho'].includes(k)) erros.push(`${onde(k)} não é um campo conhecido`)
        if (f.arquivo !== undefined) {
          if (f.cores !== undefined) erros.push(`${onde()} usa "arquivo" ou "cores", não os dois`)
          arquivo(f.arquivo, `molduras[${i}].arquivo`, 'moldura')
        } else if (!Array.isArray(f.cores) || f.cores.length < 2 || f.cores.length > 6 || !f.cores.every((c) => typeof c === 'string' && COR6.test(c))) {
          erros.push(`${onde('cores')} precisa ter de 2 a 6 cores #RRGGBB`)
        }
        if (f.animada !== undefined && typeof f.animada !== 'boolean') erros.push(`${onde('animada')} precisa ser true ou false`)
        if (f.brilho !== undefined && typeof f.brilho !== 'boolean') erros.push(`${onde('brilho')} precisa ser true ou false`)
      })
  }
  if (m.molduraPadrao !== undefined && !molduras.has(m.molduraPadrao)) erros.push('"molduraPadrao" precisa ser o id de uma das "molduras"')
  if (m.icone !== undefined) arquivo(m.icone, 'icone', 'icone')
  if (m.estiloPronto !== undefined) {
    if (m.paleta === undefined) erros.push('"estiloPronto" precisa da "paleta" da skin')
    validarEstiloPronto(m.estiloPronto, 'estiloPronto', erros, arquivo)
  }
  if (m.outrosTemas !== undefined) {
    if (m.paleta === undefined) erros.push('"outrosTemas" precisa da "paleta" da skin')
    if (!Array.isArray(m.outrosTemas) || !m.outrosTemas.length || m.outrosTemas.length > MAX_OUTROS_TEMAS)
      erros.push(`"outrosTemas" precisa ser uma lista de 1 a ${MAX_OUTROS_TEMAS} temas`)
    else {
      const ids = new Set()
      m.outrosTemas.forEach((t, i) => {
        const onde = `outrosTemas[${i}]`
        if (!objeto(t)) return erros.push(`"${onde}" precisa ser um objeto`)
        for (const k of Object.keys(t)) if (!['id', 'nome', 'paleta', 'estiloPronto'].includes(k)) erros.push(`"${onde}.${k}" não é um campo conhecido`)
        if (typeof t.id !== 'string' || !ID.test(t.id) || t.id.length > 24) erros.push(`"${onde}.id" inválido`)
        else if (ids.has(t.id)) erros.push(`"${onde}.id" repetido`)
        else ids.add(t.id)
        texto(t.nome, `${onde}.nome`, 40, erros)
        validarPaleta(t.paleta, erros, `${onde}.paleta`)
        if (t.estiloPronto !== undefined) validarEstiloPronto(t.estiloPronto, `${onde}.estiloPronto`, erros, null)
      })
    }
  }
  if (m.abertura !== undefined) {
    const a = m.abertura
    if (!objeto(a)) erros.push('"abertura" precisa ser um objeto')
    else {
      for (const k of Object.keys(a)) if (!['estilo', 'simbolo', 'titulo'].includes(k)) erros.push(`"abertura.${k}" não é um campo conhecido`)
      arquivo(a.estilo, 'abertura.estilo', 'estilo')
      if (a.simbolo !== undefined && !imagens.has(a.simbolo)) erros.push('"abertura.simbolo" precisa ser uma das "imagens"')
      if (a.titulo !== undefined) texto(a.titulo, 'abertura.titulo', 40, erros)
    }
  }
}

/**
 * Confere um estilo (.css) de skin como o app confere antes de usar: até 256 KB; sem @import; sem
 * escapes com barra invertida; url() só para as imagens do próprio pacote (url(pacote:nome.png)) ou
 * embutidas (data:image/); nada de expression, behavior, -moz-binding ou javascript:; nada que
 * feche a tag de estilo. Devolve o problema encontrado, ou undefined se estiver tudo certo.
 */
export function problemaNoEstilo(css, imagens) {
  if (css.length > LIMITES.estilo) return 'passa do tamanho máximo'
  if (/\/\*(?![\s\S]*?\*\/)/.test(css)) return 'há um comentário sem fim'
  const limpo = css.replace(/\/\*[\s\S]*?\*\//g, '')
  if (limpo.includes(String.fromCharCode(92))) return 'usa escapes com barra invertida'
  const minusculo = limpo.toLowerCase()
  if (/@import\b/.test(minusculo)) return 'usa @import'
  if (/<\s*\/?\s*(style|script)/.test(css.toLowerCase())) return 'tenta fechar a tag de estilo'
  if (/expression\s*\(|behavior\s*:|-moz-binding|javascript\s*:/.test(minusculo)) return 'tenta rodar código'
  const enderecos = [...limpo.matchAll(/url\s*\(\s*(['"]?)([^'")]*)\1\s*\)/gi)]
  if (enderecos.length !== (minusculo.match(/url\s*\(/g) ?? []).length) return 'tem um url() que não foi possível conferir'
  for (const e of enderecos) {
    const alvo = e[2].trim()
    if (/^data:image\//i.test(alvo)) continue
    const nome = /^pacote:([a-z0-9-]+\.[a-z0-9]+)$/.exec(alvo)
    if (!nome || !imagens.includes(nome[1])) return `aponta para fora do pacote (${alvo.slice(0, 60)}); use url(pacote:nome.png) com uma das "imagens"`
  }
  return undefined
}

/** Confere se o conteúdo do arquivo é mesmo do formato da extensão (assinatura dos primeiros bytes). */
export function conteudoConfere(ext, b) {
  const ascii = (inicio, fim) => String.fromCharCode(...b.subarray(inicio, fim))
  switch (ext) {
    case 'png': return b[0] === 0x89 && ascii(1, 4) === 'PNG'
    case 'jpg': return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
    case 'gif': return ascii(0, 4) === 'GIF8'
    case 'webp': return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP'
    case 'wav': return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE'
    case 'mp4':
    case 'm4a': return ascii(4, 8) === 'ftyp'
    case 'webm': return b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3
    case 'ogg': return ascii(0, 4) === 'OggS'
    case 'css': {
      const texto = b.toString('utf8')
      return !texto.includes('\u0000') && !texto.includes('\ufffd') && Buffer.from(texto, 'utf8').equals(b)
    }
    case 'ico': return b.length > 6 && b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0
    case 'mp3': return ascii(0, 3) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)
    default: return false
  }
}
