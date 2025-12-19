import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ErisApiSdk, ErisSdkError } from "@studiostyx/erisbot-sdk";

export const data = new SlashCommandBuilder()
    .setName("transaction-status")
    .setDescription("Consulta o status de uma transação")
    .addIntegerOption((option) =>
        option.setName("id").setDescription("ID da transação").setRequired(true)
    );
    
const sdk = new ErisApiSdk("TOKEN_DO_BOT", true); // true ativa debug

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();


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
        if (error instanceof ErisSdkError) {
            console.error("Erro ao executar a transação:", error);
            await interaction.editReply("Ocorreu um erro ao processar a transação.");
        } else {
            console.error("Erro inesperado:", error);
            await interaction.editReply("Ocorreu um erro inesperado.");
        }
    }
}