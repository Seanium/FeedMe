"use client"

import { Languages } from "lucide-react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { localeLabels, localeOptions, useI18n, type Locale } from "@/i18n"

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeFromPointerRef = useRef(false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button ref={triggerRef} variant="outline" size="icon" className="relative">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("language.toggle")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(event) => {
          if (!closeFromPointerRef.current) {
            return
          }

          event.preventDefault()
          triggerRef.current?.blur()
          closeFromPointerRef.current = false
        }}
      >
        {localeOptions.map((nextLocale: Locale) => (
          <DropdownMenuItem
            key={nextLocale}
            onPointerDown={() => {
              closeFromPointerRef.current = true
            }}
            onClick={() => setLocale(nextLocale)}
          >
            {localeLabels[nextLocale]}
            {locale === nextLocale && " ✓"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
