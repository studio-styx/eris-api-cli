import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ErisApiSdk, ErisSdkError } from "@studiostyx/erisbot-sdk";

export const data = new SlashCommandBuilder()
    .setName("bot-balance")
    .setDescription("Consulta o saldo do bot");

const sdk = new ErisApiSdk("TOKEN_DO_BOT", true); // true ativa debug

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    try {
        await interaction.editReply("Consultando saldo do bot...");

        // Consultar saldo do bot
        const balance = await sdk.bot.getBalance();
        await interaction.editReply(`Saldo do bot: ${balance} STX`);
    } catch (error) {
        if (error instanceof ErisSdkError) {
            console.error("Erro ao executar a transação:", error);
            await interaction.editReply("Ocorreu um erro ao tentar buscar o meu saldo");
        } else {
            console.error("Erro inesperado:", error);
            await interaction.editReply("Ocorreu um erro inesperado.");
        }
    }
}