import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ErisApiCli } from "@studiostyx/erisbot-sdk";

export const data = new SlashCommandBuilder()
    .setName("bot-balance")
    .setDescription("Consulta o saldo do bot");

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const sdk = new ErisApiCli("TOKEN_DO_BOT", true); // true ativa debug
    await sdk.initCache(); // Inicializa o cache (opcional)

    try {
        await interaction.editReply("Consultando saldo do bot...");

        // Consultar saldo do bot
        const balance = await sdk.bot.getBalance();
        await interaction.editReply(`Saldo do bot: ${balance} STX`);
    } catch (error) {
        console.error("Erro ao consultar saldo do bot:", error);
        await interaction.editReply("Ocorreu um erro ao consultar o saldo do bot.");
    }
}