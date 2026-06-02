import { getSourceDataFilename } from "@/lib/source-data-path"
import type { FeedData } from "@/lib/types"

/**
 * 从静态数据文件加载RSS数据
 * 使用fetch从public/data目录加载JSON文件
 */
export async function loadFeedData(sourceUrl: string): Promise<FeedData | null> {
  try {
    // 获取当前HTML文档的基础路径
    // 使用pathname（去掉文件名，保留目录）
    const basePath = window.location.pathname.endsWith('/')
      ? window.location.pathname
      : window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)

    // 使用绝对路径从基础路径加载数据文件
    const dataUrl = `${basePath}data/${getSourceDataFilename(sourceUrl)}`

    try {
      const response = await fetch(dataUrl)

      if (!response.ok) {
        console.warn(`No data found for ${sourceUrl}`)
        return null
      }

      const data = await response.json()
      return data as FeedData
    } catch (error) {
      console.warn(`No data found for ${sourceUrl}`)
      return null
    }
  } catch (error) {
    console.error(`Error loading data for ${sourceUrl}:`, error)
    return null
  }
}
