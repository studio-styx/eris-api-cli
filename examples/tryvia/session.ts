import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ErisApiCli } from "@studiostyx/erisbot-sdk";

export const data = new SlashCommandBuilder()
    .setName("tryvia")
    .setDescription("Inicia uma sessão Tryvia e obtém questões")
    .addIntegerOption((option) =>
        option.setName("amount").setDescription("Quantidade de questões").setRequired(true).setMinValue(1).setMaxValue(10)
    )
    .addStringOption((option) =>
        option.setName("difficulty").setDescription("Dificuldade das questões").setRequired(true)
            .addChoices({ name: "Fácil", value: "EASY" }, { name: "Médio", value: "MEDIUM" }, { name: "Difícil", value: "HARD" })
    );

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const sdk = new ErisApiCli("TOKEN_DO_BOT", true); // true ativa debug
    await sdk.initCache(); // Inicializa o cache (opcional)

    const amount = interaction.options.getInteger("amount", true);
    const difficulty = interaction.options.getString("difficulty") as "EASY" | "MEDIUM" | "HARD";

    try {
        await interaction.editReply("Gerando sessão Tryvia...");

        // Gerar token de sessão
        const session = await sdk.tryvia.getSessionToken();

        await interaction.editReply("Obtendo questões Tryvia...");

        // Obter questões
        const questions = await sdk.tryvia.getTryviaQuestions({
            sessionToken: session.token,
            amount,
            difficulty,
            type: "MULTIPLE",
            tags: ["programming"],
        });

        const questionList = questions.questions.map((q, i) => `${i + 1}. ${q.question}`).join("\n");
        await interaction.editReply(`Questões recebidas:\n${questionList}`);
    } catch (error) {
        console.error("Erro ao gerenciar Tryvia:", error);
        await interaction.editReply("Ocorreu um erro ao obter as questões Tryvia.");
    }
}