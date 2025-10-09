import axios from "axios";
import { BASEURL } from "..";

type VotesData = {
    id: number;
    userId: string;
    createdAt: Date;
    applicationId: string;
    origin: "SERVER" | "WEBSITE";
}[]

export class MeRoutes {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    public async balance() {
        const response = await axios.get(`${BASEURL}/economy/balance`, {
            headers: {
                Authorization: this.token
            },
        });

        return response.data as { money: number }
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