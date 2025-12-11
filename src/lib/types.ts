export interface FeedItem {
  title: string
  link?: string
  pubDate?: string
  isoDate?: string
  content?: string
  contentSnippet?: string
  creator?: string
  summary?: string
  enclosure?: {
    url: string
    type: string
  }
}

export interface Feed {
  title: string
  description: string
  link: string
  items: FeedItem[]
}

export interface FeedData {
  sourceUrl: string
  title: string
  description: string
  link: string
  items: FeedItem[]
  lastUpdated: string
}
