import axios from "axios";
import { BASEURL } from "../index.js";
import { CacheRoute } from "../cache.js";

type VotesData = {
    id: number;
    userId: string;
    createdAt: Date;
    applicationId: string;
    origin: "SERVER" | "WEBSITE";
}[]

export class MeRoutes {
    private token: string;
    private cache: CacheRoute = new CacheRoute();

    constructor(token: string, cache?: CacheRoute) {
        this.token = token;
        if (cache) this.cache = cache;
    }

    public async balance() {
        const botPerms = this.cache.get("permissions") as string[] | undefined;

        if (botPerms && (!botPerms.includes(`ECONOMY.READ`) || !botPerms.includes("ALL"))) throw new Error("[ERIS API CLI ERROR] You don't have permission to use this route")

        const money = this.cache.get("money") as number | undefined;

        if (money) return money;

        const response = await axios.get(`${BASEURL}/economy/balance`, {
            headers: {
                Authorization: this.token
            },
        });

        const data = response.data as { money: number };

        this.cache.set("money", data.money, 20 * 1000)

        return data.money
    }

    public async votes() {
        const response = await axios.get(`${BASEURL}/botlist/votes`, {
            headers: {
                Authorization: this.token
            },
        });

        return response.data as { votes: number, data: VotesData }
    }
}