const MINIMUM_RECOMMENDED_VERSION = "0.2.8";

export function checkVersion(version: string) {
    if (version < MINIMUM_RECOMMENDED_VERSION) {
        console.warn(`⚠️ [ERIS API CLI WARN] Versão ${version} está obsoleta. Atualize para ${MINIMUM_RECOMMENDED_VERSION} ou superior.`);
    }
}