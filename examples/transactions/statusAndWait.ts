import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ErisApiCli } from "@studiostyx/erisbot-sdk";

export const data = new SlashCommandBuilder()
    .setName("transaction-status")
    .setDescription("Consulta o status de uma transação")
    .addIntegerOption((option) =>
        option.setName("id").setDescription("ID da transação").setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const sdk = new ErisApiCli("TOKEN_DO_BOT", true); // true ativa debug
    await sdk.initCache(); // Inicializa o cache (opcional)

    const transactionId = interaction.options.getInteger("id", true);

    try {
        await interaction.editReply("Consultando transação...");

        // Consultar transação
        const tx = await sdk.transactions.get(transactionId);
        const txInfo = await tx.fetchInfo();
        await interaction.editReply(
            `Transação ${transactionId}:\n` +
            `Status: ${txInfo.status}\n` +
            `Criada em: ${txInfo.createdAt}`
        );

        // Aguardar confirmação, se pendente
        if (txInfo.status === "PENDING") {
            await interaction.editReply("Aguardando confirmação da transação...");
            const status = await tx.waitForCompletion();
            await interaction.editReply(`Status final da transação: ${status}`);
        }
    } catch (error) {
        console.error("Erro ao consultar transação:", error);
        await interaction.editReply("Ocorreu um erro ao consultar a transação.");
    }
}