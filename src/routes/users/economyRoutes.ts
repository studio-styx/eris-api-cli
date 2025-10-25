import { AxiosError } from "axios";
import { CacheRoute } from "../../cache.js";
import { RequestHelper } from "../../helpers/requestHelper.js";
import { BASEURL, ErisSdkError, Errors } from "../../index.js";
import { ErisApiSdkStxApiTransactionResponse } from "../../types.js";
import { TransactionRoute } from "../transactionRoutes.js";

type TakeStxAndGiveStxRequestData = {
    guildId: string;
    channelId: string;
    amount: number;
    reason?: string;
    expiresAt: TakeStxAndGiveStxRequestExpiresAtData;
};

type TakeStxAndGiveStxRequestExpiresAtData =
    "1m" | "2m" | "3m" | "4m" | "5m" | "10m" |
    "15m" | "20m" | "30m" | "45m" | "60m" | "1h"
    | "2h" | "4h" | "6h" | "8h" | "12h" | "24h";


export class EconomyUserRoutes {
    private token: string;
    private userId: string;
    private cache: CacheRoute = new CacheRoute();
    private debug: boolean = true;
    private helper: RequestHelper;

    constructor(token: string, userId: string, cache: CacheRoute, debug: boolean = true) {
        this.token = token;
        this.userId = userId;
        this.cache = cache;
        this.debug = debug;
        this.helper = new RequestHelper(token, debug);
    }

    /**
         * Dá STX para o usuário.
         * 
         * @example
         * ```ts
         * const tx = await user.balance.give({
         *   amount: 20,
         *   channelId: "123",
         *   guildId: "456",
         *   reason: "Bônus",
         *   expiresAt: "5m"
         * });
         * ```
         * 
         * @param data Dados da transação.
         * @param throwError Se false, retorna false ao invés de lançar erro.
         * @returns Transação criada ou false.
         * @throws {Error} Se a quantidade for inválida ou saldo insuficiente.
         */
    public async give(data: TakeStxAndGiveStxRequestData): Promise<TransactionRoute>;
    public async give(data: TakeStxAndGiveStxRequestData, throwError: boolean): Promise<TransactionRoute | false>;
    public async give(data: TakeStxAndGiveStxRequestData, throwError = true): Promise<TransactionRoute | false> {
        if (data.amount < 1)
            throw Errors.INVALID_REQUEST("Amount must be greater than 0");

        const money = this.cache.get("money") as number | undefined;
        if (money && money < data.amount)
            throw new ErisSdkError("INSUFFICIENT_FUNDS", "You don't have enough money");

        try {
            const response = await this.helper.send<ErisApiSdkStxApiTransactionResponse>({
                method: "POST",
                url: `${BASEURL}/economy/give-stx`,
                data: { ...data, memberId: this.userId }
            }, "ECONOMY.WRITE", this.cache);

            this.cache.set("money", response.botBalance, 20 * 1000);
            return new TransactionRoute(this.token, response.data);
        } catch (err) {
            if (this.debug) throw err;
            if (!throwError) return false;
            throw err;
        }
    }

    /**
     * pede STX pro usuário.
     * 
     * @example
     * ```ts
     * const tx = await user.balance.receive({
     *   amount: 15,
     *   channelId: "123",
     *   guildId: "456",
     *   reason: "Correção",
     *   expiresAt: "1m"
     * });
     * const result = await tx.waitForConfirmation();
     * console.log(result);
     * ```
     * 
     * @param data Dados da transação.
     * @param throwError Se false, retorna false ao invés de lançar erro.
     * @returns Transação criada ou false.
     * @throws {Error} Se a quantidade for inválida.
     */
    public async receive(data: TakeStxAndGiveStxRequestData): Promise<TransactionRoute>;
    public async receive(data: TakeStxAndGiveStxRequestData, throwError: boolean): Promise<TransactionRoute | false>;
    public async receive(data: TakeStxAndGiveStxRequestData, throwError = true): Promise<TransactionRoute | false> {
        if (data.amount < 1)
            throw Errors.INVALID_REQUEST("Amount must be greater than 0");

        try {
            const response = await this.helper.send<ErisApiSdkStxApiTransactionResponse>({
                method: "POST",
                url: `${BASEURL}/economy/take-stx`,
                data: { ...data, memberId: this.userId }
            }, "ECONOMY.WRITE", this.cache);

            return new TransactionRoute(this.token, response.data);
        } catch (err) {
            if (this.debug) throw err;
            if (!throwError) return false;
            throw err;
        }
    }

    /**
     * Retorna o saldo do usuário.
     * 
     * @example
     * ```ts
     * const money = await user.balance.get();
     * console.log(money);
     * ```
     * 
     * @param throwError Se false, retorna false ao invés de lançar erro.
     * @returns Objeto com `money` e `bank` ou false.
     * @throws {Error} Se a rota não puder ser acessada ou ocorrer erro na requisição.
     */
    public async get(throwError = true): Promise<number | false> {
        try {
            const data = await this.helper.send<{ money: number }>({
                method: "GET",
                url: `${BASEURL}/economy/balance/${this.userId}`
            }, "ECONOMY.READ", this.cache);

            return data.money;
        } catch (err) {
            if (this.debug) throw err;
            if (!throwError) return false;
            throw err;
        }
    }
}