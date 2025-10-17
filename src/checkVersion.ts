import axios from "axios";

let lastChecked: number | null = null;
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas

type ErisCliApiHomeResponse = {
    message: `🍃 Online on discord as Éris`;
    guilds: number;
    users: number;
    version: string;
    sdk: {
        version: {
            latest: string;
            minimalRequired: string;
        };
    };
};

export async function checkVersion(currentVersion: string): Promise<void> {
    if (lastChecked && Date.now() - lastChecked < CHECK_INTERVAL) {
        return; // Evita verificar novamente dentro do intervalo
    }
    lastChecked = Date.now();

    try {
        const response = await axios.get("https://apieris.squareweb.app/");
        const data = response.data as ErisCliApiHomeResponse;

        // Valida a resposta da API
        if (!data?.sdk?.version?.minimalRequired || !data?.sdk?.version?.latest) {
            console.error("[ERIS API CLI ERROR] Resposta da API inválida ao verificar atualizações");
            return;
        }

        const minimalRequired = data.sdk.version.minimalRequired;

        if (currentVersion < minimalRequired) {
            console.warn(
                `⚠️ [ERIS API CLI WARN] Versão ${currentVersion} está obsoleta. Atualize para ${data.sdk.version.latest} ou superior com: npm install @studiostyx/erisbot-cli@latest. Veja as novidades em: https://github.com/studiostyx/erisbot-cli/releases`
            );
        }
    } catch (error: any) {
        console.error(`[ERIS API CLI ERROR] Falha ao verificar atualizações: ${error.message}`);
    }
}