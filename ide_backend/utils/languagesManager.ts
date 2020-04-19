import { Language, LanguageMap, languagesTable} from './languages-table'

export class LanguagesManager {
    private static languagesMap: LanguageMap = new Map<string, Language[]>(languagesTable);
    
    public static getLanguageVersionIndex(lang: string, version: string): string | undefined {
        if (this.isLangSupported(lang, version)) {
            const langEntrys = this.languagesMap.get(lang);
            const entry = langEntrys.find(lang => lang.version == version);
            if (entry) {
                return entry.index;
            }
        }
    }

    public static isLangSupported(lang: string, version: string): boolean {
        if (this.languagesMap.has(lang)) {
            const langEntrys = this.languagesMap.get(lang);
            return langEntrys.some(lang => lang.version == version);
        } else {
            return false;
        }
    }

    public static getLanguagesMap() {
        return this.languagesMap;
    }
}