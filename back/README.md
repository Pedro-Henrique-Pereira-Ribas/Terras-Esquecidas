# Terra Perdida — API e site

Backend em **TypeScript + Express 5 + Postgres** que guarda contas e o save
completo dos cinco heróis. O mesmo serviço também serve o frontend (a pasta
`front/` do repositório), então o site e a API ficam na mesma origem.

O jogo continua funcionando sem o servidor: o `localStorage` é o cache local
e o fallback quando a API está fora.

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
| `GET` | `/health` | não | Liveness: não toca no banco |
| `GET` | `/api` | não | Informações do serviço |
| `GET` | `/api/health` | não | Readiness: testa o banco |
| `POST` | `/api/accounts` | não | Cria conta + save + sessão |
| `POST` | `/api/accounts/login` | não | Entra e devolve conta + save |
| `POST` | `/api/accounts/logout` | Bearer | Revoga a sessão atual |
| `PUT` | `/api/accounts/password` | Bearer | Troca a chave de acesso da conta |
| `GET` | `/api/me` | Bearer | Conta + save completo |
| `GET` | `/api/me/save` | Bearer | Apenas o save |
| `PUT` | `/api/me/save` | Bearer | Substitui o save completo |

Qualquer rota fora de `/api` devolve o `index.html` do jogo (fallback de single
page app). Rotas `/api` desconhecidas continuam devolvendo JSON com `404`.

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

### Trocar a chave de acesso

```json
{ "currentPin": "1234", "newPin": "8765" }
```

A rota exige a chave atual, então uma sessão roubada sozinha não consegue
trocá-la. Depois da troca, as outras sessões da conta são encerradas — a
sessão que fez a troca continua valendo. A chave antiga deixa de funcionar
na hora, e o login passa a aceitar só a nova.

## Rodar localmente

1. Tenha um Postgres acessível (local, Docker ou a **External Database URL** do Render).
2. Copie `back/.env.example` para `back/.env` e preencha a `DATABASE_URL`.
3. Instale e rode:

```bash
cd back
npm ci
npm run dev
```

A API sobe em `http://localhost:3001` e serve o frontend de `../front` na
mesma porta. O schema é aplicado automaticamente no boot quando
`AUTO_MIGRATE=true` (padrão). Para aplicar manualmente:

```bash
npm run migrate
```

Na raiz do repositório, `npm run dev` sobe a API e um servidor estático do
frontend (em `http://localhost:4173`) juntos.

## Variáveis de ambiente

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | obrigatória | Connection string do Postgres (Neon) |
| `DATABASE_SSL` | `false` | `true` para o Neon e outras conexões externas com TLS |
| `PORT` | `3001` | Porta HTTP (o Render define automaticamente) |
| `HOST` | `0.0.0.0` | Interface de escuta |
| `CORS_ORIGIN` | `*` | Origens permitidas, separadas por vírgula |
| `SESSION_DAYS` | `30` | Validade da sessão em dias |
| `BCRYPT_ROUNDS` | `12` | Custo do bcrypt (4 a 15) |
| `AUTO_MIGRATE` | `true` | Aplica o schema e as migrações ao iniciar |
| `SERVE_FRONT` | `true` | Serve o frontend estático na mesma porta |
| `FRONT_DIR` | automático | Pasta do frontend; vazio = detecta `../front` |
| `TRUST_PROXY` | `1` | Quantidade de proxies confiáveis à frente do app |
| `LOG_LEVEL` | `info` | Log de requisições: `silent`, `info` ou `debug` |

Sem `DATABASE_URL` a API **ainda sobe**: o `/health` responde 200 e o `/api/health`
responde 503 avisando que o banco não foi configurado. Isso evita que o serviço
inteiro saia do ar por causa de uma variável de ambiente faltando.

### Banco no Neon

O projeto usa o Postgres gerenciado do [Neon](https://neon.tech) (plano gratuito),
no projeto **`terra-perdida`**. Pegue a connection string em
**Neon Console → Connection Details → Pooled connection** e use no `DATABASE_URL`:

```text
postgresql://neondb_owner:SENHA@ep-xxxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=verify-full
```

Dois cuidados:

- Use a conexão **Pooled** (o host contém `-pooler`): é ela que aguenta many connections.
- Use `sslmode=verify-full`: o `node-postgres` não implementa `channel_binding=require`,
  que a string padrão do Neon traz e quebraria a autenticação.

O schema é aplicado sozinho no boot (`AUTO_MIGRATE=true`) e as migrações rodam
sem perder as contas já existentes.

Em produção o frontend é servido pela própria API, então as chamadas saem na
mesma origem e o CORS nem é aplicado. O `CORS_ORIGIN` só importa quando o
frontend é servido de outro lugar, como no desenvolvimento local
(`http://localhost:4173`).

## Testes e build

Os testes de integração usam `pg-mem`, então **não precisam de Postgres**:

```bash
cd back
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

A API é publicada como um **Web Service** do Render e o banco é o Postgres do
Neon. O repositório inclui um Blueprint em `render.yaml` que cria:

- **Web Service** `terra-perdida-api` (Node, `rootDir: .`)

O `rootDir` é a **raiz do repositório**, e não `back/`, porque o serviço
também serve a pasta `front/` (o site fica disponível também na URL da API,
como redundância). Por isso os comandos usam `--prefix`:

```yaml
buildCommand: npm --prefix back ci && npm --prefix back run build
startCommand: npm --prefix back start
healthCheckPath: /health
```

Passos:

1. No Render, escolha **New → Blueprint** e conecte este repositório.
2. Confirme a criação do Web Service.
3. Em **Environment**, cole a `DATABASE_URL` do Neon. O Blueprint já deixa
   a variável como `sync: false`, então o Render não sobrescreve o valor.
4. Aguarde o deploy. O health check usa `GET /health`, que não depende do banco.
5. A URL pública do Web Service é `https://terra-perdida-api.onrender.com`.

O site é um **Static Site** separado, com *Publish Path* `.` apontando para a
pasta `front/`. Como as chamadas `/api/*` saem de outra origem, a API precisa
liberar a origem do site em `CORS_ORIGIN`:

```text
https://terras-esquecidas.onrender.com,http://localhost:4173,http://127.0.0.1:4173
```

O `render.yaml` já vem com essa lista. Para publicar tudo na mesma origem
(site servido pela própria API), é só deixar `apiBase` vazio em
`front/js/config.js` e usar a URL do Web Service como endereço do jogo.

O plano gratuito do Render pode hibernar o serviço por inatividade. O primeiro
acesso depois da hibernação pode demorar alguns segundos; o frontend tem timeout
e cai para o save local nesse intervalo.

### Deploy manual (sem Blueprint)

1. Crie um **Web Service** no Render apontando para este repositório.
2. Configure:
   - Root Directory: `/` (a raiz do repositório)
   - Build Command: `npm --prefix back ci && npm --prefix back run build`
   - Start Command: `npm --prefix back start`
   - Health Check Path: `/health`
3. Adicione `DATABASE_URL` (Neon) e `DATABASE_SSL=true`.
4. Adicione `CORS_ORIGIN` com a origem do site.
5. Faça o deploy.

## Segurança

- A chave de 4 dígitos é guardada com bcrypt; nunca é devolvida pela API.
- O token de sessão é aleatório (32 bytes) e o banco guarda só o hash SHA-256.
- Login tem limite por IP e bloqueio temporário por nome após tentativas erradas.
- O corpo JSON é limitado a 256 KB.
- O save é validado com `zod` antes de chegar ao Postgres.
- Erros internos não expõem stack trace para o cliente.
- Não commite `back/.env` nem a `DATABASE_URL`.
