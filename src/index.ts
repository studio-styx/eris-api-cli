import axios from "axios";
import { MeRoutes } from "./routes/meRoutes.js";
import { TryviaRoutes } from "./routes/tryviaRoutes.js";
import { UserRoutes } from "./routes/users.js";
import { ErisCliGiveawayInfo, UserTransaction } from "./types.js";
import { TransactionRoute } from "./routes/transactionRoutes.js";
import { GiveawayRoutes } from "./routes/giveawayRoutes.js";
import { CacheRoute } from "./cache.js";

export const BASEURL = "https://apieris.squareweb.app/v2";

export class ErisApiCli {
    private token: string;
    private cache: CacheRoute = new CacheRoute();

    constructor(token: string) {
        this.token = token;
    }

    public async initCache() {
        const response = await axios.get(`${BASEURL}/cache`, {
            headers: {
                Authorization: this.token
            }
        }).catch(() => null);

        if (!response) return;
        const data = response.data as {
            money: number;
            permissions: string[];
            giveaways: ErisCliGiveawayInfo[];
        };

        const cache = new CacheRoute()

        cache.set("money", data.money, 20 * 1000);
        cache.set("permissions", data.permissions, 1000 * 60 * 60);
        cache.set("giveaways", data.giveaways, 1000 * 60 * 2);

        this.cache = cache;

        return data;
    }

    get user() {
        return (userId: string) => new UserRoutes(this.token, userId, this.cache);
    }

    get me() {
        return new MeRoutes(this.token, this.cache);
    }

    get tryvia() {
        return new TryviaRoutes(this.token);
    }

    public async transaction(id: number) {
        const response = await axios.get(`${BASEURL}/transaction/${id}`, {
            headers: {
                Authorization: this.token
            }
        });

        const data = response.data.data as UserTransaction;

        return new TransactionRoute(this.token, data, this.cache)
    }

    public async giveaway(id: number) {
        const response = await axios.get(`${BASEURL}/giveaway/info/${id}`, {
            headers: {
                Authorization: this.token
            }
        });

        const data = response.data as ErisCliGiveawayInfo;

        return new GiveawayRoutes(this.token, data, this.cache);
    }
}

export * from "./types.js"

export default ErisApiCli;