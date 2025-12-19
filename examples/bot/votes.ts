import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ErisApiSdk, ErisSdkError } from "@studiostyx/erisbot-sdk";

export const data = new SlashCommandBuilder()
    .setName("bot-votes")
    .setDescription("Consulta os votos do bot");

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const sdk = new ErisApiSdk("TOKEN_DO_BOT", true); // true ativa debug
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
        if (error instanceof ErisSdkError) {
            console.error("Erro ao executar a transação:", error);
            await interaction.editReply("Ocorreu um erro ao buscar os meus votos");
        } else {
            console.error("Erro inesperado:", error);
            await interaction.editReply("Ocorreu um erro inesperado.");
        }
    }
}