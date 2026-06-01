export const sourceLocale = "zh-CN" as const;
export const supportedLocales = ["zh-CN", "en-US"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const userDictionary = {
  "zh-CN": {
    appName: "学伴图谱",
    searchPlaceholder: "搜索资料、笔记或图谱",
    noteReadModelMySQL: "笔记读取以 MySQL 为主",
    noteReadModelMongo: "笔记读取以 MongoDB 内容文档为主",
    releaseScope: "v1.0.0 覆盖 Web 主站、Web 后台与后端 API"
  },
  "en-US": {
    appName: "StudyMate",
    searchPlaceholder: "[en-US pending] Search materials, notes, or graphs",
    noteReadModelMySQL: "[en-US pending] Notes read from MySQL first",
    noteReadModelMongo: "[en-US pending] Notes read from MongoDB documents first",
    releaseScope: "[en-US pending] v1.0.0 covers the web app, admin, and backend API"
  }
} as const satisfies Record<SupportedLocale, Record<string, string>>;

export type UserDictionaryKey = keyof (typeof userDictionary)[typeof sourceLocale];

export function t(locale: SupportedLocale, key: UserDictionaryKey) {
  return userDictionary[locale][key] || userDictionary[sourceLocale][key];
}
