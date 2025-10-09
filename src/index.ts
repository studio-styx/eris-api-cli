import { MeRoutes } from "./routes/meRoutes.js";
import { TryviaRoutes } from "./routes/tryviaRoutes.js";
import { UserRoutes } from "./routes/users.js";

export const BASEURL = "https://apieris.squareweb.app/v1"

export class ErisApiCli {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    public user(userId: string) {
        return new UserRoutes(this.token, userId);
    }

    public me() {
        return new MeRoutes(this.token);
    }

    public tryvia() {
        return new TryviaRoutes(this.token);
    }
}

export default ErisApiCli;