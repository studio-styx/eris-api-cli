import { SlashCommandBuilder, CommandInteraction, userMention } from "discord.js";
import { ErisApiCli } from "@studiostyx/erisbot-sdk";

export const data = new SlashCommandBuilder()
    .setName("take-stx")
    .setDescription("Retira STX de um usuário")
    .addUserOption((option) =>
        option.setName("user").setDescription("Usuário que terá STX retirado").setRequired(true)
    )
    .addIntegerOption((option) =>
        option.setName("amount").setDescription("Quantidade de STX").setRequired(true).setMinValue(1)
    )
    .addStringOption((option) =>
        option.setName("reason").setDescription("Motivo da transação").setRequired(false)
    )
    .addStringOption((option) =>
        option
            .setName("expires")
            .setDescription("Tempo para confirmar a transação")
            .setRequired(false)
            .addChoices(
                { name: "1 minuto", value: "1m" },
                { name: "5 minutos", value: "5m" },
                { name: "10 minutos", value: "10m" },
                { name: "1 hora", value: "1h" }
            )
    );

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const sdk = new ErisApiCli("TOKEN_DO_BOT", true); // true ativa debug
    await sdk.initCache(); // Inicializa o cache (opcional)

    const user = interaction.options.getUser("user", true);
    const amount = interaction.options.getInteger("amount", true);
    const reason = interaction.options.getString("reason") || "Retirada via comando";
    const expiresAt = interaction.options.getString("expires") || "1m";

    if (!interaction.guildId || !interaction.channelId) {
        await interaction.editReply("Este comando só pode ser usado em um servidor!");
        return;
    }

    try {
        await interaction.editReply("Iniciando transação de retirada...");

        // Retirar STX de um usuário
        const tx = await sdk.users.get(user.id).balance.receive({
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            amount,
            reason,
            expiresAt,
        });

        await interaction.editReply(
            `Transação de retirada criada! ${userMention(user.id)}, por favor confirme a transação clicando no botão na mensagem enviada pela Éris.`
        );

        // Esperar confirmação
        const result = await tx.waitForCompletion();
        await interaction.editReply(
            `Transação de retirada ${result === "APPROVED" ? "aprovada" : "não aprovada"} para <@${user.id}>!`
        );
    } catch (error) {
        console.error("Erro ao executar a transação de retirada:", error);
        await interaction.editReply("Ocorreu um erro ao processar a transação de retirada. Verifique o token ou os parâmetros.");
    }
}