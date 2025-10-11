import axios, { AxiosError, AxiosRequestConfig } from "axios";

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
                throw new Error(`[ERIS API CLI ERROR] Missing permission: ${expectedPerm}`);
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
            // se estiver em modo debug, joga o erro cru (útil p/ stack e AxiosError)
            if (this.debug) throw err;

            if (axios.isAxiosError(err)) {
                const e = err as AxiosError<any>;
                const msg = e.response?.data?.message ?? e.response?.data.error ?? e.message ?? "Unknown axios error";
                throw new Error(`[ERIS API CLI ERROR] ${msg}`);
            }

            throw new Error(`[ERIS API CLI ERROR] ${(err as Error).message}`);
        }
    }
}
