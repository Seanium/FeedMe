export interface LocaleMeta {
  label: string;
  htmlLang: string;
  dateLocale: string;
  summaryLanguage: string;
}

export const defaultLocale = "zh";

export const locales = {
  zh: {
    label: "中文",
    htmlLang: "zh-CN",
    dateLocale: "zh-CN",
    summaryLanguage: "Chinese",
  },
  en: {
    label: "English",
    htmlLang: "en",
    dateLocale: "en-US",
    summaryLanguage: "English",
  },
} as const satisfies Record<string, LocaleMeta>;

export type LocaleCode = keyof typeof locales;

export const supportedLocales = Object.keys(locales) as LocaleCode[];

export function isSupportedLocale(locale: unknown): locale is LocaleCode {
  return typeof locale === "string" && Object.prototype.hasOwnProperty.call(locales, locale);
}

export function resolveLocale(locale: string | null | undefined): LocaleCode | null {
  if (!locale) {
    return null;
  }

  if (isSupportedLocale(locale)) {
    return locale;
  }

  const languageCode = locale.toLowerCase().split(/[-_]/)[0];
  return isSupportedLocale(languageCode) ? languageCode : null;
}

export function getLocaleMeta(locale: string): LocaleMeta {
  return isSupportedLocale(locale) ? locales[locale] : locales[defaultLocale];
}

export function getLocalizedValue(
  values: Record<string, string> | null | undefined,
  locale: string,
  fallbackLocale = defaultLocale,
): string {
  if (!values || typeof values !== "object") {
    return "";
  }

  return values[locale] || values[fallbackLocale] || values[Object.keys(values)[0]] || "";
}

export function parseLocaleList(
  value: string | null | undefined,
  fallbackLocales: readonly string[] = supportedLocales,
): string[] {
  if (!value) {
    return [...fallbackLocales];
  }

  const parsedLocales = value
    .split(",")
    .map((locale) => resolveLocale(locale.trim()))
    .filter((locale): locale is LocaleCode => locale !== null);

  const uniqueLocales = [...new Set(parsedLocales)];
  return uniqueLocales.length > 0 ? uniqueLocales : [...fallbackLocales];
}
