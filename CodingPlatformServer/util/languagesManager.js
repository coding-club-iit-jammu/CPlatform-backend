const languagesTable = require('./languages-table');
const LanguagesManager = /** @class */ (function () {
    function LanguagesManager() {
    }
    LanguagesManager.getLanguageVersionIndex = function (lang, version) {
        if (this.isLangSupported(lang, version)) {
            var langEntrys = this.languagesMap.get(lang);
            var entry = langEntrys.find(function (lang) { return lang.version == version; });
            if (entry) {
                return entry.id;
            }
        }
    };
    LanguagesManager.isLangSupported = function (lang, version) {
        if (this.languagesMap.has(lang)) {
            var langEntrys = this.languagesMap.get(lang);
            return langEntrys.some(function (lang) { return lang.version == version; });
        }
        else {
            return false;
        }
    };
    LanguagesManager.getLanguagesMap = function () {
        return this.languagesMap;
    };
    LanguagesManager.languagesMap = new Map(languagesTable.languagesTable);
    return LanguagesManager;
}());
exports.LanguagesManager = LanguagesManager;