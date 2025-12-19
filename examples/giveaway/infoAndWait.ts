import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ErisApiSdk, ErisSdkError } from "@studiostyx/erisbot-sdk";

export const data = new SlashCommandBuilder()
    .setName("giveaway-info")
    .setDescription("Consulta informações de um sorteio")
    .addIntegerOption((option) =>
        option.setName("id").setDescription("ID do sorteio").setRequired(true)
    );

const sdk = new ErisApiSdk("TOKEN_DO_BOT", true); // true ativa debug

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();


    const giveawayId = interaction.options.getInteger("id", true);

    try {
        await interaction.editReply("Consultando informações sorteio giveaway...");

        // Consultar giveaway
        const giveaway = await sdk.giveaways.get(giveawayId);
        const cachedInfo = giveaway.info;
        await interaction.editReply(
            `Informações do sorteio ${giveawayId}:\n` +
            `Finalizado: ${cachedInfo.ended ? "Sim" : "Não"}\n` +
            `Expira em: ${cachedInfo.expiresAt}`
        );

        // Aguardar término do giveaway
        if (!cachedInfo.ended) {
            await interaction.editReply("Aguardando término do sorteio...");
            const finalState = await giveaway.waitForCompletion();
            await interaction.editReply(`Sorteio finalizado: ${finalState.ended ? "Sim" : "Não"}`);
        }
    } catch (error) {
        if (error instanceof ErisSdkError) {
            console.error("Erro ao executar a transação:", error);
            await interaction.editReply("Ocorreu um erro ao processar o sorteio.");
        } else {
            console.error("Erro inesperado:", error);
            await interaction.editReply("Ocorreu um erro inesperado.");
        }
    }
}