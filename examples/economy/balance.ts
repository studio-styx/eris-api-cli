import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ErisApiCli } from "@studiostyx/erisbot-sdk";

export const data = new SlashCommandBuilder()
    .setName("give-stx")
    .setDescription("Dá STX a um usuário")
    .addUserOption((option) =>
        option.setName("user").setDescription("Usuário que receberá STX").setRequired(true)
    )
    .addIntegerOption((option) =>
        option.setName("amount").setDescription("Quantidade de STX").setRequired(true).setMinValue(1)
    )
    .addStringOption((option) =>
        option.setName("reason").setDescription("Motivo da transação").setRequired(false)
    );

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const sdk = new ErisApiCli("TOKEN_DO_BOT", true); // true ativa debug
    await sdk.initCache(); // Inicializa o cache (opcional)

    const user = interaction.options.getUser("user", true);
    const amount = interaction.options.getInteger("amount", true);
    const reason = interaction.options.getString("reason") || "Transação via comando";

    try {
        await interaction.editReply("Iniciando transação...");

        // Dar STX a um usuário
        const tx = await sdk.users.get(user.id).balance.give({
            guildId: interaction.guildId!,
            channelId: interaction.channelId,
            amount,
            reason,
            expiresAt: "1m",
        });

        await interaction.editReply(
            "Transação criada! Por favor, confirme a transação clicando no botão na mensagem enviada pela Éris."
        );

        // Esperar confirmação
        const result = await tx.waitForCompletion();
        await interaction.editReply(`Transação ${result === "APPROVED" ? "aprovada" : "não aprovada"}!`);
    } catch (error) {
        console.error("Erro ao executar a transação:", error);
        await interaction.editReply("Ocorreu um erro ao processar a transação.");
    }
}