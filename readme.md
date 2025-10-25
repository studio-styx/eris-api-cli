# ErisApiSdk

SDK TypeScript/JavaScript para interagir com a API da Eris.  
Permite gerenciar usuários, transações, giveaways, saldo do bot e sessões Tryvia.

---

## Instalação

```bash
npm install @studiostyx/erisbot-sdk
```

ou

```bash
yarn add @studiostyx/erisbot-sdk
```

---

## Inicialização

```ts
import { ErisApiCli } from "@studiostyx/erisbot-sdk";

const sdk = new ErisApiCli("TOKEN_DO_BOT", true); // true ativa debug
await sdk.initCache();
```

---

## Cache

O SDK mantém um cache local para saldo, permissões e giveaways.  
`initCache()` carrega os dados iniciais da API.

```ts
const cacheData = await sdk.initCache();
console.log(cacheData?.money); // saldo do bot
```

---

## Rotas principais

### Usuário (`sdk.users.get(userId)`)

Permite manipular saldo de usuários e consultar informações.

```ts
const user = sdk.users.get("12345");

// Dar STX a um usuário
const tx = await user.balance.give({
  guildId: "456",
  channelId: "123",
  amount: 10,
  reason: "teste",
  expiresAt: "1m"
});

// Esperar confirmação da transação
const result = await tx.waitForCompletion();
console.log(result); // "CONFIRMED" | "CANCELLED" | "EXPIRED" | "DELETED"
```

#### Métodos

* `balance.give(data, throwError?)` – Envia STX do bot para o usuário.
* `balance.receive(data, throwError?)` – Retira STX do usuário.
* `balance.get(throwError?)` – Retorna saldo do usuário.
* `getTransactions(body?, throwError?)` – Lista transações do usuário.
* `fetchInfo(throwError?)` – Retorna informações completas do usuário.

> `throwError` opcional: define se erros retornam `false` ou lançam exceção.

---

### Bot (`sdk.bot`)

Consulta informações do próprio bot autenticado.

```ts
const balance = await sdk.bot.getBalance();
console.log(balance); // número

const votes = await sdk.bot.getVotes();
console.log(votes); // { votes: number, data: VotesData[] }
```

---

### Tryvia (`sdk.tryvia`)

Rotas para criar sessões e obter questões Tryvia.

```ts
// Gerar token de sessão
const session = await sdk.tryvia.getSessionToken();

// Obter questões
const questions = await sdk.tryvia.getTryviaQuestions({
  sessionToken: session.token,
  amount: 5,
  difficulty: "EASY",
  type: "MULTIPLE",
  tags: ["programming"]
});
```

---

### Giveaway (`sdk.giveaways.get(id)`)

Consulta informações de giveaways específicos.

```ts
const giveaway = await sdk.giveaways.get(123);

// Buscar informações atualizadas
const info = await giveaway.fetchInfo();

// Esperar término
const ended = await giveaway.waitForCompletion();
console.log(ended);
```

---

### Transações (`sdk.transactions.get(id)`)

Manipula transações específicas.

```ts
const tx = await sdk.transactions.get(987);

// Atualizar informações
const updated = await tx.fetchInfo();

// Esperar confirmação
const status = await tx.waitForCompletion();
console.log(status); // "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "DELETED"
```

---

## Tipos principais

```ts
import { ErisApiSdkUserTransaction, ErisApiSdkGiveawayInfo, ErisApiSdkUserInfoFull } from "@studiostyx/erisbot-sdk";
```

* `ErisApiSdkUserTransaction` – Detalhes de cada transação.
* `ErisApiSdkGiveawayInfo` – Informações de giveaways.
* `ErisApiSdkUserInfoFull` – Dados completos de um usuário.
* `TakeStxAndGiveStxRequestData` – Formato para enviar/retirar STX.

---

## Cache interno

O SDK usa `CacheRoute` para armazenar:

* `money` – Saldo do bot ou usuário.
* `permissions` – Permissões do bot.
* `giveaways` – Giveaways recentes.

---

## Exemplo completo

```ts
import { ErisApiCli } from "@studiostyx/erisbot-sdk";

const sdk = new ErisApiCli("TOKEN_DO_BOT", true); // true ativa debug
await sdk.initCache();

// Consultar saldo do bot
const balance = await sdk.bot.getBalance();
console.log("Saldo do bot:", balance);

// Dar STX a um usuário
const tx = await sdk.users.get("12345").balance.give({
  guildId: "456",
  channelId: "123",
  amount: 10,
  reason: "teste",
  expiresAt: "1m"
});

// Esperar confirmação
const result = await tx.waitForCompletion();
console.log("Resultado da transação:", result);

// Consultar giveaway
const giveaway = await sdk.giveaways.get(123);
const cachedInfo = giveaway.info; // Informações em cache
const updatedInfo = await giveaway.fetchInfo(); // Atualiza cache
console.log({ cache: cachedInfo, fetched: updatedInfo });
```

---

## Observações

* Todos os métodos que acessam a API utilizam `RequestHelper` para gerenciar permissões, cache e erros.
* Métodos com `throwError = false` retornam `false` em vez de lançar erros, facilitando o uso sem try/catch.
* O modo `debug` habilita logs completos de erros.
* Compatível com Node.js >=18 e TypeScript >=5.

---

## Contribuição

Abra issues ou pull requests no [repositório GitHub](https://github.com/studiostyx/erisbot-sdk).