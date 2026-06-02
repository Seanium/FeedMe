"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useI18n } from "@/i18n"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeFromPointerRef = useRef(false)

  // 确保组件只在客户端渲染后才显示，避免服务器/客户端不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button ref={triggerRef} variant="outline" size="icon" className="relative">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t("theme.toggle")}</span>
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
        <DropdownMenuItem
          onPointerDown={() => {
            closeFromPointerRef.current = true
          }}
          onClick={() => setTheme("light")}
        >
          {t("theme.light")}
          {theme === "light" && " ✓"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onPointerDown={() => {
            closeFromPointerRef.current = true
          }}
          onClick={() => setTheme("dark")}
        >
          {t("theme.dark")}
          {theme === "dark" && " ✓"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onPointerDown={() => {
            closeFromPointerRef.current = true
          }}
          onClick={() => setTheme("system")}
        >
          {t("theme.system")}
          {theme === "system" && " ✓"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
