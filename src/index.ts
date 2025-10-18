import { MeRoutes } from "./routes/meRoutes.js";
import { TryviaRoutes } from "./routes/tryviaRoutes.js";
import { UserRoutes } from "./routes/users.js";
import { ErisCliGiveawayInfo, UserTransaction } from "./types.js";
import { TransactionRoute } from "./routes/transactionRoutes.js";
import { GiveawayRoutes } from "./routes/giveawayRoutes.js";
import { CacheRoute } from "./cache.js";
import { RequestHelper } from "./helpers/requestHelper.js";
import { checkVersion } from "./checkVersion.js";
import { readFileSync } from "fs";
import { join } from "path";

// Lê a versão do package.json dinamicamente
const packageJson = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf-8"));
const { version } = packageJson;

export const BASEURL = "https://apieris.squareweb.app/v2";

/**
 * Classe principal da SDK ErisApiCli
 *
 * Permite acessar todas as rotas da API: usuários, giveaways, transações, saldo e tryvia.
 *
 * @example
 * ```ts
 * const cli = new ErisApiCli("TOKEN_DO_BOT");
 * 
 * // Inicializa cache local
 * await cli.initCache();
 * 
 * // Consultar seu próprio saldo
 * const money = await cli.me.balance();
 * 
 * // Enviar STX para outro usuário
 * const tx = await cli.user("12345").giveStx({
 *   amount: 10,
 *   channelId: "123",
 *   guildId: "456",
 *   reason: "Teste",
 *   expiresAt: "1m"
 * });
 * 
 * const result = await tx.waitForConfirmation();
 * console.log(result);
 * ```
 */
export class ErisApiCli {
    private token: string;
    private debug: boolean = false;
    private cache: CacheRoute = new CacheRoute();
    private helper: RequestHelper;

    constructor(token: string, debug: boolean = false) {
        this.token = token;
        this.debug = debug;
        this.helper = new RequestHelper(token, debug);
        // Verifica a versão em segundo plano
        void checkVersion(version);
    }

    /**
     * Inicializa o cache do bot carregando dados da API
     * @returns Dados de cache carregados { money, permissions, giveaways }
     */
    public async initCache() {
        try {
            const data = await this.helper.send<{
                money: number;
                permissions: string[];
                giveaways: ErisCliGiveawayInfo[];
            }>({ url: `${BASEURL}/cache`, method: "GET" }, "ALL", this.cache);

            this.cache.set("money", data.money, 20 * 1000);
            this.cache.set("permissions", data.permissions, 1000 * 60 * 60);
            this.cache.set("giveaways", data.giveaways, 1000 * 60 * 2);

            return data;
        } catch {
            return null;
        }
    }

    /** Retorna uma instância de UserRoutes para o usuário especificado */
    get users() {
        return {
            /** Inicializa um objeto de user para o id fornecido, atenção: essa rota não pega informações do usuário, apenas sua classe */
            get: (userId: string) => new UserRoutes(this.token, userId, this.cache, this.debug)
        };
    }

    /** Retorna uma instância de MeRoutes para pegar informações da aplicação consumidora */
    get bot() {
        return new MeRoutes(this.token, this.cache, this.debug);
    }

    /** Rotas de transações */
    get transactions() {
        return {
            /** Pega informações de uma transação */
            get: async (id: number) => {
                const data = await this.helper.send<{ data: UserTransaction }>(
                    { url: `${BASEURL}/transaction/${id}`, method: "GET" },
                    "ECONOMY.READ",
                    this.cache
                );
                return new TransactionRoute(this.token, data.data, this.cache, this.debug);
            }
        };
    }

    /** Pega informações de um sorteio */
    get giveaways() {
        return {
            /** Pega informações de um sorteio */
            get: async (id: number) => {
                const data = await this.helper.send<ErisCliGiveawayInfo>(
                    { url: `${BASEURL}/giveaway/info/${id}`, method: "GET" },
                    "GIVEAWAY.INFO.READ",
                    this.cache
                );
                return new GiveawayRoutes(this.token, data, this.cache, this.debug);
            }
        };
    }

    get tryvia() {
        return new TryviaRoutes(this.token);
    }
}

export * from "./types.js";
export default ErisApiCli;