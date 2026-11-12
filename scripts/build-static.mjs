/* ============================================================
   TERRA PERDIDA — monta o site estatico para publicar
   Copia a pasta front/ para _site/, que e o Publish Path do
   Static Site no Render. Funciona sem nenhuma dependencia.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origem = path.join(raiz, "front");
const destino = path.join(raiz, "_site");

const IGNORAR = new Set(["test", "node_modules", ".git"]);

function copiar(De, para) {
  fs.mkdirSync(para, { recursive: true });
  for (const entrada of fs.readdirSync(De, { withFileTypes: true })) {
    if (IGNORAR.has(entrada.name)) continue;
    const de = path.join(De, entrada.name);
    const para2 = path.join(para, entrada.name);
    if (entrada.isDirectory()) {
      copiar(de, para2);
    } else if (entrada.isFile()) {
      fs.copyFileSync(de, para2);
    }
  }
}

if (!fs.existsSync(path.join(origem, "index.html"))) {
  console.error("[build] a pasta front/ nao tem index.html");
  process.exit(1);
}

fs.rmSync(destino, { recursive: true, force: true });
copiar(origem, destino);

// O Render nao precisa do .nojekyll (ele so existia para o GitHub Pages),
// mas deixamos o arquivo: e inofensivo e evita confusao em outro host.
const nojekyll = path.join(destino, ".nojekyll");
if (!fs.existsSync(nojekyll)) {
  fs.writeFileSync(nojekyll, "");
}

const arquivos = [];
(function contar(dir) {
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entrada.isDirectory()) contar(path.join(dir, entrada.name));
    else arquivos.push(entrada.name);
  }
})(destino);

console.log(`[build] site montado em ${destino} (${arquivos.length} arquivos)`);
