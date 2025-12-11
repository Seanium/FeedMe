import type { FeedItem } from "./types"
import { loadFeedData } from "./data-store"

/**
 * 获取RSS源数据
 */
export async function fetchRssFeed(url: string) {
  try {
    // 从静态数据加载
    const cachedData = await loadFeedData(url)
    if (cachedData) {
      return cachedData
    }

    // 如果没有找到数据，返回适当的错误信息
    console.warn(`No data available for ${url}`)
    throw new Error(`数据为空，请检查数据源是否出错🫠`)
  } catch (error) {
    console.error("Error fetching RSS feed:", error)
    throw new Error(`获取RSS源失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}
