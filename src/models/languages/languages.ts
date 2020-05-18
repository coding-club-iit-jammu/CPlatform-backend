export interface Language {
    lang: string;
    name: string;
    version: string;
    id: number;
}
export type LanguageTable = Iterable<[string, Language[]]>;
export type LanguageMap = Map<string, Language[]>;
export const languagesTable: LanguageTable = [
    [
        'python3', [
            { lang: 'python3', name: 'Python 3', version: '3.8.1', id: 71 }
        ]
    ],
    [
        'cpp14', [
            { lang: 'cpp14', name: 'C++', version: 'GCC 9.2.0', id: 54 }
        ]
    ],
    [
        'java', [
            { lang: 'java', name: 'Java', version: 'OpenJDK 13.0.1', id: 62 }
        ]
    ]
];