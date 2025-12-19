import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ErisApiSdk, ErisSdkError } from "@studiostyx/erisbot-sdk";

export const data = new SlashCommandBuilder()
    .setName("give-stx")
    .setDescription("Dá STX a um usuário")
    .addUserOption((option) =>
        option.setName("user").setDescription("Usuário para ver quantos stx tem").setRequired(false)
    )

const sdk = new ErisApiSdk("TOKEN_DO_BOT", true);

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const user = interaction.options.getUser("user") || interaction.user;

    try {
        await interaction.editReply(`Verificando o saldo de ${user.displayName}`);

        // Ver quantos stx tem o usuário
        const userBalance = sdk.users.get(user.id).balance.get(); // Ou sdk.users.get(user.id).getBalance();

        /*
            Essa rota retorna apenas o saldo atual do usuário.
            Se quiser dar ou retirar STX, use os métodos give() e receive() na rota balance.
        */

        await interaction.editReply(
            `O saldo de: ${user.displayName} saldo é: ${userBalance}`
        );
    } catch (error) {
        if (error instanceof ErisSdkError) {
            console.error("Erro ao executar a transação:", error);
            await interaction.editReply("Ocorreu um erro ao processar seu saldo");
        } else {
            console.error("Erro inesperado:", error);
            await interaction.editReply("Ocorreu um erro inesperado.");
        }
    }
}