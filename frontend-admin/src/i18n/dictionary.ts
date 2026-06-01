export const sourceLocale = "zh-CN" as const;
export const supportedLocales = ["zh-CN", "en-US"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const adminDictionary = {
  "zh-CN": {
    appName: "StudyMate 管理后台",
    dashboard: "概览",
    moderation: "内容审核",
    audit: "审计日志",
    noteReadModel: "笔记读取策略",
    releaseGate: "v1 发布门禁"
  },
  "en-US": {
    appName: "StudyMate Admin",
    dashboard: "[en-US pending] Dashboard",
    moderation: "[en-US pending] Moderation",
    audit: "[en-US pending] Audit logs",
    noteReadModel: "[en-US pending] Note read model",
    releaseGate: "[en-US pending] v1 release gate"
  }
} as const satisfies Record<SupportedLocale, Record<string, string>>;

export type AdminDictionaryKey = keyof (typeof adminDictionary)[typeof sourceLocale];

export function t(locale: SupportedLocale, key: AdminDictionaryKey) {
  return adminDictionary[locale][key] || adminDictionary[sourceLocale][key];
}
