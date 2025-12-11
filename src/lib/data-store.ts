import { config } from "@/config/rss-config"
import type { FeedData, FeedItem } from "@/lib/types"

/**
 * 从静态数据文件加载RSS数据
 * 在Next.js静态导出模式下，通过动态导入JSON文件获取数据
 */
export async function loadFeedData(sourceUrl: string): Promise<FeedData | null> {
  try {
    // 使用URL的哈希作为文件名，与GitHub Actions中相同的逻辑
    const sourceHash = Buffer.from(sourceUrl).toString("base64").replace(/[/+=]/g, "_")
    
    // 动态导入数据文件
    // 注意：在静态构建时，这会被打包进输出文件
    try {
      const data = await import(`@/data/${sourceHash}.json`)
      return data.default as FeedData
    } catch (error) {
      console.warn(`No data found for ${sourceUrl}`)
      return null
    }
  } catch (error) {
    console.error(`Error loading data for ${sourceUrl}:`, error)
    return null
  }
}

/**
 * 获取所有缓存的RSS源URL
 */
export async function getAllCachedSources(): Promise<string[]> {
  // 从配置中获取所有源URL，因为我们无法动态检索文件系统
  return config.sources.map(source => source.url)
          }

/**
 * 合并新旧Feed条目
 * 注：此函数在客户端不使用，仅保留用于scripts/update-feeds.js
 */
export async function mergeFeedItems(
  oldItems: FeedItem[] = [],
  newItems: FeedItem[] = [],
  maxItems: number = config.maxItemsPerFeed,
): Promise<{
  mergedItems: FeedItem[]
  newItemsForSummary: FeedItem[]
}> {
  // 创建一个Map来存储所有条目，使用链接作为键
  const itemsMap = new Map<string, FeedItem>()

  // 添加旧条目到Map
  for (const item of oldItems) {
    if (item.link) {
      itemsMap.set(item.link, item)
    }
  }

  // 识别需要生成摘要的新条目
  const newItemsForSummary: FeedItem[] = []

  // 添加新条目到Map，并标记需要生成摘要的条目
  for (const item of newItems) {
    if (item.link) {
      const existingItem = itemsMap.get(item.link)

      if (!existingItem) {
        // 这是一个新条目，需要生成摘要
        newItemsForSummary.push(item)
      }

      // 无论如何都更新Map，使用新条目（但保留旧摘要如果有的话）
      const serializedItem: FeedItem = {
        ...item,
        summary: existingItem?.summary || item.summary,
      }
      
      // 确保enclosure是纯对象，防止序列化问题
      if (item.enclosure) {
        serializedItem.enclosure = {
          url: item.enclosure.url || "",
          type: item.enclosure.type || "",
        }
      }
      
      itemsMap.set(item.link, serializedItem)
    }
  }

  // 将Map转换回数组，但保持原始RSS源的顺序
  // 使用newItems的顺序作为基准，确保显示的是最新抓取的RSS源顺序
  const mergedItems = newItems
    .filter(item => item.link && itemsMap.has(item.link as string))
    .map(item => item.link ? itemsMap.get(item.link) as FeedItem : item)
    .slice(0, maxItems); // 只保留指定数量的条目

  return { mergedItems, newItemsForSummary }
}
