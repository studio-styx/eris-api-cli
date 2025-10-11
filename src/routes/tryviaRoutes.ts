import axios from "axios";
import { BASEURL } from "../index.js";

// Tipos base
type TryviaQuestionType = "BOOLEAN" | "MULTIPLE" | "WRITEINCHAT";
type TryviaDifficulty = "EASY" | "MEDIUM" | "HARD";

// Tipo base para as questões
type BaseTryviaQuestion = {
    id: number;
    question: string;
    correctAnswer: string;
    correctAnswersVariation: string[];
    explanation: string;
    incorrectAnswers: string[];
    createdAt: Date;
    updatedAt: Date;
    correct: boolean | null;
};

// Tipos condicionais para as propriedades
type TryviaQuestionWithType<T> = T extends { type: TryviaQuestionType } 
    ? { type: T['type'] } 
    : { type: TryviaQuestionType };

type TryviaQuestionWithDifficulty<T> = T extends { difficulty: TryviaDifficulty } 
    ? { difficulty: T['difficulty'] } 
    : { difficulty: TryviaDifficulty };

type TryviaQuestionWithTags<T> = T extends { tags: string[] } 
    ? { tags: string[] } 
    : { tags: string[] };

// Tipo final da questão baseado nos parâmetros
type TryviaQuestionsResponseData<T extends object = {}> = BaseTryviaQuestion &
    TryviaQuestionWithType<T> &
    TryviaQuestionWithDifficulty<T> &
    TryviaQuestionWithTags<T>;

// Tipo da resposta completa
type TryviaResponseGeneric<T extends object = {}> = {
    warnings: string[];
    questions: TryviaQuestionsResponseData<T>[];
};

/**
 * Rotas relacionadas ao Tryvia (quiz da Éris).
 * Permite gerar sessão de quiz e obter perguntas filtradas por tags, tipo e dificuldade.
 * 
 * @example
 * ```ts
 * const tryvia = new TryviaRoutes("TOKEN");
 * 
 * // Gerar token de sessão
 * const session = await tryvia.getSessionToken();
 * console.log(session.token, session.expiresIn);
 * 
 * // Obter perguntas do quiz
 * const questions = await tryvia.getTryviaQuestions({
 *   sessionToken: session.token,
 *   tags: ["cats", "history"],
 *   difficulty: "MEDIUM",
 *   amount: 5,
 *   type: "MULTIPLE"
 * });
 * console.log(questions.questions);
 * ```
 */
export class TryviaRoutes {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    /**
     * Gera um token de sessão válido por 6 horas para o Tryvia.
     * 
     * @returns Objeto com `token` e `expiresIn` (tempo em segundos).
     */
    public async getSessionToken() {
        const response = await axios.get(`${BASEURL}/tryvia/generateToken`);
        return response.data as { token: string; expiresIn: 21600 };
    }

    /**
     * Obtém perguntas do Tryvia, podendo filtrar por sessão, tags, tipo, dificuldade e quantidade.
     * 
     * @example
     * ```ts
     * const questions = await tryvia.getTryviaQuestions({
     *   sessionToken: "abcdef",
     *   tags: ["history"],
     *   difficulty: "HARD",
     *   amount: 3,
     *   type: "BOOLEAN"
     * });
     * console.log(questions.questions);
     * ```
     * 
     * @param data Opções de filtro.
     * @param data.sessionToken Token de sessão válido.
     * @param data.tags Tags para filtrar questões.
     * @param data.difficulty Dificuldade da questão.
     * @param data.amount Quantidade de questões.
     * @param data.type Tipo da questão.
     * @returns Objeto com `warnings` e array de questões.
     */
    public async getTryviaQuestions<T extends {
        sessionToken?: string;
        tags?: string[];
        difficulty?: TryviaDifficulty;
        amount?: number;
        type?: TryviaQuestionType;
    }>(data?: T) {
        const url = new URL(`${BASEURL}/tryvia/questions`);
        
        if (data?.sessionToken) url.searchParams.append("sessionToken", data.sessionToken);
        if (data?.tags) url.searchParams.append("tags", data.tags.join("+"));
        if (data?.difficulty) url.searchParams.append("difficulty", data.difficulty);
        if (data?.amount) url.searchParams.append("amount", data.amount.toString());
        if (data?.type) url.searchParams.append("type", data.type);

        const response = await axios.get(url.toString(), {
            headers: {
                Authorization: this.token
            },
        });

        return response.data as TryviaResponseGeneric<T>;
    }
}