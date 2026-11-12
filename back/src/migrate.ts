import { closePool, ensureSchema } from "./db";

async function main(): Promise<void> {
  const applied = await ensureSchema();
  console.log(
    applied
      ? "[api] schema aplicado com sucesso."
      : "[api] schema nao aplicado: configure o DATABASE_URL."
  );
}

main()
  .catch((error) => {
    console.error("[api] falha ao aplicar o schema:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
