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
};

type PetPersonality = {
    id: number;
    userPetId: number;
    traitId: number;
}

type Trait = {
    id: number;
    name: string;
    geneType: ErisApiSdkPetInfoGeneticsGeneType;
    personalityConflictNames: string[];
};

type PetGenetics = ({
    id: number;
    createdAt: Date;
    userPetId: number;
    geneId: number;
    inheritedFromParent1: boolean | null;
    inheritedFromParent2: boolean | null;
});

type Gene = {
    id: number;
    trait: string;
    createdAt: Date;
    updatedAt: Date;
    petId: number;
    geneType: ErisApiSdkPetInfoGeneticsGeneType;
    colorPart: ErisApiSdkPetInfoGeneticsColorPart;
};

type PetSkills = ({
    id: number;
    xp: number;
    createdAt: Date;
    userPetId: number;
    skillId: number;
    level: number;
})[];

type Skill = {
    id: number;
    name: string;
    createdAt: Date;
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

type UserFieldPetType = boolean | {
    skills?: boolean;
    genetics?: boolean;
    personality?: boolean;
    pet?: boolean;
}

export type ErisApiSdkUserFieldsType = {
    pets?: UserFieldPetType;
    activePet?: UserFieldPetType;
    giveaways?: boolean | {
        giveaway?: boolean;
    }
    stocks?: boolean;
    fishs?: boolean | {
        fish?: boolean;
    };
    fishingRods?: boolean | {
        fishingRod?: boolean;
    };
    cooldowns?: boolean;
    company?: boolean;
    bets?: boolean | {
        match?: boolean | {
            homeTeam?: boolean;
            awayTeam?: boolean;
        }
    }
}

export type ErisApiSdkFootballBet = {
    id: BigInt;
    matchId: BigInt;
    userId: String;

    amount: number;
    type: ErisApiSdkFootballBetType;
    odds: number;
    status: ErisApiSdkFootballBetStatus;

    quantity?: String    // Depois pode ser parseado para number

    createdAt: Date
    updatedAt: Date
}

export type ErisApiSdkFootballBetType = "HOME_WIN" | "DRAW" | "AWAY_WIN" | "EXACT_GOALS" | "GOALS_HOME" | "GOALS_AWAY"
export type ErisApiSdkFootballBetStatus = "PENDING" | "WON" | "LOST" | "CANCELED";

export type ErisApiSdkFootballMatch = {
    id: bigint;
    status: ErisApiSdkFootballMatchStatus;
    apiId: number;
    startAt: Date;
    homeTeamId: bigint;
    awayTeamId: bigint;
    competitionId: bigint;
    goalsHome: number | null;
    goalsAway: number | null;
    venue: string | null;
    oddsHomeWin: number | null;
    oddsDraw: number | null;
    oddsAwayWin: number | null;
};

export type ErisApiSdkFootballMatchStatus =
    | "SCHEDULED"
    | "LIVE"
    | "IN_PLAY"
    | "PAUSED"
    | "FINISHED"
    | "POSTPONED"
    | "SUSPENDED"
    | "CANCELED"
    | "AWARDED"

export type ErisApiSdkFootballTeam = {
    id: BigInt;
    name: string;
    apiId: bigint;
    venue: string;
    shortName: string;
    tla: string;
    crest: string;
    address: string;
    clubColors: string | null;
    areaId: number;
    points: number;
};

export interface ErisApiSdkUserInfoPossiblesFields {
    pets?: ErisApiSdkUserInfoPet & (
        | { skills: (PetSkills & { skill: Skill })[] }
        | { genetics: (PetGenetics & { gene: Gene })[] }
        | { personality: (PetPersonality & { trait: Trait })[] }
        | { pet: { id: number; createdAt: Date; name: string; flags: string[]; rarity: Rarity; price: number; animal: "CAT" | "DOG" | "BIRD" | "RABBIT" | "HAMSTER" | "DRAGON" | "LION" | "JAGUAR"; specie: string; isEnabled: boolean } }
    );
    activePet?: ErisApiSdkUserInfoPet & (
        | { skills: (PetSkills & { skill: Skill })[] }
        | { genetics: (PetGenetics & { gene: Gene })[] }
        | { personality: (PetPersonality & { trait: Trait })[] }
        | { pet: { id: number; createdAt: Date; name: string; flags: string[]; rarity: Rarity; price: number; animal: "CAT" | "DOG" | "BIRD" | "RABBIT" | "HAMSTER" | "DRAGON" | "LION" | "JAGUAR"; specie: string; isEnabled: boolean } }
    );
    giveaways?: ErisApiSdkUserInfoGiveaways[] & {
        giveaway?: Pick<ErisApiSdkGiveawayInfo, "id" | "localId" | "title" | "description" | "ended" | "serverStayRequired" | "usersWins" | "expiresAt" | "createdAt" | "updatedAt">;
    };
    company?: ErisApiSdkCompany;
    cooldowns?: ErisApiSdkUserInfoCooldown[];
    fishs?: (ErisApiSdkUserInfoFish & { fish?: { id: number; createdAt: Date; name: string; rarity: Rarity; price: number } })[];
    fishingRods?: (ErisApiSdkUserInfoFishingRod & { fishingRod?: { id: number; createdAt: Date; name: string; durability: number; price: number; rarity: Rarity } })[];
    stocks?: ErisApiSdkUserInfoStock[];
    bets?: (ErisApiSdkFootballBet & {
        match?: ErisApiSdkFootballMatch & {
            homeTeam?: ErisApiSdkFootballTeam;
            awayTeam?: ErisApiSdkFootballTeam;
        }
    })[];
}

type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

// === TIPOS BASE ===
type BaseUserInfo = ErisApiSdkUserInfo;

type BetsField<T> = (ErisApiSdkFootballBet & (
    T extends { match: infer M }
    ? M extends object
    ? {
        match: ErisApiSdkFootballMatch &
        ("homeTeam" extends keyof M
            ? M["homeTeam"] extends true
            ? { homeTeam: ErisApiSdkFootballTeam }
            : {}
            : {}) &
        ("awayTeam" extends keyof M
            ? M["awayTeam"] extends true
            ? { awayTeam: ErisApiSdkFootballTeam }
            : {}
            : {})
    }
    : { match?: ErisApiSdkFootballMatch }
    : {}
))[];
// === Campos com subcampos ===
type FieldWithSubfields<
    Subfields extends object,
    K extends string
> =
    K extends "pets" | "activePet" ? PetField<Subfields & UserFieldPetType> :
    K extends "fishs" ? FishField<Subfields> :
    K extends "fishingRods" ? FishingRodField<Subfields> :
    K extends "giveaways" ? GiveawayField<Subfields> :
    K extends "bets" ? BetsField<Subfields> :
    never;

// === PET FIELD ===
type PetField<T extends UserFieldPetType> = ErisApiSdkUserInfoPet & (
    T extends { skills: true } ? { skills: (PetSkills & { skill: Skill })[] } :
    T extends { genetics: true } ? { genetics: (PetGenetics & { gene: Gene })[] } :
    T extends { personality: true } ? { personality: (PetPersonality & { trait: Trait })[] } :
    T extends { pet: true } ? { pet: { id: number; createdAt: Date; name: string; flags: string[]; rarity: Rarity; price: number; animal: "CAT" | "DOG" | "BIRD" | "RABBIT" | "HAMSTER" | "DRAGON" | "LION" | "JAGUAR"; specie: string; isEnabled: boolean } } :
    {}
);

// === FISH FIELD ===
type FishField<T> = (ErisApiSdkUserInfoFish & (
    T extends { fish: true } ? { fish: { id: number; createdAt: Date; name: string; rarity: Rarity; price: number } } : {}
))[];

// === FISHING ROD FIELD ===
type FishingRodField<T> = (ErisApiSdkUserInfoFishingRod & (
    T extends { fishingRod: true } ? { fishingRod: { id: number; createdAt: Date; name: string; durability: number; price: number; rarity: Rarity } } : {}
))[];

// === GIVEAWAY FIELD ===
type GiveawayField<T> = ErisApiSdkUserInfoGiveaways[] & (
    T extends { giveaway: true }
    ? { giveaway: Pick<ErisApiSdkGiveawayInfo, "id" | "localId" | "title" | "description" | "ended" | "serverStayRequired" | "usersWins" | "expiresAt" | "createdAt" | "updatedAt"> }
    : {}
);

// === TIPO RELATIVO FINAL ===
export type RelativeUserInfo<T extends ErisApiSdkUserFieldsType | undefined = undefined> =
    T extends undefined
    ? BaseUserInfo
    : BaseUserInfo & {
        [K in keyof T & keyof ErisApiSdkUserInfoPossiblesFields]:
        T[K] extends true
        ? NonNullable<ErisApiSdkUserInfoPossiblesFields[K]>
        : T[K] extends object
        ? FieldWithSubfields<T[K], K & string>
        : never
    };