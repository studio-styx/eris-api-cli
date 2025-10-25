export type ErisApiSdkRequistionGenericType = {
    message: string;
    success: boolean;
}

export type ErisApiSdkUserLogsData = {
    data: ErisApiSdkUserLogs
}

export type ErisApiSdkErrorsCode = 
    | "USER_NOT_FOUND"
    | "INSUFFICIENT_FUNDS"
    | "TRANSACTION_NOT_FOUND"
    | "GIVEAWAY_NOT_FOUND"
    | "GIVEAWAY_ALREADY_ENDED"
    | "COMPANY_NOT_FOUND"
    | "PET_NOT_FOUND"
    | "FISH_NOT_FOUND"
    | "STOCK_NOT_FOUND"
    | "FISHING_ROD_NOT_FOUND"
    | "COOLDOWN_NOT_FOUND"
    | "USER_BLACKLISTED"
    | "INVALID_REQUEST"
    | "INTERNAL_SERVER_ERROR"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "RATE_LIMITED"
    | "NOT_FOUND"
    | "BAD_REQUEST"
    | "TRANSACTION_NOT_PENDING"
    | "UNKNOWN_ERROR"
    | "TRANSACTION_ERROR"
    | "GIVEAWAY_ERROR"
    | "TRANSACTION_NOT_APPROVED";

export type ErisApiSdkUserLogs = {
    id: string;
    userId: string;
    message: string;
    type: "info";
    tags: string[];
    timestamp: Date;
}

export type ErisApiSdkStxApiTransactionResponse = {
    transactionId: number;
    success: true;
    message: "Transaction created";
    data: ErisApiSdkUserTransaction;
    botBalance: number;
}

export type ErisApiSdkUserTransaction = {
    id: number;
    userId: string;
    targetId: string | null;
    amount: number;
    quitType: "SUB" | "SUM" | null;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date | null;
    guildId: string | null;
    channelId: string | null;
    messageId: string | null;
    reason: string | null;
    type: "API" | "USER" | "ADMIN" | "BUY" | "SELL";
    status: ErisApiSdkTransactionStatus
}

export type ErisApiSdkTransactionStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED"

export type ErisApiSdkUserInfo = {
    id: string;
    activePetId: number | null;
    money: number;
    bank: number;
    xp: number;
    companyId: number | null;
    afkReasson: string | null;
    afkTime: Date | null;
    dmNotification: boolean;
    blacklist: {
        bannedAt: Date,
        reason: string,
        endAt: Date,
        responsibleId: string;
    } | null;
    mailsTagsIgnored: string[];
}

export type ErisApiSdkUserInfoPet = {
    id: number;
    userId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    petId: number;
    hungry: number;
    life: number;
    happiness: number;
    energy: number;
    isDead: boolean;
    gender: "MALE" | "FEMALE";
    isPregnant: boolean;
    pregnantEndAt: Date | null;
    humor: string;
    spouseId: number | null;
    parent1Id: number | null;
    parent2Id: number | null;
    personality: ({
        trait: {
            id: number;
            name: string;
            geneType: ErisApiSdkPetInfoGeneticsGeneType;
            personalityConflictNames: string[];
        };
    } & {
        id: number;
        userPetId: number;
        traitId: number;
    })[];
    genetics: ({
        gene: {
            id: number;
            trait: string;
            createdAt: Date;
            updatedAt: Date;
            petId: number;
            geneType: ErisApiSdkPetInfoGeneticsGeneType;
            colorPart: ErisApiSdkPetInfoGeneticsColorPart;
        };
    } & {
        id: number;
        createdAt: Date;
        userPetId: number;
        geneId: number;
        inheritedFromParent1: boolean | null;
        inheritedFromParent2: boolean | null;
    })[];
    skills: ({
        skill: {
            id: number;
            name: string;
            createdAt: Date;
        };
    } & {
        id: number;
        xp: number;
        createdAt: Date;
        userPetId: number;
        skillId: number;
        level: number;
    })[];
};

export type ErisApiSdkPetInfoGeneticsGeneType = "DOMINANT" | "RECESSIVE" | "CODOMINANT" | "NEUTRAL";
export type ErisApiSdkPetInfoGeneticsColorPart = "EYE" | "COLOR1" | "COLOR2"

export type ErisApiSdkUserInfoGiveaways = {
    id: number;
    createdAt: Date;
    userId: string;
    giveawayId: number;
    isWinner: boolean;
}[]

export type ErisApiSdkCompany = {
    id: number;
    name: string;
    description: string | null;
    difficulty: number;
    experience: number;
    wage: number;
    expectations: ErisApiSdkCompanyExpectations;
}

export type ErisApiSdkCompanyExpectations = string[] | { level: number, skill: string }[];

export type ErisApiSdkUserInfoCooldown = {
    id: number;
    userId: string;
    name: string;
    timestamp: Date;
    willEndIn: Date;
}

export type ErisApiSdkUserInfoFishingRod = {
    id: number;
    createdAt: Date;
    userId: string;
    fishingRodId: number;
    durability: number;
}

export type ErisApiSdkUserInfoFish = {
    id: number;
    userId: string;
    createdAt: Date;
    fishId: number;
}

export type ErisApiSdkUserInfoStock = {
    id: number;
    userId: string;
    amount: number;
    stockId: number;
}

export type ErisApiSdkGiveawayConnectedGuild = {
    id: number;
    guildId: string;
    channelId: string;
    createdAt: Date;
    updatedAt: Date;
    messageId: string;
    giveawayId: number;
    isHost: boolean;
    blackListRoles: string[];
    xpRequired: number | null;
}

export type ErisApiSdkGiveawayInfo = ({
    participants: ErisApiSdkUserInfoGiveaways
    connectedGuilds: ErisApiSdkGiveawayConnectedGuild;
    roleEntries: {
        id: number;
        giveawayId: number;
        roleId: string;
        extraEntries: number;
    }[];
} & {
    id: number;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
    title: string;
    localId: number;
    ended: boolean;
    serverStayRequired: boolean;
    usersWins: number;
});

export type ErisApiError = { message: string; success: false; errors?: { path: string; message: string }[] };
export type ErisApiSdkUserInfoFull = ErisApiSdkUserInfo & {
    stocks: ErisApiSdkUserInfoStock[];
    fishs: ErisApiSdkUserInfoFish[];
    fishingRods: ErisApiSdkUserInfoFishingRod[];
    cooldowns: ErisApiSdkUserInfoCooldown[];
    company: ErisApiSdkCompany;
    giveaways: ErisApiSdkUserInfoGiveaways[];
    activePet: ErisApiSdkUserInfoPet | null;
    pets: ErisApiSdkUserInfoPet[];
    discord: ErisApiSdkError & any;
};

export type ErisApiSdkError = {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot: boolean;
    banner: string | null;
}
