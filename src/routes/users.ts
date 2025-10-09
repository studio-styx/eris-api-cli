import axios from "axios";
import { BASEURL } from "../index.js";

type RequistionGenericType = {
    message: string;
    success: boolean;
}

type UserTransactionsResponse = {
    data: UserTransactionsResponseDataType
}

type UserTransactionsResponseDataType = {
    id: string;
    userId: string;
    message: string;
    type: "info";
    tags: string[];
    timestamp: Date;
}[]

export class UserRoutes {
    private token: string;
    private userId: string

    constructor(token: string, userId: string) {
        this.token = token;
        this.userId = userId;
    }

    public async addStx(data: {
        guildId: string,
        channelId: string,
        amount: number
        reason?: string
    }) {
        if (data.amount < 1) throw new Error("[ERIS API CLI ERROR] Amount must be greater than 0")
        const response = await axios.post(`${BASEURL}/economy/give-stx`, {
            ...data,
            memberId: this.userId
        }, {
            headers: {
                Authorization: this.token
            }
        })

        return response.data as RequistionGenericType;
    }

    public async takeStx(data: {
        guildId: string,
        channelId: string,
        amount: number,
        reason?: string
    }) {
        if (data.amount < 1) throw new Error("[ERIS API CLI ERROR] Amount must be greater than 0");
        const response = await axios.post(`${BASEURL}/economy/take-stx`, {
            ...data,
            memberId: this.userId
        }, {
            headers: {
                Authorization: this.token
            }
        });

        return response.data as RequistionGenericType;
    }

    public async balance() {
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
        const response = await axios.get(`${BASEURL}/economy/transactions/${this.userId}}`, {
            headers: {
                Authorization: this.token
            },
        });

        return response.data as UserTransactionsResponse;
    }
}