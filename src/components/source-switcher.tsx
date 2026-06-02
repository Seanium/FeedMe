"use client"

import { useRouter, useSearchParams } from "@/hooks/use-navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { defaultSource, getSourceName, getSourcesByCategory, findSourceByUrl } from "@/config/rss-config"
import { useI18n } from "@/i18n"

type RssSource = {
  url: string
  name: Record<string, string>
  category: string
}

export function SourceSwitcher() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSource = searchParams.get("source")
  const selectedSourceUrl = currentSource || defaultSource.url
  const { locale, t } = useI18n()

  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")

  const handleSelect = (source: RssSource) => {
    const params = new URLSearchParams(searchParams)
    params.set("source", source.url)
    params.set("lang", locale)
    // 使用当前页面路径，保留 basePath
    const currentPath = window.location.pathname
    router.push(`${currentPath}?${params.toString()}`)
    setOpen(false)
  }

  // 按类别分组源
  const groupedSources = getSourcesByCategory(locale)
  const categoryEntries = Object.entries(groupedSources) as Array<[
    string,
    {
      label: string
      sources: RssSource[]
    },
  ]>
  const visibleCategoryEntries =
    activeCategory === "all"
      ? categoryEntries
      : categoryEntries.filter(([category]) => category === activeCategory)

  // 查找当前源名称
  const currentSourceData = findSourceByUrl(selectedSourceUrl)
  const currentSourceName = currentSourceData ? getSourceName(currentSourceData, locale) : t("sourceSwitcher.select")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full md:w-[340px] justify-between">
          <span className="truncate">{currentSourceName}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[min(420px,calc(100vw-2rem))] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput placeholder={t("sourceSwitcher.search")} autoFocus={false} />
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">
            {t("sourceSwitcher.current")}: <span className="font-medium text-foreground">{currentSourceName}</span>
          </div>
          <div className="border-b px-2 py-2">
            <div className="source-scroll flex max-h-24 flex-wrap gap-1 overflow-y-auto pb-2 md:max-h-none md:flex-nowrap md:overflow-x-auto md:overflow-y-hidden">
              <Button
                type="button"
                variant={activeCategory === "all" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 shrink-0 px-2 text-xs"
                onClick={() => setActiveCategory("all")}
              >
                {t("sourceSwitcher.all")}
              </Button>
              {categoryEntries.map(([category, group]) => (
                <Button
                  key={category}
                  type="button"
                  variant={activeCategory === category ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 shrink-0 px-2 text-xs"
                  onClick={() => setActiveCategory(category)}
                >
                  {group.label}
                </Button>
              ))}
            </div>
          </div>
          <CommandList className="source-scroll max-h-[40vh] pr-1 md:max-h-[360px]">
            <CommandEmpty>{t("sourceSwitcher.empty")}</CommandEmpty>
            {visibleCategoryEntries.map(([category, group]) => {
              const { label, sources } = group
              return (
                <CommandGroup key={category} heading={activeCategory === "all" ? label : undefined}>
                  {sources.map((source: RssSource) => {
                    const sourceName = getSourceName(source, locale)
                    return (
                      <CommandItem key={source.url} value={`${sourceName} ${label}`} onSelect={() => handleSelect(source)}>
                        <Check className={cn("mr-2 h-4 w-4", selectedSourceUrl === source.url ? "opacity-100" : "opacity-0")} />
                        <span className="truncate">{sourceName}</span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
