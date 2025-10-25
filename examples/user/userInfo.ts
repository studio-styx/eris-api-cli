import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ErisApiCli } from "@studiostyx/erisbot-sdk";

export const data = new SlashCommandBuilder()
    .setName("user-info")
    .setDescription("Consulta informações de um usuário")
    .addUserOption((option) =>
        option.setName("user").setDescription("Usuário a consultar").setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const sdk = new ErisApiCli("TOKEN_DO_BOT", true); // true ativa debug
    await sdk.initCache(); // Inicializa o cache (opcional)

    const user = interaction.options.getUser("user", true);

    try {
        await interaction.editReply("Consultando informações do usuário...");

        // Obter informações completas de um usuário
        const userInfo = await sdk.users.get(user.id).fetchInfo();
        await interaction.editReply(
            `Informações do usuário ${user.tag}:\n` +
            `Saldo: ${userInfo.money}\n` +
            `Pets: ${userInfo.pets?.length || 0}\n` +
            `Emprego: ${userInfo.company || "Nenhum"}`
        );
    } catch (error) {
        console.error("Erro ao consultar informações do usuário:", error);
        await interaction.editReply("Ocorreu um erro ao consultar as informações do usuário.");
    }
}