import { ErisApiSdkErrorsCode } from "./types.js";

export class ErisSdkError extends Error {
    code: ErisApiSdkErrorsCode;

    constructor(code: ErisApiSdkErrorsCode, message: string) {
        super(message);
        this.name = "ErisSdkError";
        this.code = code;
    }

    static from(code: ErisApiSdkErrorsCode, message: string) {
        return new ErisSdkError(code, message);
    }
}

// atalhos comuns
export const Errors = {
    INVALID_REQUEST: (msg = "Invalid request") =>
        ErisSdkError.from("INVALID_REQUEST", msg),

    UNKNOWN_ERROR: (msg = "Unknown error") =>
        ErisSdkError.from("UNKNOWN_ERROR", msg),

    MISSING_PERMISSION: (perm: string) =>
        ErisSdkError.from("FORBIDDEN", `Missing permission: ${perm}`),

    BAD_REQUEST: (msg = "Bad request") =>
        ErisSdkError.from("BAD_REQUEST", msg),
};
