/* ============================================================
   TERRA PERDIDA — sobe a API e o frontend juntos, em dev
   ============================================================ */
import { spawn } from "node:child_process";
import process from "node:process";
import { startStaticServer } from "./static-server.mjs";

const isWindows = process.platform === "win32";
const API_PORT = Number(process.env.API_PORT) || 3001;
const FRONT_PORT = Number(process.env.FRONT_PORT) || 4173;

const apiTask = {
  name: "back",
  color: "\u001b[36m",
  // A API sobe com watch, para reiniciar quando o codigo muda.
  command: "npm --prefix back run dev"
};

const children = [];

function prefix(task, chunk) {
  return chunk
    .toString()
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => `${task.color}[${task.name}]\u001b[0m ${line}`)
    .join("\n");
}

let closing = false;

function shutdown(code) {
  if (closing) return;
  closing = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

function spawnApi() {
  // No Windows o comando roda pelo cmd.exe: o Node nao consegue executar
  // npm.cmd diretamente (spawn EINVAL) e o shell:true concatena os
  // argumentos sem escapar, o que dispara aviso de depreciacao.
  const command = isWindows ? "cmd.exe" : "/bin/sh";
  const args = isWindows ? ["/d", "/s", "/c", apiTask.command] : ["-c", apiTask.command];

  const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
  children.push(child);
  child.stdout.on("data", (chunk) => console.log(prefix(apiTask, chunk)));
  child.stderr.on("data", (chunk) => console.error(prefix(apiTask, chunk)));
  child.on("exit", (code) => {
    console.log(`${apiTask.color}[${apiTask.name}]\u001b[0m encerrou com codigo ${code}`);
    shutdown(code ?? 0);
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

spawnApi();
startStaticServer("front", FRONT_PORT);

console.log(
  `\u001b[32m[dev]\u001b[0m API em http://localhost:${API_PORT} e frontend em http://localhost:${FRONT_PORT}`
);
