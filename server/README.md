# Terra Perdida — API de contas e saves

API em **TypeScript + Express 5 + Postgres** para guardar contas e o save completo
dos cinco heróis. O jogo continua funcionando sem ela: o `localStorage` é o cache
local e o fallback quando o servidor está fora.

## Stack

- Node.js 20+
- TypeScript
- Express 5
- Postgres (`pg`)
- `zod` para validar contas e saves
- `bcryptjs` para o hash da chave de 4 dígitos
- Sessões com token aleatório; o banco guarda apenas o SHA-256 do token

## Endpoints

| Método | Rota | Autenticação | O que faz |
| --- | --- | --- | --- |
| `GET` | `/health` | não | Health check usado pelo Render |
| `GET` | `/api/health` | não | Health check com teste do banco |
| `POST` | `/api/accounts` | não | Cria conta + save + sessão |
| `POST` | `/api/accounts/login` | não | Entra e devolve conta + save |
| `POST` | `/api/accounts/logout` | Bearer | Revoga a sessão atual |
| `GET` | `/api/me` | Bearer | Conta + save completo |
| `GET` | `/api/me/save` | Bearer | Apenas o save |
| `PUT` | `/api/me/save` | Bearer | Substitui o save completo |

### Corpo do cadastro

```json
{
  "name": "Pedro",
  "pin": "1234",
  "server": "Reino Sem Nome",
  "save": {
    "version": 1,
    "wallet": { "guerreiro": 1250 },
    "wardrobe": {
      "owned": { "guerreiro:imperial": true },
      "equipped": { "guerreiro": "imperial" }
    },
    "armory": {
      "guerreiro": {
        "cls": "espada",
        "tier": 2,
        "owned": { "espada:0": true, "espada:1": true, "espada:2": true }
      }
    },
    "enchantments": {
      "guerreiro": { "owned": { "lamina_vidro": true }, "enabled": true }
    },
    "progress": {}
  }
}
```

O campo `save` é opcional no cadastro. O login devolve:

```json
{
  "token": "token-opaco-gerado-no-servidor",
  "account": {
    "id": "uuid",
    "name": "Pedro",
    "server": "Reino Sem Nome",
    "createdAt": "2026-01-01T12:00:00.000Z",
    "lastLoginAt": "2026-01-02T12:00:00.000Z"
  },
  "save": { "version": 1, "wallet": {}, "wardrobe": {}, "armory": {}, "enchantments": {}, "progress": {} },
  "saveUpdatedAt": "2026-01-02T12:00:00.000Z"
}
```

Use o token em todas as rotas protegidas:

```http
Authorization: Bearer <token>
```

## Rodar localmente

1. Tenha um Postgres acessível (local, Docker ou a **External Database URL** do Render).
2. Copie `server/.env.example` para `server/.env` e preencha a `DATABASE_URL`.
3. Instale e rode:

```bash
cd server
npm ci
npm run dev
```

A API sobe em `http://localhost:3001`. O schema é aplicado automaticamente no boot
quando `AUTO_MIGRATE=true` (padrão). Para aplicar manualmente:

```bash
npm run migrate
```

## Variáveis de ambiente

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | obrigatória | Connection string do Postgres |
| `DATABASE_SSL` | `false` | `true` para conexões externas que exigem SSL |
| `PORT` | `3001` | Porta HTTP (o Render define automaticamente) |
| `HOST` | `0.0.0.0` | Interface de escuta |
| `CORS_ORIGIN` | `*` | Origens permitidas, separadas por vírgula |
| `SESSION_DAYS` | `30` | Validade da sessão em dias |
| `BCRYPT_ROUNDS` | `12` | Custo do bcrypt (4 a 15) |
| `AUTO_MIGRATE` | `true` | Aplica o schema ao iniciar |

Em produção, configure `CORS_ORIGIN` com a URL do GitHub Pages, por exemplo:

```text
https://pedro-henrique-pereira-ribas.github.io
```

Para desenvolvimento local, inclua também `http://localhost:4173` e
`http://127.0.0.1:4173`.

## Testes e build

Os testes de integração usam `pg-mem`, então **não precisam de Postgres**:

```bash
cd server
npm test
npm run typecheck
npm run build
```

Na raiz do repositório também existem atalhos:

```bash
npm run api:install
npm run api:dev
npm run api:test
npm run api:typecheck
npm run api:build
npm run api:start
```

## Deploy no Render

O repositório inclui um Blueprint em `render.yaml` que cria:

- **Web Service** `terra-perdida-api` (Node, `rootDir: server`)
- **Postgres** `terra-perdida-db`

Passos:

1. No Render, escolha **New → Blueprint** e conecte este repositório.
2. Confirme a criação dos dois recursos.
3. Aguarde o deploy. O health check usa `GET /health`.
4. Copie a URL pública do Web Service, por exemplo
   `https://terra-perdida-api.onrender.com`.
5. Se a URL for diferente, ajuste `apiBase` em `js/config.js`.
6. Confira se `CORS_ORIGIN` contém a origem do GitHub Pages.

O plano gratuito do Render pode hibernar o serviço por inatividade. O primeiro
acesso depois da hibernação pode demorar alguns segundos; o frontend tem timeout
e cai para o save local nesse intervalo.

### Deploy manual (sem Blueprint)

1. Crie um **Postgres** no Render e copie a **Internal Database URL**.
2. Crie um **Web Service** com:
   - Root Directory: `server`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Health Check Path: `/health`
3. Adicione `DATABASE_URL` com a URL interna e `DATABASE_SSL=false`.
4. Adicione `CORS_ORIGIN` com a origem do site.
5. Faça o deploy.

## Segurança

- A chave de 4 dígitos é guardada com bcrypt; nunca é devolvida pela API.
- O token de sessão é aleatório (32 bytes) e o banco guarda só o hash SHA-256.
- Login tem limite por IP e bloqueio temporário por nome após tentativas erradas.
- O corpo JSON é limitado a 256 KB.
- O save é validado com `zod` antes de chegar ao Postgres.
- Erros internos não expõem stack trace para o cliente.
- Não commite `server/.env` nem a `DATABASE_URL`.
