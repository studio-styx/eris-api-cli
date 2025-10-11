export type RequistionGenericType = {
    message: string;
    success: boolean;
}

export type UserLogsData = {
    data: UserLogs
}

export type UserLogs = {
    id: string;
    userId: string;
    message: string;
    type: "info";
    tags: string[];
    timestamp: Date;
}

export type StxApiTransactionResponse = {
    transactionId: number;
    success: true;
    message: "Transaction created";
    data: UserTransaction;
    botBalance: number;
}

export type UserTransaction = {
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
    status: TransactionStatus
}

export type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED"

export type UserInfo = {
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

export type UserInfoPet = {
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
            geneType: PetInfoGeneticsGeneType;
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
            geneType: PetInfoGeneticsGeneType;
            colorPart: PetInfoGeneticsColorPart;
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

export type PetInfoGeneticsGeneType = "DOMINANT" | "RECESSIVE" | "CODOMINANT" | "NEUTRAL";
export type PetInfoGeneticsColorPart = "EYE" | "COLOR1" | "COLOR2"

export type UserInfoGiveaways = {
    id: number;
    createdAt: Date;
    userId: string;
    giveawayId: number;
    isWinner: boolean;
}[]

export type ErisCliCompany = {
    id: number;
    name: string;
    description: string | null;
    difficulty: number;
    experience: number;
    wage: number;
    expectations: ErisCliCompanyExpectations;
}

export type ErisCliCompanyExpectations = string[] | { level: number, skill: string }[];

export type UserInfoCooldown = {
    id: number;
    userId: string;
    name: string;
    timestamp: Date;
    willEndIn: Date;
}

export type UserInfoFishingRod = {
    id: number;
    createdAt: Date;
    userId: string;
    fishingRodId: number;
    durability: number;
}

export type UserInfoFish = {
    id: number;
    userId: string;
    createdAt: Date;
    fishId: number;
}

export type UserInfoStock = {
    id: number;
    userId: string;
    amount: number;
    stockId: number;
}

export type ErisCliGiveawatConnectedGuild = {
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

export type ErisCliGiveawayInfo = ({
    participants: UserInfoGiveaways
    connectedGuilds: ErisCliGiveawatConnectedGuild;
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
export type UserInfoFull = UserInfo & {
    stocks: UserInfoStock[];
    fishs: UserInfoFish[];
    fishingRods: UserInfoFishingRod[];
    cooldowns: UserInfoCooldown[];
    company: ErisCliCompany;
    giveaways: UserInfoGiveaways[];
    activePet: UserInfoPet | null;
    pets: UserInfoPet[];
    discord: ErisCliDiscordUserGeneric & any;
};

export type ErisCliDiscordUserGeneric = {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot: boolean;
    banner: string | null;
}
