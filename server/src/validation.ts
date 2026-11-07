import { z } from "zod";

const namePattern = /^[^\u0000-\u001f<>]+$/u;

const charKey = z.string().min(1).max(40);
const itemKey = z.string().min(1).max(120);

const wardrobeSchema = z.object({
  owned: z.record(itemKey, z.boolean()).default({}),
  equipped: z.record(charKey, z.string().min(1).max(80)).default({})
});

const armorySchema = z.record(
  charKey,
  z.object({
    cls: z.string().min(1).max(40),
    tier: z.number().int().min(0).max(100),
    owned: z.record(itemKey, z.boolean()).default({})
  })
);

const enchantmentSchema = z.record(
  charKey,
  z.object({
    owned: z.record(itemKey, z.boolean()).default({}),
    enabled: z.boolean().default(true)
  })
);

export const saveSchema = z
  .object({
    version: z.number().int().min(1).max(100).default(1),
    wallet: z.record(charKey, z.number().finite().min(0).max(1_000_000_000_000)).default({}),
    wardrobe: wardrobeSchema.default({ owned: {}, equipped: {} }),
    armory: armorySchema.default({}),
    enchantments: enchantmentSchema.default({}),
    progress: z.record(z.string().max(80), z.unknown()).default({})
  })
  .passthrough();

export type SaveData = z.infer<typeof saveSchema>;

export const accountNameSchema = z
  .string()
  .trim()
  .min(3, "O nome precisa ter entre 3 e 18 caracteres.")
  .max(18, "O nome precisa ter entre 3 e 18 caracteres.")
  .regex(namePattern, "O nome contém caracteres inválidos.")
  .transform((value) => value.replace(/\s+/g, " "));

export const pinSchema = z
  .string()
  .regex(/^\d{4}$/, "A chave de acesso precisa ter exatamente 4 números.");

export const serverSchema = z
  .string()
  .trim()
  .min(3, "Escolha um servidor com 3 a 24 caracteres.")
  .max(24, "Escolha um servidor com 3 a 24 caracteres.")
  .regex(namePattern, "O servidor contém caracteres inválidos.");

export const createAccountSchema = z
  .object({
    name: accountNameSchema,
    pin: pinSchema,
    server: serverSchema,
    save: saveSchema.optional()
  })
  .strict();

export const loginSchema = z
  .object({
    name: accountNameSchema,
    pin: pinSchema
  })
  .strict();

export const updateSaveSchema = z
  .object({
    save: saveSchema
  })
  .strict();

export function emptySave(): SaveData {
  return saveSchema.parse({});
}

export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue ? issue.message : "Dados inválidos.";
}
