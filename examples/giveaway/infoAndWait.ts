import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ErisApiCli } from "@studiostyx/erisbot-sdk";

export const data = new SlashCommandBuilder()
    .setName("giveaway-info")
    .setDescription("Consulta informações de um sorteio")
    .addIntegerOption((option) =>
        option.setName("id").setDescription("ID do sorteio").setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const sdk = new ErisApiCli("TOKEN_DO_BOT", true); // true ativa debug
    await sdk.initCache(); // Inicializa o cache (opcional)

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
        console.error("Erro ao consultar sorteio:", error);
        await interaction.editReply("Ocorreu um erro ao consultar o sorteio.");
    }
}