"use client"

import { useRouter, useSearchParams } from "@/hooks/use-navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { defaultSource, findSourceByUrl, getSourceName, getSourcesByCategory, type RssSource } from "@/config/rss-config"
import { useI18n } from "@/i18n"

export function SourceSwitcher() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSource = searchParams.get("source")
  const selectedSourceUrl = currentSource || defaultSource.url
  const { locale, t } = useI18n()

  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const categoryScrollRef = useRef<HTMLDivElement>(null)
  const categoryScrollLeftRef = useRef(0)
  const categoryScrollbarDragRef = useRef<{
    pointerId: number
    thumbOffsetX: number
  } | null>(null)
  const [isCategoryScrollbarDragging, setIsCategoryScrollbarDragging] = useState(false)
  const [isCategoryScrollbarVisible, setIsCategoryScrollbarVisible] = useState(false)
  const [categoryScroll, setCategoryScroll] = useState({
    clientWidth: 0,
    maxScroll: 0,
    scrollLeft: 0,
    scrollWidth: 0,
  })

  const syncCategoryScroll = useCallback(() => {
    const scrollElement = categoryScrollRef.current
    if (!scrollElement) {
      return
    }

    const nextScroll = {
      clientWidth: scrollElement.clientWidth,
      maxScroll: Math.max(0, scrollElement.scrollWidth - scrollElement.clientWidth),
      scrollLeft: scrollElement.scrollLeft,
      scrollWidth: scrollElement.scrollWidth,
    }

    categoryScrollLeftRef.current = nextScroll.scrollLeft

    setCategoryScroll((currentScroll) =>
      currentScroll.clientWidth === nextScroll.clientWidth &&
      currentScroll.maxScroll === nextScroll.maxScroll &&
      currentScroll.scrollLeft === nextScroll.scrollLeft &&
      currentScroll.scrollWidth === nextScroll.scrollWidth
        ? currentScroll
        : nextScroll,
    )
  }, [])

  const setCategoryScrollElement = useCallback(
    (scrollElement: HTMLDivElement | null) => {
      categoryScrollRef.current = scrollElement

      if (scrollElement) {
        scrollElement.scrollLeft = categoryScrollLeftRef.current
        syncCategoryScroll()
        requestAnimationFrame(syncCategoryScroll)
      }
    },
    [syncCategoryScroll],
  )

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setIsCategoryScrollbarDragging(false)
        setIsCategoryScrollbarVisible(false)
      }

      setOpen(nextOpen)
    },
    [],
  )

  const handleSelect = (source: RssSource) => {
    const params = new URLSearchParams(searchParams)
    params.set("source", source.url)
    params.set("lang", locale)
    // 使用当前页面路径，保留 basePath
    const currentPath = window.location.pathname
    router.push(`${currentPath}?${params.toString()}`)
    handleOpenChange(false)
  }

  const scrollCategoryToPointer = useCallback(
    (trackElement: HTMLDivElement, clientX: number, thumbOffsetX: number) => {
      const scrollElement = categoryScrollRef.current
      if (!scrollElement || categoryScroll.maxScroll <= 0) {
        return
      }

      const trackRect = trackElement.getBoundingClientRect()
      const thumbElement = trackElement.querySelector<HTMLElement>(".source-category-scrollbar-thumb")
      const thumbWidth = thumbElement?.getBoundingClientRect().width || trackRect.width
      const maxThumbLeft = Math.max(1, trackRect.width - thumbWidth)
      const thumbLeft = Math.min(
        maxThumbLeft,
        Math.max(0, clientX - trackRect.left - thumbOffsetX),
      )
      const progress = thumbLeft / maxThumbLeft
      scrollElement.scrollLeft = progress * categoryScroll.maxScroll
      syncCategoryScroll()
    },
    [categoryScroll.maxScroll, syncCategoryScroll],
  )

  const handleCategoryScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const scrollElement = categoryScrollRef.current
    if (!scrollElement || categoryScroll.maxScroll <= 0) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    setIsCategoryScrollbarDragging(true)

    const thumbElement = event.currentTarget.querySelector<HTMLElement>(".source-category-scrollbar-thumb")
    const thumbRect = thumbElement?.getBoundingClientRect()
    const isThumbTarget = event.target instanceof Element && event.target.closest(".source-category-scrollbar-thumb")
    const thumbOffsetX =
      isThumbTarget && thumbRect
        ? event.clientX - thumbRect.left
        : (thumbRect?.width || 0) / 2

    categoryScrollbarDragRef.current = {
      pointerId: event.pointerId,
      thumbOffsetX,
    }
    scrollCategoryToPointer(event.currentTarget, event.clientX, thumbOffsetX)
  }

  const handleCategoryScrollbarPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = categoryScrollbarDragRef.current
    if (!dragState || dragState.pointerId !== event.pointerId || !event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }

    scrollCategoryToPointer(event.currentTarget, event.clientX, dragState.thumbOffsetX)
  }

  const finishCategoryScrollbarPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    categoryScrollbarDragRef.current = null
    setIsCategoryScrollbarDragging(false)
    const regionElement = event.currentTarget.closest<HTMLElement>(".source-category-region")
    const regionRect = regionElement?.getBoundingClientRect()
    const pointerIsInRegion =
      !!regionRect &&
      event.clientX >= regionRect.left &&
      event.clientX <= regionRect.right &&
      event.clientY >= regionRect.top &&
      event.clientY <= regionRect.bottom

    setIsCategoryScrollbarVisible(pointerIsInRegion)
    event.currentTarget.blur()
  }

  const showCategoryScrollbar = useCallback(() => {
    setIsCategoryScrollbarVisible(true)
  }, [])

  const hideCategoryScrollbar = useCallback(() => {
    if (!isCategoryScrollbarDragging) {
      setIsCategoryScrollbarVisible(false)
    }
  }, [isCategoryScrollbarDragging])

  const handleCategoryScrollbarKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const scrollElement = categoryScrollRef.current
    if (!scrollElement || categoryScroll.maxScroll <= 0) {
      return
    }

    const step = 80
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      scrollElement.scrollLeft -= step
      syncCategoryScroll()
    }

    if (event.key === "ArrowRight") {
      event.preventDefault()
      scrollElement.scrollLeft += step
      syncCategoryScroll()
    }
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
  const canScrollCategories = categoryScroll.maxScroll > 1
  const categoryThumbWidth =
    categoryScroll.scrollWidth > 0
      ? Math.min(100, Math.max(16, (categoryScroll.clientWidth / categoryScroll.scrollWidth) * 100))
      : 100
  const categoryThumbLeft =
    canScrollCategories
      ? (categoryScroll.scrollLeft / categoryScroll.maxScroll) * (100 - categoryThumbWidth)
      : 0

  useLayoutEffect(() => {
    if (!open) {
      return
    }

    syncCategoryScroll()

    const scrollElement = categoryScrollRef.current
    if (!scrollElement || typeof ResizeObserver === "undefined") {
      return
    }

    const resizeObserver = new ResizeObserver(syncCategoryScroll)
    resizeObserver.observe(scrollElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [categoryEntries.length, locale, open, syncCategoryScroll])

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
            <div
              className="source-category-region"
              onMouseEnter={showCategoryScrollbar}
              onMouseLeave={hideCategoryScrollbar}
              onPointerEnter={showCategoryScrollbar}
              onPointerLeave={hideCategoryScrollbar}
            >
              <div
                ref={setCategoryScrollElement}
                className="source-category-scroll flex max-h-24 flex-wrap gap-1 overflow-y-auto md:max-h-none md:flex-nowrap md:overflow-x-auto md:overflow-y-hidden"
                onScroll={syncCategoryScroll}
              >
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
              {canScrollCategories && (
                <div
                  aria-label={t("sourceSwitcher.scrollCategories")}
                  aria-orientation="horizontal"
                  aria-valuemax={Math.round(categoryScroll.maxScroll)}
                  aria-valuemin={0}
                  aria-valuenow={Math.round(categoryScroll.scrollLeft)}
                  className="source-category-scrollbar"
                  data-dragging={isCategoryScrollbarDragging}
                  data-visible={isCategoryScrollbarVisible || isCategoryScrollbarDragging}
                  role="scrollbar"
                  tabIndex={0}
                  onKeyDown={handleCategoryScrollbarKeyDown}
                  onPointerDown={handleCategoryScrollbarPointerDown}
                  onPointerMove={handleCategoryScrollbarPointerMove}
                  onPointerCancel={finishCategoryScrollbarPointer}
                  onPointerUp={finishCategoryScrollbarPointer}
                >
                  <div
                    className="source-category-scrollbar-thumb"
                    style={{
                      left: `${categoryThumbLeft}%`,
                      width: `${categoryThumbWidth}%`,
                    }}
                  />
                </div>
              )}
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
