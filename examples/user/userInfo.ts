import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ErisApiSdk, ErisSdkError } from "@studiostyx/erisbot-sdk";

export const data = new SlashCommandBuilder()
    .setName("user-info")
    .setDescription("Consulta informações de um usuário")
    .addUserOption((option) =>
        option.setName("user").setDescription("Usuário a consultar").setRequired(true)
    );
    
const sdk = new ErisApiSdk("TOKEN_DO_BOT", true);

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const user = interaction.options.getUser("user", true);

    try {
        await interaction.editReply("Consultando informações do usuário...");

        // Obter informações completas de um usuário
        const userInfo = await sdk.users.get(user.id).fetchInfo({
            pets: true,             // Faz com que retorne também os pets do usuário
            company: true           // Faz com que retorne também o emprego do usuário (pode ser null)
        });
        
        await interaction.editReply(
            `Informações do usuário ${user.tag}:\n` +
            `Saldo: ${userInfo.money}\n` +
            `Pets: ${userInfo.pets?.length || 0}\n` +
            `Emprego: ${userInfo.company?.name || "Nenhum"}`
        );
    } catch (error) {
        if (error instanceof ErisSdkError) {
            console.error("Erro ao executar a transação:", error);
            await interaction.editReply("Ocorreu um erro ao buscar informações do usuário.");
        } else {
            console.error("Erro inesperado:", error);
            await interaction.editReply("Ocorreu um erro inesperado.");
        }
    }
}