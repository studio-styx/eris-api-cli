import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ErisApiCli } from "@studiostyx/erisbot-sdk";

export const data = new SlashCommandBuilder()
    .setName("bot-votes")
    .setDescription("Consulta os votos do bot");

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const sdk = new ErisApiCli("TOKEN_DO_BOT", true); // true ativa debug
    await sdk.initCache(); // Inicializa o cache (opcional)

    try {
        await interaction.editReply("Consultando votos do bot...");

        // Consultar votos do bot
        const votes = await sdk.bot.getVotes();
        await interaction.editReply(
            `Total de votos: ${votes.votes}\n` +
            `Últimos votos: ${votes.data.length > 0 ? votes.data.map((v) => `${v.userId} em ${v.createdAt}`).join("\n") : "Nenhum"}`
        );
    } catch (error) {
        console.error("Erro ao consultar votos do bot:", error);
        await interaction.editReply("Ocorreu um erro ao consultar os votos do bot.");
    }
}