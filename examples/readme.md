# Exemplos de Uso do ErisApiSdk com Discord.js

Esta pasta contém exemplos práticos de como usar o `@studiostyx/erisbot-sdk` em um bot Discord.js, implementando comandos de slash para interagir com as rotas da API da Eris (usuários, transações, giveaways, saldo do bot e Tryvia).

## Pré-requisitos

1. Instale as dependências necessárias:
   ```bash
   npm install @studiostyx/erisbot-sdk discord.js
   ```
2. Configure um bot Discord.js. Certifique-se de ter:
   - Um token de bot do Discord (obtido no [Discord Developer Portal](https://discord.com/developers)).
   - Um projeto Node.js com TypeScript configurado (Node.js >=18, TypeScript >=5).
   - Ou um projeto Node.js sem TypeScript. (Node.js >=18)
3. Substitua `"TOKEN_DO_BOT"` nos exemplos pelo seu token da API da Eris.
4. Substitua valores fictícios (como IDs de usuário, guild, canal ou giveaway) por valores reais do seu ambiente.

## Como executar os exemplos

1. Crie um bot Discord.js básico com suporte a comandos de slash. Exemplo de configuração mínima:
   ```ts
   import { Client, GatewayIntentBits } from "discord.js";

   const client = new Client({ intents: [GatewayIntentBits.Guilds] });

   client.on("ready", () => console.log("Bot pronto!"));
   client.on("interactionCreate", async (interaction) => {
     if (!interaction.isCommand()) return;
     // Adicione a lógica de comando aqui
   });

   client.login("SEU_TOKEN_DO_DISCORD");
   ```
2. Copie os exemplos para a pasta de comandos do seu bot (ex.: `commands/`).
3. Registre os comandos de slash no Discord
4. Execute o bot com:
   ```bash
   npx ts-node index.ts
   ```
   Ou se for apenas node:
   ```bash
   node index.js
   ```

## Arquivos de exemplo

- `user-balance.ts`: Comando de slash para dar STX a um usuário e aguardar confirmação.
- `user-info.ts`: Comando de slash para consultar informações completas de um usuário.
- `bot-balance.ts`: Comando de slash para consultar o saldo do bot.
- `bot-votes.ts`: Comando de slash para consultar os votos do bot.
- `tryvia-session.ts`: Comando de slash para gerar uma sessão Tryvia e obter questões.
- `giveaway-info.ts`: Comando de slash para consultar e aguardar o término de um giveaway.
- `transaction-status.ts`: Comando de slash para consultar o status de uma transação.

## Observações

- Os exemplos assumem que você tem um bot Discord.js configurado com comandos de slash, que podem ser facilmente adaptados para prefixo.
- Cada arquivo é um comando independente que pode ser registrado via Discord.js.
- O modo `debug: true` está ativado para exibir logs de erro detalhados, Irá retornar um AxiosError.
- Certifique-se de que o bot tem permissões para ler/escrever mensagens no canal onde os comandos são executados.
- Os exemplos usam `CommandInteraction` do `discord.js` para responder aos usuários.

## Importante

> **Esses códigos são apenas exemplos básicos, podem existir meios melhores de fazer cada ação.**
> **Esses códigos são sujeitos a depreciação do discord.js, a atualização dos exemplos dependerá da atualização do sdk.**