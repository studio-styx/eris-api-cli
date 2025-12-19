# Sumário
- [Instalação](#instalação)
- [Guia para Iniciantes](#guia-para-iniciantes)
- [Inicialização](#inicialização)
- [Rotas principais](#rotas-principais)
  - [Usuário](#usuário-sdkusersgetuserid)
  - [Bot](#bot-sdkbot)
  - [Tryvia](#tryvia-sdktryvia)
  - [Giveaway](#giveaway-sdkgiveawaysgetid)
  - [Transações](#transações-sdktransactionsgetid)
- [Tipos principais](#tipos-principais)
- [Cache interno](#cache-interno)
- [Exemplo completo](#exemplo-completo)
- [Observações](#observações)
- [Contribuição](#contribuição)

# ErisApiSdk
SDK TypeScript/JavaScript para interagir com a API da Eris.
Permite gerenciar usuários, transações, sorteios, saldo do bot e sessões Tryvia.
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
## Guia para Iniciantes
Se você é novo na programação ou no uso de SDKs em JavaScript/TypeScript, esta seção explica o básico para começar. Vamos passo a passo, assumindo que você tem o Node.js instalado (versão >=18) e sabe rodar comandos no terminal.

### Onde Colocar o Código de Inicialização
O código que inicia o SDK (como `new ErisApiSdk(...)`) deve ficar em um arquivo separado, como `index.js` ou `bot.js`. Isso ajuda a organizar seu projeto. Por exemplo:
- Crie uma pasta para o seu projeto (ex: `meu-bot`).
- Dentro dela, crie um arquivo `index.js`.
- No `index.js`, adicione o código de importação e inicialização do SDK, junto com o resto do seu bot (se estiver usando Discord.js).

Não coloque tudo em um só lugar bagunçado – separe em arquivos para facilitar a manutenção.

### Como Importar o SDK
Existem duas formas principais de importar bibliotecas em JavaScript: usando `import` (para módulos ES6, recomendado para projetos modernos) ou `require` (para CommonJS, mais antigo mas ainda comum).

- **Usando `import` (ES Modules)**: Adicione `"type": "module"` no seu `package.json` para habilitar.
  ```ts
  import { ErisApiSdk } from "@studiostyx/erisbot-sdk";
  const sdk = new ErisApiSdk("SEU_TOKEN_AQUI", true); // true para debug
  ```

- **Usando `require` (CommonJS)**: Não precisa mudar o `package.json`.
  ```js
  const { ErisApiSdk } = require("@studiostyx/erisbot-sdk");
  const sdk = new ErisApiSdk("SEU_TOKEN_AQUI", true); // true para debug
  ```

Escolha uma e use consistentemente no seu projeto. Se for TypeScript, compile com `tsc` depois.

### Como Implementar Usando Discord.js
Este SDK é perfeito para bots do Discord, pois lida com guilds, channels e usuários. Você precisa integrar com a biblioteca `discord.js` para criar comandos e interagir com o Discord.

1. **Instale o Discord.js**:
   ```bash
   npm install discord.js
   ```

2. **Exemplo Básico de Bot com SDK**:
   Crie um arquivo `bot.js` (usando `require` para simplicidade). Este exemplo cria um bot que loga no Discord e usa o SDK para dar STX a um usuário via comando slash `/dar-stx`.

   ```js
   const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
   const { ErisApiSdk } = require("@studiostyx/erisbot-sdk");

   const client = new Client({ intents: [GatewayIntentBits.Guilds] });
   const sdk = new ErisApiSdk("TOKEN_DO_SEU_BOT_ERIS", true); // Substitua pelo token real

   client.once('ready', () => {
     console.log(`Bot logado como ${client.user.tag}`);
     
     // Registrar comando slash (faça isso em um servidor de teste)
     const command = new SlashCommandBuilder()
       .setName('dar-stx')
       .setDescription('Dá STX para um usuário')
       .addUserOption(option => option.setName('usuario').setDescription('O usuário').setRequired(true))
       .addIntegerOption(option => option.setName('quantidade').setDescription('Quantidade de STX').setRequired(true));

     client.application.commands.create(command);
   });

   client.on('interactionCreate', async interaction => {
     if (!interaction.isChatInputCommand()) return;

     if (interaction.commandName === 'dar-stx') {
       const user = interaction.options.getUser('usuario');
       const amount = interaction.options.getInteger('quantidade');

       try {
         const userSdk = sdk.users.get(user.id);
         const tx = await userSdk.balance.give({
           guildId: interaction.guildId,
           channelId: interaction.channelId,
           amount: amount,
           reason: "Comando do bot",
           expiresAt: "1m" // Expira em 1 minuto
         });

         const result = await tx.waitForCompletion();
         await interaction.reply(`Transação completada: ${result}`);
       } catch (error) {
         console.error(error);
         await interaction.reply('Erro ao processar a transação.');
       }
     }
   });

   client.login('TOKEN_DO_SEU_BOT_DISCORD'); // Substitua pelo token do Discord
   ```

   - **Explicação**: 
     - O bot loga no Discord com `client.login`.
     - Registra um comando slash `/dar-stx` que usa o SDK para dar STX.
     - Use `node bot.js` para rodar.
     - Para testes, use um bot de desenvolvimento no Discord Developer Portal.

   Se preferir `import` (ES Modules), mude para:
   ```js
   import { Client, GatewayIntentBits, SlashCommandBuilder } from 'discord.js';
   import { ErisApiSdk } from "@studiostyx/erisbot-sdk";
   // ... resto igual
   ```

Dicas para novatos:
- Sempre use `try/catch` para erros, como no exemplo.
- Teste em um servidor privado para evitar problemas.
- Leia a documentação do Discord.js em https://discord.js.org para mais comandos.
- Se algo der errado, ative o debug (`true` no SDK) para ver logs.

---
## Inicialização
```ts
import { ErisApiSdk } from "@studiostyx/erisbot-sdk";
const sdk = new ErisApiSdk("TOKEN_DO_BOT", true); // true ativa debug
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
console.log(result); // "APPROVED" | "CANCELLED" | "EXPIRED" | "DELETED"
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
Consulta informações de sorteios específicos.
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
* `giveaways` – Sorteios recentes.
---
## Exemplo completo
```ts
import { ErisApiSdk } from "@studiostyx/erisbot-sdk";
const sdk = new ErisApiSdk("TOKEN_DO_BOT", true);
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
// Consultar sorteio
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