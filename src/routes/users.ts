import { BASEURL, ErisApiSdkStxApiTransactionResponse, ErisApiSdkUserInfoFull, ErisApiSdkUserTransaction } from "../index.js";
import { TransactionRoute } from "./transactionRoutes.js";
import { CacheRoute } from "../cache.js";
import { RequestHelper } from "../helpers/requestHelper.js";
import { EconomyUserRoutes } from "./users/economyRoutes.js";

/**
 * Rotas relacionadas a um usuário da Éris.
 * Permite consultar saldo, transações, dar ou receber STX, e buscar informações completas do usuário.
 * 
 * @example
 * ```ts
 * const cli = new ErisApiCli("TOKEN");
 * const user = cli.users.get("123456");
 * 
 * // Consultar saldo
 * const balance = await user.balance.get();
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

    /** Rotas de economia do usuário (saldo, dar/receber STX) */
    get balance() {
        return new EconomyUserRoutes(this.token, this.userId, this.cache, this.debug);
    }

    /**
     * Retorna o saldo do usuário.
     * 
     * @example
     * ```ts
     * const money = await sdk.users.get("123").getBalance();
     * console.log(money);
     * ```
     * 
     * @param throwError Se false, retorna false ao invés de lançar erro.
     * @returns Objeto com `money` e `bank` ou false.
     * @throws {Error} Se a rota não puder ser acessada ou ocorrer erro na requisição.
     */
    public async getBalance(throwError = true): Promise<number | false> {
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
            const data = await this.helper.send<{ data: ErisApiSdkUserTransaction[] }>({
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
    public async fetchInfo(throwError = true): Promise<ErisApiSdkUserInfoFull | false> {
        try {
            const data = await this.helper.send<ErisApiSdkUserInfoFull>({
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
