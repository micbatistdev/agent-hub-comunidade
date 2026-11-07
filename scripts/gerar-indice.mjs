// Confere todos os pacotes de pacotes/ e gera o catálogo indice.json, que o app lê.
//   node scripts/gerar-indice.mjs            confere e grava o indice.json
//   node scripts/gerar-indice.mjs --conferir só confere (usado nas propostas)
// Sem dependências: só o Node.
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { FORMATO, LIMITE_DA_SKIN, LIMITES, conteudoConfere, problemaNoEstilo, validarManifesto } from './regras.mjs'

const raiz = join(import.meta.dirname, '..')
const pastaPacotes = join(raiz, 'pacotes')
const soConferir = process.argv.includes('--conferir')

const pacotes = []
const problemas = []

for (const pasta of readdirSync(pastaPacotes).sort()) {
  const dir = join(pastaPacotes, pasta)
  if (!statSync(dir).isDirectory()) {
    problemas.push(`pacotes/${pasta}: só pastas ficam em pacotes/`)
    continue
  }
  const caminhoManifesto = join(dir, 'manifesto.json')
  if (!existsSync(caminhoManifesto)) {
    problemas.push(`pacotes/${pasta}: falta o manifesto.json`)
    continue
  }
  let manifesto
  try {
    manifesto = JSON.parse(readFileSync(caminhoManifesto, 'utf8'))
  } catch (e) {
    problemas.push(`pacotes/${pasta}/manifesto.json: JSON inválido (${e.message})`)
    continue
  }
  const { erros, arquivos } = validarManifesto(manifesto, pasta)
  const conferidos = {}
  for (const { arquivo, tipo } of arquivos) {
    if (erros.length) break
    const caminho = join(dir, arquivo)
    if (!existsSync(caminho)) {
      erros.push(`falta o arquivo ${arquivo}`)
      continue
    }
    const bytes = readFileSync(caminho)
    if (bytes.length > LIMITES[tipo]) erros.push(`${arquivo} tem ${(bytes.length / 1048576).toFixed(1)} MB (máximo de ${LIMITES[tipo] / 1048576} MB)`)
    if (!conteudoConfere(arquivo.split('.').pop(), bytes)) erros.push(`${arquivo} não é de verdade um arquivo .${arquivo.split('.').pop()}`)
    // Estilo de uma skin: as mesmas regras que o app confere antes de usar.
    if (tipo === 'estilo' && conteudoConfere('css', bytes)) {
      const problema = problemaNoEstilo(bytes.toString('utf8'), manifesto.imagens ?? [])
      if (problema) erros.push(arquivo + ': o estilo ' + problema)
    }
    conferidos[arquivo] = { sha256: createHash('sha256').update(bytes).digest('hex'), tamanho: bytes.length }
  }
  const soma = Object.values(conferidos).reduce((total, a) => total + a.tamanho, 0)
  if (manifesto.tipo === 'skin' && soma > LIMITE_DA_SKIN) erros.push('a skin tem ' + (soma / 1048576).toFixed(1) + ' MB ao todo (máximo de ' + LIMITE_DA_SKIN / 1048576 + ' MB)')
  // Nada além do manifesto e dos arquivos citados nele.
  const usados = new Set(['manifesto.json', ...arquivos.map((a) => a.arquivo)])
  for (const sobra of readdirSync(dir)) if (!usados.has(sobra)) erros.push(`${sobra} não é usado pelo manifesto (apague ou cite no manifesto)`)

  if (erros.length) {
    for (const e of erros) problemas.push(`pacotes/${pasta}: ${e}`)
    continue
  }
  pacotes.push({ ...manifesto, arquivos: conferidos })
}

if (problemas.length) {
  console.error(`Encontrei ${problemas.length} problema(s):`)
  for (const p of problemas) console.error(`  - ${p}`)
  process.exit(1)
}

console.log(`${pacotes.length} pacote(s) conferido(s).`)
if (!soConferir) {
  const indice = { formato: FORMATO, pacotes }
  writeFileSync(join(raiz, 'indice.json'), JSON.stringify(indice, null, 2) + '\n')
  console.log('indice.json gravado.')
}
