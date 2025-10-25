import { BASEURL, ErisSdkError } from "../index.js";
import { ErisApiSdkGiveawayInfo } from "../types.js";
import { CacheRoute } from "../cache.js";
import { RequestHelper } from "../helpers/requestHelper.js";


/**
 * Rotas relacionadas a sorteios (giveaways).
 * Permite consultar informações e aguardar o fim do sorteio.
 *
 * @example
 * ```ts
 * const giveaway = new GiveawayRoutes(token, { id: "123", ended: false, expiresAt: new Date(), ... });
 * 
 * // Obter informações atualizadas do giveaway
 * const info = await giveaway.fetchInfo();
 * console.log(info.expiresAt);
 * 
 * // Aguardar até o sorteio terminar
 * const finalState = await giveaway.waitForEnd();
 * console.log(finalState.ended); // true
 * ```
 */
export class GiveawayRoutes {
    private giveaway: ErisApiSdkGiveawayInfo;
    private cache: CacheRoute = new CacheRoute();
    private helper: RequestHelper;

    constructor(token: string, giveaway: ErisApiSdkGiveawayInfo, cache?: CacheRoute, debug: boolean = false) {
        this.giveaway = giveaway;
        if (cache) this.cache = cache;
        this.helper = new RequestHelper(token, debug);
    }

    /** Retorna o estado atual do giveaway em cache */
    get info() {
        return this.giveaway;
    }

    /**
     * Atualiza as informações do giveaway na API.
     * 
     * @returns Informações atualizadas do giveaway.
     * @throws {Error} Se não houver permissão para leitura.
     */
    public async fetchInfo() {
        const data = await this.helper.send<ErisApiSdkGiveawayInfo>({
            method: "GET",
            url: `${BASEURL}/giveaway/info/${this.giveaway.id}`
        }, "GIVEAWAY.INFO.READ", this.cache);

        this.giveaway = {
            ...data,
            expiresAt: new Date(data.expiresAt)
        };

        return this.giveaway;
    }

    /**
     * Aguarda o término do giveaway.
     * Atualiza automaticamente o estado do giveaway a cada 10 segundos até faltarem menos de 5 minutos, depois aguarda o tempo restante.
     * 
     * @example
     * ```ts
     * const giveaway = new GiveawayRoutes(token, giveawayData);
     * const finalState = await giveaway.waitForEnd();
     * console.log(finalState.ended); // true
     * ```
     * 
     * @returns Estado final do giveaway.
     * @throws {Error} Se o giveaway já tiver terminado ou expirado.
     */
    public async waitForCompletion() {
        if (this.giveaway.ended)
            throw new ErisSdkError("GIVEAWAY_ALREADY_ENDED", "To use waitForCompletion, the giveaway cannot be ended");

        if (this.giveaway.expiresAt < new Date())
            throw new ErisSdkError("GIVEAWAY_ALREADY_ENDED", "To use waitForCompletion, the giveaway cannot be expired");

        let result = this.giveaway;

        // Atualiza a cada 60s até faltar menos de 5min
        while (result.expiresAt.getTime() - Date.now() > 5 * 60 * 1000) {
            await new Promise(resolve => setTimeout(resolve, 60_000));
            result = await this.fetchInfo();
        }

        const remaining = result.expiresAt.getTime() - Date.now();
        if (remaining > 0)
            await new Promise(resolve => setTimeout(resolve, remaining));

        result = await this.fetchInfo();
        return result;
    }
}
