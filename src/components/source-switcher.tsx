"use client"

import { useRouter, useSearchParams } from "@/hooks/use-navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { getSourceName, getSourcesByCategory, findSourceByUrl } from "@/config/rss-config"
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
  const { locale, t } = useI18n()

  const [open, setOpen] = useState(false)

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

  // 查找当前源名称
  const currentSourceData = currentSource ? findSourceByUrl(currentSource) : undefined
  const currentSourceName = currentSourceData ? getSourceName(currentSourceData, locale) : t("sourceSwitcher.select")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full md:w-[300px] justify-between">
          {currentSourceName}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full md:w-[300px] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput placeholder={t("sourceSwitcher.search")} autoFocus={false} />
          <CommandList>
            <CommandEmpty>{t("sourceSwitcher.empty")}</CommandEmpty>
            {Object.entries(groupedSources).map(([category, group]) => {
              const { label, sources } = group as { label: string; sources: RssSource[] };
              return (
                <CommandGroup key={category} heading={label}>
                  {sources.map((source: RssSource) => {
                    const sourceName = getSourceName(source, locale)
                    return (
                      <CommandItem key={source.url} value={sourceName} onSelect={() => handleSelect(source)}>
                        <Check className={cn("mr-2 h-4 w-4", currentSource === source.url ? "opacity-100" : "opacity-0")} />
                        {sourceName}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
