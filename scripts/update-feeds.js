// 命令行脚本，用于更新所有RSS源数据
// 供GitHub Actions直接调用

// 加载.env文件中的环境变量
const path = require('path');
const fs = require('fs');
const dotenvPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(dotenvPath)) {
  const dotenvContent = fs.readFileSync(dotenvPath, 'utf8');
  dotenvContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.replace(/^"|"$/g, '');
      }
      process.env[key] = value;
    }
  });
  console.log('已从.env加载环境变量');
} else {
  // 尝试加载.env.local作为后备
  const localEnvPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(localEnvPath)) {
    const dotenvContent = fs.readFileSync(localEnvPath, 'utf8');
    dotenvContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.replace(/^"|"$/g, '');
        }
        process.env[key] = value;
      }
    });
    console.log('已从.env.local加载环境变量');
  } else {
    console.warn('未找到.env或.env.local文件，请确保环境变量已设置');
  }
}

const Parser = require('rss-parser');
const { OpenAI } = require('openai');

// 从配置文件中导入RSS源配置
const { config } = require('../config/rss-config.js');

// RSS解析器配置
const parser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "content"],
      ["dc:creator", "creator"],
      ["summary", "summary"], // 添加对 Atom feed 中 summary 标签的支持
    ],
  },
});

// 从环境变量中获取API配置
const OPENAI_API_KEY = process.env.LLM_API_KEY;
const OPENAI_API_BASE = process.env.LLM_API_BASE;
const OPENAI_MODEL_NAME = process.env.LLM_NAME;

// 验证必要的环境变量
if (!OPENAI_API_KEY) {
  console.error('环境变量LLM_API_KEY未设置，无法生成摘要');
  process.exit(1);
}

if (!OPENAI_API_BASE) {
  console.error('环境变量LLM_API_BASE未设置，无法生成摘要');
  process.exit(1);
}

if (!OPENAI_MODEL_NAME) {
  console.error('环境变量LLM_NAME未设置，无法生成摘要');
  process.exit(1);
}

// 创建OpenAI客户端
const openai = new OpenAI({
  baseURL: OPENAI_API_BASE,
  apiKey: OPENAI_API_KEY,
});

// 确保数据目录存在
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), config.dataPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

// 获取源的文件路径
function getSourceFilePath(sourceUrl) {
  const dataDir = ensureDataDir();
  // 使用URL的Base64编码作为文件名，避免非法字符
  const sourceHash = Buffer.from(sourceUrl).toString('base64').replace(/[/+=]/g, '_');
  return path.join(dataDir, `${sourceHash}.json`);
}

// 保存源数据到文件
async function saveFeedData(sourceUrl, data) {
  const filePath = getSourceFilePath(sourceUrl);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`保存数据 ${sourceUrl} 到 ${filePath}`);
  } catch (error) {
    console.error(`保存数据 ${sourceUrl} 时出错:`, error);
    throw new Error(`保存源数据失败: ${error.message}`);
  }
}

// 从文件加载源数据
function loadFeedData(sourceUrl) {
  const filePath = getSourceFilePath(sourceUrl);

  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`加载数据 ${sourceUrl} 时出错:`, error);
    return null;
  }
}

// 生成摘要函数
async function generateSummary(title, content) {
  try {
    // 确保 content 不为空
    const contentToClean = content || "";
    // 清理内容 - 移除HTML标签
    const cleanContent = contentToClean.replace(/<[^>]*>?/gm, "");

    // 准备提示词
    const prompt = `
你是一个专业的内容摘要生成器。请根据以下文章标题和内容，生成一个简洁、准确的中文摘要。
摘要应该：
1. 捕捉文章的主要观点和关键信息
2. 使用清晰、流畅的中文
3. 长度控制在100字左右
4. 保持客观，不添加个人观点
5. 如果文章内容为空或不包含有效信息，不要生成文章标题或内容未提及的无关内容。对非中文的标题进行翻译，不需要翻译中文的标题

文章标题：${title}

文章内容：
${cleanContent.slice(0, 5000)} // 限制内容长度以避免超出token限制
`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL_NAME,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    return completion.choices[0].message.content?.trim() || "无法生成摘要。";
  } catch (error) {
    console.error("生成摘要时出错:", error);
    return "无法生成摘要。AI 模型暂时不可用。";
  }
}

// 获取RSS源
async function fetchRssFeed(url) {
  try {
    // 直接解析RSS URL
    const feed = await parser.parseURL(url);

    // 处理items，确保所有对象都是可序列化的纯对象
    const serializedItems = feed.items.map(item => {
      // 创建新的纯对象
      const serializedItem = {
        title: item.title || "",
        link: item.link || "",
        pubDate: item.pubDate || "",
        isoDate: item.isoDate || "",
        // 优先使用 content，如果为空则尝试使用 summary（Atom feed），再尝试 contentSnippet
        content: item.content || item.summary || item.contentSnippet || "",
        contentSnippet: item.contentSnippet || "",
        creator: item.creator || "",
      };
      
      // 如果存在enclosure，以纯对象形式添加
      if (item.enclosure) {
        serializedItem.enclosure = {
          url: item.enclosure.url || "",
          type: item.enclosure.type || "",
        };
      }
      
      return serializedItem;
    });

    return {
      title: feed.title || "",
      description: feed.description || "",
      link: feed.link || "",
      items: serializedItems,
    };
  } catch (error) {
    console.error("获取RSS源时出错:", error);
    throw new Error(`获取RSS源失败: ${error.message}`);
  }
}

// 合并新旧数据，并找出需要生成摘要的新条目
function mergeFeedItems(oldItems = [], newItems = [], maxItems = config.maxItemsPerFeed) {
  // 创建一个Map来存储所有条目，使用链接作为键
  const itemsMap = new Map();

  // 添加旧条目到Map
  for (const item of oldItems) {
    if (item.link) {
      itemsMap.set(item.link, item);
    }
  }

  // 识别需要生成摘要的新条目
  const newItemsForSummary = [];

  // 添加新条目到Map，并标记需要生成摘要的条目
  for (const item of newItems) {
    if (item.link) {
      const existingItem = itemsMap.get(item.link);

      if (!existingItem) {
        // 这是一个新条目，需要生成摘要
        newItemsForSummary.push(item);
      }

      // 无论如何都更新Map，使用新条目（但保留旧摘要如果有的话）
      // 注意：item.summary 可能来自 Atom feed 的 <summary> 标签，这是原始内容，而不是我们生成的摘要
      // 为了避免混淆，将 Atom feed 的 summary 移动到 content 字段
      let generatedSummary = existingItem?.summary;
      
      // 如果 item 有 summary 但没有 content，这可能是 Atom feed 的情况
      if (!item.content && item.summary && !generatedSummary) {
        item.content = item.summary; // 将 Atom feed 的 summary 移动到 content
        item.summary = undefined; // 清除原始的 summary，避免与我们的生成摘要混淆
      }
      
      const serializedItem = {
        ...item,
        content: item.content || existingItem?.content || "",
        summary: generatedSummary || item.summary, // 保留已生成的摘要
      };
      
      itemsMap.set(item.link, serializedItem);
    }
  }

  // 将Map转换回数组，保持原始RSS源的顺序
  // 使用newItems的顺序作为基准
  const mergedItems = newItems
    .filter(item => item.link && itemsMap.has(item.link))
    .map(item => item.link ? itemsMap.get(item.link) : item)
    .slice(0, maxItems); // 只保留指定数量的条目

  return { mergedItems, newItemsForSummary };
}

// 更新单个源
async function updateFeed(sourceUrl) {
  console.log(`更新源: ${sourceUrl}`);

  try {
    // 获取现有数据
    const existingData = loadFeedData(sourceUrl);

    // 获取新数据
    const newFeed = await fetchRssFeed(sourceUrl);

    // 合并数据，找出需要生成摘要的新条目
    const { mergedItems, newItemsForSummary } = mergeFeedItems(
      existingData?.items || [],
      newFeed.items,
      config.maxItemsPerFeed,
    );

    console.log(`发现 ${newItemsForSummary.length} 条新条目，来自 ${sourceUrl}`);

    // 为新条目生成摘要
    const itemsWithSummaries = await Promise.all(
      mergedItems.map(async (item) => {
        // 如果是新条目且需要生成摘要
        if (newItemsForSummary.some((newItem) => newItem.link === item.link) && !item.summary) {
          try {
            // 确保使用任何可用的内容源 - content, item 本身的 summary 字段, 或 contentSnippet
            const contentForSummary = item.content || item.contentSnippet || "";
            const summary = await generateSummary(item.title, contentForSummary);
            return { ...item, summary };
          } catch (err) {
            console.error(`为条目 ${item.title} 生成摘要时出错:`, err);
            return { ...item, summary: "无法生成摘要。" };
          }
        }
        // 否则保持不变
        return item;
      }),
    );

    // 创建新的数据对象
    const updatedData = {
      sourceUrl,
      title: newFeed.title,
      description: newFeed.description,
      link: newFeed.link,
      items: itemsWithSummaries,
      lastUpdated: new Date().toISOString(),
    };

    // 保存到文件
    await saveFeedData(sourceUrl, updatedData);

    return updatedData;
  } catch (error) {
    console.error(`更新源 ${sourceUrl} 时出错:`, error);
    throw new Error(`更新源失败: ${error.message}`);
  }
}

// 更新所有源
async function updateAllFeeds() {
  console.log("开始更新所有RSS源");

  const results = {};

  for (const source of config.sources) {
    try {
      await updateFeed(source.url);
      results[source.url] = true;
    } catch (error) {
      console.error(`更新 ${source.url} 失败:`, error);
      results[source.url] = false;
    }
  }

  console.log("所有RSS源更新完成");
  return results;
}

// 主函数
async function main() {
  try {
    await updateAllFeeds();
    console.log("RSS数据更新成功");
    process.exit(0);
  } catch (error) {
    console.error("RSS数据更新失败:", error);
    process.exit(1);
  }
}

// 执行主函数
main(); 