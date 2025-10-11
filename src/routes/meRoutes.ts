import { BASEURL } from "../index.js";
import { CacheRoute } from "../cache.js";
import { RequestHelper } from "../helpers/requestHelper.js";

type VotesData = {
    id: number;
    userId: string;
    createdAt: Date;
    applicationId: string;
    origin: "SERVER" | "WEBSITE";
}[];

/**
 * Rotas para o bot logado (me).
 * Permite consultar saldo e votos.
 * 
 * @example
 * ```ts
 * const me = new MeRoutes("TOKEN");
 * 
 * // Consultar saldo
 * const balance = await me.balance();
 * console.log(balance);
 * 
 * // Consultar votos
 * const votes = await me.votes();
 * console.log(votes.votes, votes.data);
 * ```
 */
export class MeRoutes {
    private cache: CacheRoute;
    private helper: RequestHelper;

    constructor(token: string, cache?: CacheRoute, debug = false) {
        this.cache = cache ?? new CacheRoute();
        this.helper = new RequestHelper(token, debug);
    }

    /** Obtém o saldo atual do bot */
    /**
     * Obtém o saldo atual do bot.
     * Usa cache interno de 20 segundos.
     * 
     * @returns Número de STX disponíveis.
     * @throws {Error} Se não houver permissão ou falhar a requisição.
     */
    public async balance(): Promise<number> {
        const cached = this.cache.get("money") as number | undefined;
        if (cached) return cached;

        const data = await this.helper.send<{ money: number }>(
            { url: `${BASEURL}/economy/balance`, method: "GET" },
            "ECONOMY.READ",
            this.cache
        );

        this.cache.set("money", data.money, 20 * 1000);
        return data.money;
    }

     /**
     * Obtém total de votos e histórico.
     * 
     * @returns Objeto com total de votos e array de votos detalhados.
     * @throws {Error} Se não houver permissão ou falhar a requisição.
     */
    public async votes() {
        const data = await this.helper.send<{ votes: number; data: VotesData }>(
            { url: `${BASEURL}/botlist/votes`, method: "GET" },
            "BOTLIST.READ",
            this.cache
        );

        return data;
    }
}
