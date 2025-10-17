# ErisApiCli

SDK TypeScript/JavaScript para interagir com a API da Eris.  
Permite gerenciar usuários, transações, giveaways, saldo do bot e sessões Tryvia.

---

## Instalação

```bash
npm install @studiostyx/erisbot-cli
````

ou

```bash
yarn add @studiostyx/erisbot-cli
```

---

## Inicialização

```ts
import ErisApiCli from "@studiostyx/erisbot-cli";

const cli = new ErisApiCli("TOKEN_DO_BOT", true); // true ativa debug
await cli.initCache();
```

---

## Cache

O SDK mantém um cache local para permissões, saldo e giveaways.
`initCache()` carrega dados iniciais da API.

```ts
const cacheData = await cli.initCache();
console.log(cacheData.money); // saldo do bot
```

---

## Rotas principais

### Usuário (`cli.user(userId)`)

Permite manipular saldo de usuários e consultar informações:

```ts
const user = cli.user("12345");

// Dar STX a um usuário
const tx = await user.giveStx({
  guildId: "456",
  channelId: "123",
  amount: 10,
  reason: "teste",
  expiresAt: "1m"
});

// Esperar confirmação da transação
const result = await tx.waitForConfirmation();
console.log(result); // "CONFIRMED" | "CANCELLED" | "EXPIRED"
```

#### Métodos

* `giveStx(data, throwError?)` – Envia STX do bot para o usuário.
* `takeStx(data, throwError?)` – Retira STX do usuário.
* `balance(throwError?)` – Retorna saldo do usuário.
* `transactions(body?, throwError?)` – Lista transações do usuário.
* `fetchInfo(throwError?)` – Retorna informações completas do usuário.

> `throwError` opcional: define se erros retornam `false` ou lançam exceção.

---

### Me (`cli.me`)

Para consultar informações do próprio bot/usuário autenticado.

```ts
const balance = await cli.me.balance();
console.log(balance); // número

const votes = await cli.me.votes();
console.log(votes); // { votes: number, data: VotesData[] }
```

---

### Tryvia (`cli.tryvia`)

Rotas para criar sessões e pegar questões Tryvia.

```ts
// Gerar token de sessão
const session = await cli.tryvia.getSessionToken();

// Pegar questões
const questions = await cli.tryvia.getTryviaQuestions({
  sessionToken: session.token,
  amount: 5,
  difficulty: "EASY",
  type: "MULTIPLE",
  tags: ["programming"]
});
```

---

### Giveaway (`cli.giveaway(id)`)

Rotas para consultar giveaways específicos.

```ts
const giveaway = await cli.giveaway(123);

// Buscar info atualizada
const info = await giveaway.fetchInfo();

// Esperar término
const ended = await giveaway.waitForEnd();
console.log(ended);
```

---

### Transações (`cli.transaction(id)`)

Permite manipular transações específicas.

```ts
const tx = await cli.transaction(987);

// Atualizar informações da transação
const updated = await tx.fetchInfo();

// Esperar confirmação
const status = await tx.waitForConfirmation();
console.log(status); // "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "DELETED"
```

---

## Tipos principais

```ts
import { UserTransaction, ErisCliGiveawayInfo } from "@studiostyx/erisbot-cli";
```

* `UserTransaction` – detalhes de cada transação.
* `ErisCliGiveawayInfo` – informações de giveaways.
* `UserInfoFull` – dados completos de um usuário.
* `TakeStxAndGiveStxRequestData` – formato para enviar/retirar STX.

---

## Cache interno

A SDK usa `CacheRoute` para armazenar:

* `money` – saldo do bot ou usuário.
* `permissions` – permissões do bot.
* `giveaways` – giveaways recentes.

---

## Exemplo completo

```ts
const cli = new ErisApiCli("TOKEN_DO_BOT", true); // true serve para ativar o debug
await cli.initCache();

// Consultar saldo
const balance = await cli.me.balance();
console.log("Saldo do bot:", balance);

// Dar STX a um usuário
const tx = await cli.user("12345").giveStx({
  guildId: "456",
  channelId: "123",
  amount: 10,
  reason: "teste",
  expiresAt: "1m"
});

// Esperar confirmação
const result = await tx.waitForConfirmation();
console.log("Resultado da transação:", result);

// Consultar giveaway
const giveaway = await cli.giveaway(123);
const cachedInformation = giveaway.info; // São as informações do sorteio baseadas no momento que cli.giveaway foi iniciada
const atualizedInformation = await giveaway.fetchInfo(); // também atualiza no cache
console.log({ cache: cachedInformation, fetched: atualizedInformation });
```

---

## Observações

* Todos os métodos que acessam a API usam `RequestHelper`, garantindo checagem de permissões, cache e tratamento de erros.
* Métodos que retornam `false` ao invés de lançar erro podem ser utilizados para evitar try/catch em massa.
* `debug` habilita log completo de erros.

---

## Contribuição

Abra issues ou pull requests no GitHub.
Compatível com Node.js >=18 e TypeScript >=5.

