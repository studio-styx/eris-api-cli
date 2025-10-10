import axios from "axios";
import { BASEURL } from "..";
import { ErisCliGiveawayInfo } from "../types";
import { CacheRoute } from "../cache";

export class GiveawayRoutes {
    private token: string;
    private giveaway: ErisCliGiveawayInfo;
    private cache: CacheRoute = new CacheRoute();

    constructor(token: string, giveaway: ErisCliGiveawayInfo, cache?: CacheRoute) {
        this.token = token;
        this.giveaway = giveaway;
        if (cache) this.cache = cache;
    }

    private async checkPermissions(permission: string) {
        const botPerms = this.cache.get("permissions") as string[] | undefined;

        if (botPerms && (!botPerms.includes(permission) || !botPerms.includes("ALL"))) throw new Error("[ERIS API CLI ERROR] You don't have permission to use this route");
        return true;
    }


    get info() {
        return this.giveaway;
    }

    public async fetchInfo() {
        this.checkPermissions("GIVEAWAY.INFO.READ");

        const response = await axios.get(`${BASEURL}/giveaway/info/${this.giveaway.id}`, {
            headers: {
                Authorization: this.token
            }
        });

        const data = response.data as ErisCliGiveawayInfo;

        const normalizedData = {
            ...data,
            expiresAt: new Date(data.expiresAt)
        }

        this.giveaway = normalizedData;
        return normalizedData;
    }

    public async waitForEnd() {
        this.checkPermissions("GIVEAWAY.INFO.READ");
        
        if (this.giveaway.ended)
            throw new Error("[ERIS API CLI ERROR] To use waitForEnd, the giveaway cannot be ended");

        if (this.giveaway.expiresAt < new Date())
            throw new Error("[ERIS API CLI ERROR] To use waitForEnd, the giveaway cannot be expired");

        let result = this.giveaway;

        // Atualiza a cada 10 segundos até faltar menos de 5 minutos
        while (result.expiresAt.getTime() - Date.now() > 5 * 60 * 1000) {
            await new Promise(resolve => setTimeout(resolve, 10_000));
            result = await this.fetchInfo();
        }

        const remaining = result.expiresAt.getTime() - Date.now();
        if (remaining > 0)
            await new Promise(resolve => setTimeout(resolve, remaining));

        result = await this.fetchInfo();

        return result;
    }

}