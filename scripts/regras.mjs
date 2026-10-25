// Regras de um pacote da comunidade do Agent Hub.
// As mesmas regras ficam no app (src/main/communityRules.ts do repositório agent-hub):
// se mudar aqui, mude lá também. Pacotes são só dados (cores e mídia), nunca código.

export const FORMATO = 1

export const TIPOS = ['tema', 'fundo', 'moldura', 'som']

/** Tamanho máximo de cada arquivo (o envio pela página do GitHub aceita até 25 MB). */
export const LIMITES = {
  previa: 1 * 1024 * 1024,
  fundo: 25 * 1024 * 1024,
  moldura: 5 * 1024 * 1024,
  som: 5 * 1024 * 1024
}

/** Extensões aceitas por tipo de arquivo. */
export const EXTENSOES = {
  previa: ['png', 'jpg', 'webp', 'gif'],
  fundo: ['png', 'jpg', 'webp', 'gif', 'mp4', 'webm'],
  moldura: ['png', 'webp', 'gif'],
  som: ['mp3', 'wav', 'ogg', 'm4a']
}

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const VERSAO = /^\d{1,3}\.\d{1,3}\.\d{1,3}$/
const COR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const COR6 = /^#[0-9a-fA-F]{6}$/
const ARQUIVO = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(png|jpg|webp|gif|mp4|webm|mp3|wav|ogg|m4a)$/
const CONTROLE = /[\u0000-\u001f\u007f]/

/** Cores obrigatórias e opcionais de um tema (as mesmas do ThemePalette do app). */
export const CORES_OBRIGATORIAS = [
  'rail', 'sidebar', 'main', 'surface', 'text', 'textSecondary', 'textMuted',
  'link', 'accent', 'success', 'warning', 'danger', 'info'
]
export const CORES_OPCIONAIS = ['overlay', 'titlebar', 'accentContrast', 'code', 'scrollbar']

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
    const p = m.paleta
    if (!p || typeof p !== 'object' || Array.isArray(p)) erros.push('"paleta" precisa ser um objeto com as cores')
    else {
      if (p.scheme !== 'dark' && p.scheme !== 'light') erros.push('"paleta.scheme" precisa ser "dark" ou "light"')
      for (const c of CORES_OBRIGATORIAS) if (typeof p[c] !== 'string' || !COR.test(p[c])) erros.push(`"paleta.${c}" precisa ser uma cor como #1E1F22`)
      for (const c of CORES_OPCIONAIS) if (p[c] !== undefined && (typeof p[c] !== 'string' || !COR.test(p[c]))) erros.push(`"paleta.${c}" precisa ser uma cor como #1E1F22`)
      if (p.glass !== undefined && typeof p.glass !== 'boolean') erros.push('"paleta.glass" precisa ser true ou false')
      const conhecidas = new Set(['scheme', 'glass', ...CORES_OBRIGATORIAS, ...CORES_OPCIONAIS])
      for (const k of Object.keys(p)) if (!conhecidas.has(k)) erros.push(`"paleta.${k}" não é um campo conhecido`)
    }
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
  return { erros, arquivos }
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
    case 'mp3': return ascii(0, 3) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)
    default: return false
  }
}
