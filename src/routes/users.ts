import { BASEURL, StxApiTransactionResponse, UserInfoFull, UserTransaction } from "../index.js";
import { TransactionRoute } from "./transactionRoutes.js";
import { CacheRoute } from "../cache.js";
import { RequestHelper } from "../helpers/requestHelper.js";

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


/**
 * Rotas relacionadas a um usuário da Éris.
 * Permite consultar saldo, transações, dar ou receber STX, e buscar informações completas do usuário.
 * 
 * @example
 * ```ts
 * const cli = new ErisApiCli("TOKEN");
 * const user = cli.user("123456");
 * 
 * // Consultar saldo
 * const balance = await user.balance();
 * console.log(balance);
 * 
 * // Dar STX para o usuário
 * const tx = await user.giveStx({
 *   amount: 10,
 *   channelId: "123",
 *   guildId: "456",
 *   reason: "Prêmio",
 *   expiresAt: "1m"
 * });
 * 
 * const result = await tx.waitForConfirmation();
 * console.log(result);
 * ```
 */
export class UserRoutes {
    private token: string;
    private userId: string;
    private cache: CacheRoute = new CacheRoute();
    private debug: boolean = false;
    private helper: RequestHelper;

    constructor(token: string, userId: string, cache: CacheRoute, debug: boolean = false) {
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
     * const tx = await user.giveStx({
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
    public async giveStx(data: TakeStxAndGiveStxRequestData): Promise<TransactionRoute>;
    public async giveStx(data: TakeStxAndGiveStxRequestData, throwError: boolean): Promise<TransactionRoute | false>;
    public async giveStx(data: TakeStxAndGiveStxRequestData, throwError = true): Promise<TransactionRoute | false> {
        if (data.amount < 1)
            throw new Error("[ERIS API CLI ERROR] Amount must be greater than 0");

        const money = this.cache.get("money") as number | undefined;
        if (money && money < data.amount)
            throw new Error("[ERIS API CLI ERROR] You don't have enough money");

        try {
            const response = await this.helper.send<StxApiTransactionResponse>({
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
     * const tx = await user.takeStx({
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
    public async takeStx(data: TakeStxAndGiveStxRequestData): Promise<TransactionRoute>;
    public async takeStx(data: TakeStxAndGiveStxRequestData, throwError: boolean): Promise<TransactionRoute | false>;
    public async takeStx(data: TakeStxAndGiveStxRequestData, throwError = true): Promise<TransactionRoute | false> {
        if (data.amount < 1)
            throw new Error("[ERIS API CLI ERROR] Amount must be greater than 0");

        try {
            const response = await this.helper.send<StxApiTransactionResponse>({
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
     * const balance = await user.balance();
     * console.log(balance.money, balance.bank);
     * ```
     * 
     * @param throwError Se false, retorna false ao invés de lançar erro.
     * @returns Objeto com `money` e `bank` ou false.
     * @throws {Error} Se a rota não puder ser acessada ou ocorrer erro na requisição.
     */
    public async getBalance(throwError = true): Promise<{ money: number; bank: number } | false> {
        try {
            const data = await this.helper.send<{ money: number; bank: number }>({
                method: "GET",
                url: `${BASEURL}/economy/balance/${this.userId}`
            }, "ECONOMY.READ", this.cache);

            return data;
        } catch (err) {
            if (this.debug) throw err;
            if (!throwError) return false;
            throw err;
        }
    }

    /**
     * Retorna as transações do usuário.
     * 
     * @example
     * ```ts
     * const txs = await user.transactions({ limit: 10 });
     * txs.forEach(t => console.log(t.info));
     * ```
     * 
     * @param body Opções de limite e filtro por tempo.
     * @param throwError Se false, retorna false ao invés de lançar erro.
     * @returns Array de transações ou false.
     * @throws {Error} Se a rota não puder ser acessada ou ocorrer erro na requisição.
     */
    public async getTransactions(body?: { limit?: number; timeLimit?: Date }, throwError = true): Promise<TransactionRoute[] | false> {
        const limit = body?.limit ?? 25;
        const timeQuery = body?.timeLimit ? `&timeLimit=${body.timeLimit.toISOString()}` : "";

        try {
            const data = await this.helper.send<{ data: UserTransaction[] }>({
                method: "GET",
                url: `${BASEURL}/economy/transactions/${this.userId}?limit=${limit}${timeQuery}`
            }, "ECONOMY.READ", this.cache);

            return data.data.map(t => new TransactionRoute(this.token, t));
        } catch (err) {
            if (this.debug) throw err;
            if (!throwError) return false;
            throw err;
        }
    }

     /**
     * Retorna informações completas do usuário, incluindo pets, estoques e cooldowns.
     * 
     * @example
     * ```ts
     * const info = await user.fetchInfo();
     * console.log(info.pets, info.company);
     * ```
     * 
     * @param throwError Se false, retorna false ao invés de lançar erro.
     * @returns Informações completas do usuário ou false.
     * @throws {Error} Se não houver permissão ou ocorrer erro na requisição.
     */
    public async fetchInfo(throwError = true): Promise<UserInfoFull | false> {
        try {
            const data = await this.helper.send<UserInfoFull>({
                method: "GET",
                url: `${BASEURL}/user/info/${this.userId}`
            }, "USER.INFO.READ", this.cache);

            return data;
        } catch (err) {
            if (this.debug) throw err;
            if (!throwError) return false;
            throw err;
        }
    }
}
