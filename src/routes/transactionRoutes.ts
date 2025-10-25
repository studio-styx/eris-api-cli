import { ErisApiSdkTransactionStatus, ErisApiSdkUserTransaction } from "../types.js";
import { BASEURL, ErisSdkError } from "../index.js";
import { CacheRoute } from "../cache.js";
import { RequestHelper } from "../helpers/requestHelper.js";

/**
 * Rotas para uma transação específica.
 * Permite consultar informações atualizadas e aguardar confirmação.
 *
 * @example
 * ```ts
 * const tx = new TransactionRoute(token, transactionData);
 * 
 * // Atualiza informações da transação
 * const info = await tx.fetchInfo();
 * console.log(info.status);
 * 
 * // Aguarda até que a transação seja confirmada, cancelada ou expirado
 * const result = await tx.waitForConfirmation();
 * console.log(result); // "CONFIRMED" | "CANCELLED" | "EXPIRED" | "DELETED"
 * ```
 */
export class TransactionRoute {
    private transaction: ErisApiSdkUserTransaction;
    private cache: CacheRoute;
    private helper: RequestHelper;

    constructor(token: string, transaction: ErisApiSdkUserTransaction, cache?: CacheRoute, debug = false) {
        this.transaction = transaction;
        this.cache = cache ?? new CacheRoute();
        this.helper = new RequestHelper(token, debug);
    }

    /** Retorna informações atuais da transação em cache */
    get info() {
        return this.transaction;
    }

    /**
     * Atualiza as informações da transação na API.
     * 
     * @returns Informações normalizadas da transação.
     * @throws {Error} Se não houver permissão de leitura.
     */
    public async fetchInfo(): Promise<ErisApiSdkUserTransaction> {
        const data = await this.helper.send<{ data: ErisApiSdkUserTransaction }>(
            {
                url: `${BASEURL}/transaction/${this.transaction.id}`,
                method: "GET",
            },
            "ECONOMY.READ",
            this.cache
        );

        const normalized: ErisApiSdkUserTransaction = {
            ...data.data,
            expiresAt: data.data.expiresAt ? new Date(data.data.expiresAt) : null,
            createdAt: new Date(data.data.createdAt),
            updatedAt: new Date(data.data.updatedAt),
        };

        this.transaction = normalized;
        return normalized;
    }

    /**
         * Aguarda a confirmação de uma transação pendente.
         * 
         * @example
         * ```ts
         * const cli = new ErisApiCli(token);
         * 
         * // Cria uma transação para enviar STX a outro usuário
         * const tx = await cli.users.get("12345").balance.give({
         *   amount: 10,
         *   channelId: "123",
         *   guildId: "456",
         *   reason: "test",
         *   expiresAt: "1m"
         * });
         * 
         * // Aguarda até que o usuário confirme ou o tempo expire
         * const result = await tx.waitForCompletion();
         * 
         * console.log(result); // "CONFIRMED" | "CANCELLED" | "EXPIRED"
         * ```
         *
         * @throws {Error} Se a transação não estiver pendente ou já tiver expirado.
         * @returns {Promise<"PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "DELETED">}
     */
    /** Aguarda confirmação da transação, com timeout baseado no expiresAt */
    public async waitForCompletion(): Promise<ErisApiSdkTransactionStatus | "DELETED">;
    public async waitForCompletion(throwsIfResultsIsNotApproved: boolean): Promise<ErisApiSdkTransactionStatus | "DELETED">;
    public async waitForCompletion(throwsIfResultsIsNotApproved = false): Promise<ErisApiSdkTransactionStatus | "DELETED"> {
        const tx = this.transaction;

        if (tx.status !== "PENDING")
            throw new ErisSdkError("TRANSACTION_NOT_PENDING" ,`Transaction must be "PENDING" to wait`);
        if (!tx.expiresAt)
            throw new ErisSdkError("TRANSACTION_ERROR" ,`Transaction expiresAt cannot be infinity`);
        if (tx.expiresAt < new Date())
            throw new ErisSdkError("TRANSACTION_ERROR" ,`Transaction is already expired`);

        // Se expira em menos de 5 minutos, usa rota especial
        const expiresSoon = new Date(tx.expiresAt).getTime() - Date.now() <= 5 * 60 * 1000;

        if (expiresSoon) {
            const res = await this.helper.send<{ status: ErisApiSdkTransactionStatus | "DELETED" }>(
                {
                    url: `${BASEURL}/economy/transaction/wait/${tx.id}`,
                    method: "PATCH",
                },
                "ECONOMY.WRITE",
                this.cache
            );
            if (throwsIfResultsIsNotApproved && res.status !== "APPROVED") {
                throw new ErisSdkError("TRANSACTION_NOT_APPROVED", `Transaction was not approved, final status: ${res.status}`);
            }
            return res.status;
        }

        // Caso contrário, polling manual até mudar de PENDING
        let result: ErisApiSdkTransactionStatus | "DELETED" = "PENDING";
        while (result === "PENDING") {
            await new Promise((r) => setTimeout(r, 3000));
            const updated = await this.fetchInfo();
            result = updated.status;
        }

        if (throwsIfResultsIsNotApproved && result !== "APPROVED") {
            throw new ErisSdkError("TRANSACTION_NOT_APPROVED", `Transaction was not approved, final status: ${result}`);
        }

        return result;
    }
}
