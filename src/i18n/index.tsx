import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  defaultLocale,
  getLocaleMeta,
  isSupportedLocale,
  resolveLocale,
  supportedLocales,
} from "@/config/i18n-config"

export type Locale = string
export const localeOptions = supportedLocales

export const localeLabels = Object.fromEntries(
  supportedLocales.map((locale: Locale) => [locale, getLocaleMeta(locale).label]),
)

export const dateLocales = Object.fromEntries(
  supportedLocales.map((locale: Locale) => [locale, getLocaleMeta(locale).dateLocale]),
)

const translations = {
  zh: {
    app: {
      github: "GitHub 仓库",
      tagline: "从多个信息源获取最新内容，由 AI 生成摘要",
      footer: "Stay hungry. 😋",
    },
    sourceSwitcher: {
      select: "选择信息源",
      search: "搜索信息源...",
      empty: "未找到匹配的信息源",
      all: "全部",
      current: "当前",
    },
    feed: {
      emptyData: "数据为空，请检查数据源是否出错🫠",
      fetchError: "数据获取失败，请检查数据源是否出错🫠",
      sourceFallback: "信息源",
      updatedAt: "更新于",
      summary: "AI 摘要",
      original: "原文内容",
      summaryGeneratedByAi: "由 AI 生成的摘要：",
      summaryUnavailable: "无法生成摘要。",
      noContent: "无内容",
    },
    theme: {
      toggle: "切换主题",
      light: "亮色",
      dark: "暗色",
      system: "系统",
    },
    language: {
      toggle: "切换语言",
    },
    scrollToTop: {
      label: "返回顶部",
    },
  },
  en: {
    app: {
      github: "GitHub repository",
      tagline: "Get the latest updates from multiple sources, summarized by AI",
      footer: "Stay hungry. 😋",
    },
    sourceSwitcher: {
      select: "Select source",
      search: "Search sources...",
      empty: "No matching source found",
      all: "All",
      current: "Current",
    },
    feed: {
      emptyData: "No data found. Please check whether the source is working 🫠",
      fetchError: "Failed to fetch data. Please check whether the source is working 🫠",
      sourceFallback: "Source",
      updatedAt: "Updated at",
      summary: "AI Summary",
      original: "Original",
      summaryGeneratedByAi: "AI-generated summary:",
      summaryUnavailable: "Unable to generate summary.",
      noContent: "No content",
    },
    theme: {
      toggle: "Toggle theme",
      light: "Light",
      dark: "Dark",
      system: "System",
    },
    language: {
      toggle: "Switch language",
    },
    scrollToTop: {
      label: "Back to top",
    },
  },
} as const

export type I18nKey = string

function isLocale(value: string | null | undefined): value is Locale {
  return isSupportedLocale(value)
}

function getFromTranslations(locale: Locale, key: I18nKey): string {
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, translations[locale])

  if (typeof value === "string") {
    return value
  }

  const fallbackValue = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, translations[defaultLocale])

  return typeof fallbackValue === "string" ? fallbackValue : key
}

function readLocaleFromUrl(): Locale | null {
  return resolveLocale(new URLSearchParams(window.location.search).get("lang"))
}

function getInitialLocale(): Locale {
  const urlLocale = readLocaleFromUrl()
  if (urlLocale) {
    return urlLocale
  }

  const storedLocale = window.localStorage.getItem("feedme-locale")
  if (isLocale(storedLocale)) {
    return storedLocale
  }

  const browserLocales = window.navigator.languages?.length ? window.navigator.languages : [window.navigator.language]
  for (const browserLocale of browserLocales) {
    const resolvedLocale = resolveLocale(browserLocale)
    if (resolvedLocale) {
      return resolvedLocale
    }
  }

  return defaultLocale
}

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: I18nKey) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale())

  useEffect(() => {
    document.documentElement.lang = getLocaleMeta(locale).htmlLang
  }, [locale])

  useEffect(() => {
    const handlePopState = () => {
      const urlLocale = readLocaleFromUrl()
      if (urlLocale) {
        setLocaleState(urlLocale)
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale)
    window.localStorage.setItem("feedme-locale", nextLocale)

    const url = new URL(window.location.href)
    url.searchParams.set("lang", nextLocale)
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => getFromTranslations(locale, key),
    }),
    [locale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return value
}
