/**
 * Promove uma conta a administrador.
 *
 * Uso: npm run promote -- "Nome" "email@exemplo.com"
 *
 * O primeiro admin precisa ser promotes por aqui: pela API so quem ja e
 * admin pode promover alguem. Depois disso, o painel /admin cuida do resto.
 */
import { getConfig } from "./config";
import { closePool, getPool, hasDatabase } from "./db";
import { normalizeEmail, normalizeName } from "./security";
import { findAccountByNameKey, updateAccountAccess } from "./repository";

async function main(): Promise<void> {
  getConfig();
  if (!hasDatabase()) {
    console.error("DATABASE_URL nao configurada.");
    process.exitCode = 1;
    return;
  }

  const [nameArg, emailArg] = process.argv.slice(2);
  if (!nameArg || !emailArg) {
    console.error('Uso: npm run promote -- "Nome" "email@exemplo.com"');
    process.exitCode = 1;
    return;
  }

  const pool = getPool();
  const nameKey = normalizeName(nameArg);
  const account = await findAccountByNameKey(pool, nameKey);
  if (!account) {
    console.error(`Nao achei a conta "${nameArg}".`);
    process.exitCode = 1;
    return;
  }

  const email = String(emailArg).trim();
  const emailKey = normalizeEmail(email);
  await updateAccountAccess(pool, nameKey, email, emailKey, true);

  console.log(`"${account.name}" agora e admin e entra no painel com ${email}.`);
  await closePool();
}

main().catch(async (error) => {
  console.error("[admin] falha ao promover a conta:", error);
  await closePool().catch(() => undefined);
  process.exit(1);
});
