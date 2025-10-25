import axios, { AxiosRequestConfig } from "axios";
import { ErisSdkError, Errors } from "../error.js";
import { ErisApiSdkErrorsCode } from "../types.js";

const MESSAGE_CODE_MAP: Record<string, ErisApiSdkErrorsCode> = {
  "user not found": "USER_NOT_FOUND",
  "not enough money": "INSUFFICIENT_FUNDS",
  "insufficient funds": "INSUFFICIENT_FUNDS",
  "you are not on this server": "USER_NOT_FOUND",
  "transaction is not pending": "TRANSACTION_NOT_PENDING",
  "transaction time is too long": "BAD_REQUEST",
  "transaction not found": "TRANSACTION_NOT_FOUND",
  "giveaway not found": "GIVEAWAY_NOT_FOUND",
  "giveaway already ended": "GIVEAWAY_ALREADY_ENDED",
  "company not found": "COMPANY_NOT_FOUND",
  "pet not found": "PET_NOT_FOUND",
  "fish not found": "FISH_NOT_FOUND",
  "stock not found": "STOCK_NOT_FOUND",
  "fishing rod not found": "FISHING_ROD_NOT_FOUND",
  "cooldown not found": "COOLDOWN_NOT_FOUND",
  "user is blacklisted": "USER_BLACKLISTED",
  "invalid request": "INVALID_REQUEST",
  "internal server error": "INTERNAL_SERVER_ERROR",
  "unauthorized": "UNAUTHORIZED",
  "forbidden": "FORBIDDEN",
  "rate limited": "RATE_LIMITED",
  "not found": "NOT_FOUND",
  "bad request": "BAD_REQUEST",
};


type CacheLike = { get(key: string): any };

export class RequestHelper {
    private token: string;
    private debug: boolean;

    constructor(token: string, debug = false) {
        this.token = token;
        this.debug = debug;
    }

    public async send<T>(
        config: AxiosRequestConfig,
        expectedPerm?: string,
        cache?: CacheLike
    ): Promise<T> {
        // checa permissão se pedida
        if (expectedPerm && cache) {
            const perms = cache.get("permissions") as string[] | undefined;
            if (perms && !perms.includes(expectedPerm) && !perms.includes("ALL")) {
                throw Errors.MISSING_PERMISSION(expectedPerm);
            }
        }


        // garante header Authorization
        const requestConfig: AxiosRequestConfig = {
            ...config,
            headers: {
                ...(config.headers || {}),
                Authorization: this.token,
            },
        };

        try {
            const resp = await axios.request<T>(requestConfig);
            return resp.data;
        } catch (err) {
            if (this.debug) throw err;

            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const msg =
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    err.message ||
                    "Unknown axios error";

                const normalized = (msg || "").toString().trim().toLowerCase();
                const code = MESSAGE_CODE_MAP[normalized] ??
                    (status === 400 ? "BAD_REQUEST"
                        : status === 401 ? "UNAUTHORIZED"
                            : status === 403 ? "FORBIDDEN"
                                : status === 404 ? "NOT_FOUND"
                                    : status === 429 ? "RATE_LIMITED"
                                        : status === 500 ? "INTERNAL_SERVER_ERROR"
                                            : "UNKNOWN_ERROR");

                throw new ErisSdkError(code, msg);
            }

            throw new ErisSdkError("UNKNOWN_ERROR", (err as Error).message);
        }

    }
}
