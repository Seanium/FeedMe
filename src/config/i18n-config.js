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
};

export const supportedLocales = Object.keys(locales);

export function isSupportedLocale(locale) {
  return typeof locale === "string" && Object.prototype.hasOwnProperty.call(locales, locale);
}

export function resolveLocale(locale) {
  if (!locale) {
    return null;
  }

  if (isSupportedLocale(locale)) {
    return locale;
  }

  const languageCode = locale.toLowerCase().split(/[-_]/)[0];
  return isSupportedLocale(languageCode) ? languageCode : null;
}

export function getLocaleMeta(locale) {
  return locales[locale] || locales[defaultLocale];
}

export function getLocalizedValue(values, locale, fallbackLocale = defaultLocale) {
  if (!values || typeof values !== "object") {
    return "";
  }

  return values[locale] || values[fallbackLocale] || values[Object.keys(values)[0]] || "";
}

export function parseLocaleList(value, fallbackLocales = supportedLocales) {
  if (!value) {
    return fallbackLocales;
  }

  const parsedLocales = value
    .split(",")
    .map((locale) => resolveLocale(locale.trim()))
    .filter(Boolean);

  return [...new Set(parsedLocales)].length > 0 ? [...new Set(parsedLocales)] : fallbackLocales;
}
