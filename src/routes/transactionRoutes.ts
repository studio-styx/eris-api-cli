import axios from "axios";
import { TransactionStatus, UserTransaction } from "../types";
import { BASEURL } from "..";
import { CacheRoute } from "../cache";

export class TransactionRoute {
    private token: string;
    private transaction: UserTransaction;
    private cache: CacheRoute = new CacheRoute();

    constructor(token: string, transaction: UserTransaction, cache?: CacheRoute) {
        this.token = token;
        this.transaction = transaction;
        if (cache) this.cache = cache;
    }

    get info() {
        return this.transaction;
    }

    private async checkPermissions(permission: string) {
        const botPerms = this.cache.get("permissions") as string[] | undefined;

        if (botPerms && (!botPerms.includes(permission) || !botPerms.includes("ALL"))) throw new Error("[ERIS API CLI ERROR] You don't have permission to use this route");
        return true;
    }

    public async fetchInfo() {
        this.checkPermissions("ECONOMY.READ")

        const response = await axios.get(`${BASEURL}/transaction/${this.transaction.id}`, {
            headers: {
                Authorization: this.token
            }
        });

        const data = response.data.data as UserTransaction;
        
        const normalizedData = {
            ...data,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
        }

        this.transaction = normalizedData;
        return normalizedData;
    }

    public async waitForConfirmation() {
        if (this.transaction.status !== "PENDING") throw new Error("[ERIS API CLI ERROR] To use the function waitForConfirmation, the transaction status needs to be \"PENDING\"");
        if (this.transaction.expiresAt && this.transaction.expiresAt < new Date()) throw new Error("[ERIS API CLI ERROR] To use the function waitForConfirmation, the transaction cannot be expired");
        if (!this.transaction.expiresAt) throw new Error("[ERIS API CLI ERROR] To use the function waitForConfirmation, the transaction expiresAt cannot be infinity");

        this.checkPermissions("ECONOMY.WRITE");

        if (this.transaction.expiresAt < new Date(Date.now() + 1000 * 60 * 5)) {
            const response = await axios.patch(`${BASEURL}/transaction/wait/${this.transaction.id}`, null, {
                headers: {
                    Authorization: this.token
                }
            });

            return response.data.status as TransactionStatus | "DELETED";
        }

        let result: TransactionStatus | "DELETED" = "PENDING";

        while (result === "PENDING") {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const response = await this.fetchInfo();

            result = response.status;
        }

        return result;
    }
}