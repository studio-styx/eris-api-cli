import axios from "axios";
import { BASEURL, ErisCliCompany, StxApiTransactionResponse, UserInfo, UserInfoCooldown, UserInfoFish, UserInfoFishingRod, UserInfoGiveaways, UserInfoPet, UserInfoStock, UserTransaction } from "../index.js";
import { TransactionRoute } from "./transactionRoutes.js";
import { CacheRoute } from "../cache.js";

type ErisCliDiscordUserGeneric = {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot: boolean;
    banner: string | null;
}

export class UserRoutes {
    private token: string;
    private userId: string
    private cache: CacheRoute = new CacheRoute();

    constructor(token: string, userId: string, cache: CacheRoute) {
        this.token = token;
        this.userId = userId;
        this.cache = cache;
    }

    private checkBotPerms(type: 'READ' | 'WRITE') {
        const botPerms = this.cache.get("permissions") as string[] | undefined;

        if (botPerms && (!botPerms.includes(`ECONOMY.${type}`) || !botPerms.includes("ALL"))) throw new Error("[ERIS API CLI ERROR] You don't have permission to use this route")
    
        return true;
    }

    public async giveStx(data: {
        guildId: string,
        channelId: string,
        amount: number
        reason?: string
    }) {
        if (data.amount < 1) throw new Error("[ERIS API CLI ERROR] Amount must be greater than 0");

        this.checkBotPerms("WRITE");

        const money = this.cache.get("money") as number | undefined;

        if (money && money < data.amount) throw new Error("[ERIS API CLI ERROR] You don't have enough money");

        const response = await axios.post(`${BASEURL}/economy/give-stx`, {
            ...data,
            memberId: this.userId
        }, {
            headers: {
                Authorization: this.token
            }
        })

        const responseData = response.data as StxApiTransactionResponse;

        this.cache.set("money", responseData.botBalance, 20 * 1000)

        return new TransactionRoute(this.token, responseData.data);
    }

    public async takeStx(data: {
        guildId: string,
        channelId: string,
        amount: number,
        reason?: string
    }) {
        if (data.amount < 1) throw new Error("[ERIS API CLI ERROR] Amount must be greater than 0");

        this.checkBotPerms("WRITE");
        const response = await axios.post(`${BASEURL}/economy/take-stx`, {
            ...data,
            memberId: this.userId
        }, {
            headers: {
                Authorization: this.token
            }
        });

        const responseData = response.data as StxApiTransactionResponse;

        return new TransactionRoute(this.token, responseData.data);
    }

    public async balance() {
        this.checkBotPerms("READ");

        const response = await axios.get(`${BASEURL}/economy/balance/${this.userId}`, {
            headers: {
                Authorization: this.token
            },
        });

        return response.data as { money: number; bank: number }
    }

    public async transactions(body?: {
        limit?: number,
        timeLimit?: Date
    }) {
        this.checkBotPerms("READ");

        const response = await axios.get(`${BASEURL}/economy/transactions/${this.userId}?limit=${body?.limit || 25}${body?.timeLimit ? `&timeLimit=${body.timeLimit}` : ""}`, {
            headers: {
                Authorization: this.token
            },
        });

        const data = response.data as { data: UserTransaction[] };

        const transactions = data.data.map(transaction => new TransactionRoute(this.token, transaction));

        return transactions;
    }

    public async fetchInfo() {
        const botPerms = this.cache.get("permissions") as string[] | undefined;

        if (botPerms && (!botPerms.includes(`USER.INFO.READ`) || !botPerms.includes("ALL"))) throw new Error("[ERIS API CLI ERROR] You don't have permission to use this route")

        const response = await axios.get(`${BASEURL}/user/info/${this.userId}`, {
            headers: {
                Authorization: this.token
            }
        });

        const data = response.data as UserInfo & {
            stocks: UserInfoStock[]; fishs: UserInfoFish[]; fishingRods: UserInfoFishingRod[]; cooldowns: UserInfoCooldown[]; company: ErisCliCompany; giveaways: UserInfoGiveaways[]; activePet: UserInfoPet | null; pets: UserInfoPet[]
            discord: ErisCliDiscordUserGeneric & any;
        }

        return data;
    }
}