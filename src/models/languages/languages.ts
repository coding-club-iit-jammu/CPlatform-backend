export interface Language {
    lang: string;
    name: string;
    version: string;
    index: string;
}
export type LanguageTable = Iterable<[string, Language[]]>;
export type LanguageMap = Map<string, Language[]>;
export const languagesTable: LanguageTable = [
    [
        'python3', [
            { lang: 'python3', name: 'Python 3', version: '3.6.5', index: '2' }
        ]
    ],
    [
        'cpp14', [
            { lang: 'cpp14', name: 'C++ 14', version: 'g++ 14 GCC 9.1.0', index: '3'}
        ]
    ]
];