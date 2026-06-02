export interface LocaleMeta {
  label: string;
  htmlLang: string;
  dateLocale: string;
  summaryLanguage: string;
}

export const defaultLocale: string;
export const locales: Record<string, LocaleMeta>;
export const supportedLocales: string[];

export function isSupportedLocale(locale: unknown): locale is string;
export function resolveLocale(locale: string | null | undefined): string | null;
export function getLocaleMeta(locale: string): LocaleMeta;
export function getLocalizedValue(
  values: Record<string, string> | null | undefined,
  locale: string,
  fallbackLocale?: string,
): string;
export function parseLocaleList(value: string | null | undefined, fallbackLocales?: string[]): string[];
