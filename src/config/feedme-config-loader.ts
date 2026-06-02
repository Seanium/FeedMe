import YAML from "yaml";

export interface LocalizedName {
  [locale: string]: string;
}

export interface RssSourceConfig {
  id: string;
  name: LocalizedName;
  url: string;
  category: string;
}

export interface RssCategoryConfig {
  name: LocalizedName;
}

export interface RuntimeFeedmeConfig {
  sources: RssSourceConfig[];
  maxItemsPerFeed: number;
  dataPath: string;
}

export interface SummaryConfig {
  contentMaxChars: number;
  temperature: number;
  maxTokens: number;
  unavailableMessages: LocalizedName;
  prompt: string;
}

export interface ParsedFeedmeConfig {
  categories: Record<string, RssCategoryConfig>;
  categoryOrder: string[];
  config: RuntimeFeedmeConfig;
  defaultSource: RssSourceConfig;
  summary: SummaryConfig;
}

export type ClientFeedmeConfig = Pick<
  ParsedFeedmeConfig,
  "categories" | "categoryOrder" | "config" | "defaultSource"
>;

const DEFAULT_MAX_ITEMS_PER_FEED = 30;
const DEFAULT_DATA_PATH = "./public/data";
const DEFAULT_SUMMARY_CONTENT_MAX_CHARS = 5000;
const DEFAULT_SUMMARY_TEMPERATURE = 0.3;
const DEFAULT_SUMMARY_MAX_TOKENS = 500;
const DEFAULT_SUMMARY_UNAVAILABLE_MESSAGES: LocalizedName = {
  zh: "无法生成摘要。",
  en: "Unable to generate summary.",
};
const DEFAULT_SUMMARY_PROMPT = `You are a professional content summarizer. Generate a concise and accurate summary in {{summaryLanguage}}.
The summary should:
1. Capture the main points and key information.
2. Be clear, fluent, and natural in {{summaryLanguage}}.
3. Stay around 100 words or fewer.
4. Remain objective and avoid adding opinions.
5. If the content is empty or lacks useful information, do not invent details.
6. If the source title or content is in another language, summarize the key information in {{summaryLanguage}}.

Article title:
{{title}}

Article content:
{{content}}
`;

export function parseFeedmeConfig(configText: string): ParsedFeedmeConfig {
  const parsed: unknown = YAML.parse(configText);
  return normalizeFeedmeConfig(parsed);
}

function normalizeFeedmeConfig(parsedConfig: unknown): ParsedFeedmeConfig {
  assertPlainObject(parsedConfig, "config");

  const settings = isPlainObject(parsedConfig.settings) ? parsedConfig.settings : {};
  const summary = normalizeSummaryConfig(parsedConfig.summary);
  const categoryList = assertArray(parsedConfig.categories, "categories");
  const sourceList = assertArray(parsedConfig.sources, "sources");

  const categories: Record<string, RssCategoryConfig> = {};
  const categoryOrder: string[] = [];
  const categoryIds = new Set<string>();

  for (const [index, category] of categoryList.entries()) {
    const path = `categories[${index}]`;
    assertPlainObject(category, path);

    const id = assertIdString(category.id, `${path}.id`);
    if (categoryIds.has(id)) {
      throw new Error(`Duplicate category id: ${id}`);
    }

    categoryIds.add(id);
    categoryOrder.push(id);
    categories[id] = {
      name: assertLocalizedName(category.name, `${path}.name`),
    };
  }

  const sources: RssSourceConfig[] = [];
  const sourceIds = new Set<string>();
  const sourceUrls = new Set<string>();

  for (const [index, source] of sourceList.entries()) {
    const path = `sources[${index}]`;
    assertPlainObject(source, path);

    const id = assertIdString(source.id, `${path}.id`);
    if (sourceIds.has(id)) {
      throw new Error(`Duplicate source id: ${id}`);
    }

    const url = assertUrlString(source.url, `${path}.url`);
    if (sourceUrls.has(url)) {
      throw new Error(`Duplicate source url: ${url}`);
    }

    const category = assertNonEmptyString(source.category, `${path}.category`);
    if (!categoryIds.has(category)) {
      throw new Error(`Source "${id}" references unknown category "${category}"`);
    }

    sourceIds.add(id);
    sourceUrls.add(url);
    sources.push({
      id,
      name: assertLocalizedName(source.name, `${path}.name`),
      url,
      category,
    });
  }

  if (sources.length === 0) {
    throw new Error("sources must contain at least one source");
  }

  const defaultSourceId = settings.defaultSource != null
    ? assertIdString(settings.defaultSource, "settings.defaultSource")
    : sources[0].id;

  const defaultSource = sources.find((source) => source.id === defaultSourceId);
  if (!defaultSource) {
    throw new Error(`settings.defaultSource references unknown source "${defaultSourceId}"`);
  }

  const maxItemsPerFeed = settings.maxItemsPerFeed ?? DEFAULT_MAX_ITEMS_PER_FEED;
  if (
    typeof maxItemsPerFeed !== "number" ||
    !Number.isInteger(maxItemsPerFeed) ||
    maxItemsPerFeed <= 0
  ) {
    throw new Error("settings.maxItemsPerFeed must be a positive integer");
  }

  const dataPath = settings.dataPath != null
    ? assertNonEmptyString(settings.dataPath, "settings.dataPath")
    : DEFAULT_DATA_PATH;

  return {
    categories,
    categoryOrder,
    config: {
      sources,
      maxItemsPerFeed,
      dataPath,
    },
    defaultSource,
    summary,
  };
}

function normalizeSummaryConfig(summaryConfig: unknown): SummaryConfig {
  const summary = isPlainObject(summaryConfig) ? summaryConfig : {};
  const contentMaxChars = summary.contentMaxChars ?? DEFAULT_SUMMARY_CONTENT_MAX_CHARS;
  const temperature = summary.temperature ?? DEFAULT_SUMMARY_TEMPERATURE;
  const maxTokens = summary.maxTokens ?? DEFAULT_SUMMARY_MAX_TOKENS;
  const unavailableMessages = summary.unavailableMessages != null
    ? assertLocalizedName(summary.unavailableMessages, "summary.unavailableMessages")
    : DEFAULT_SUMMARY_UNAVAILABLE_MESSAGES;
  const prompt = summary.prompt != null
    ? assertNonEmptyString(summary.prompt, "summary.prompt")
    : DEFAULT_SUMMARY_PROMPT;

  if (
    typeof contentMaxChars !== "number" ||
    !Number.isInteger(contentMaxChars) ||
    contentMaxChars <= 0
  ) {
    throw new Error("summary.contentMaxChars must be a positive integer");
  }

  if (
    typeof temperature !== "number" ||
    !Number.isFinite(temperature) ||
    temperature < 0 ||
    temperature > 2
  ) {
    throw new Error("summary.temperature must be a number between 0 and 2");
  }

  if (typeof maxTokens !== "number" || !Number.isInteger(maxTokens) || maxTokens <= 0) {
    throw new Error("summary.maxTokens must be a positive integer");
  }

  for (const placeholder of ["{{summaryLanguage}}", "{{title}}", "{{content}}"]) {
    if (!prompt.includes(placeholder)) {
      throw new Error(`summary.prompt must include ${placeholder}`);
    }
  }

  return {
    contentMaxChars,
    temperature,
    maxTokens,
    unavailableMessages,
    prompt,
  };
}

function assertArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${path} must be an array`);
  }

  return value;
}

function assertPlainObject(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new Error(`${path} must be an object`);
  }
}

function assertNonEmptyString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${path} must be a non-empty string`);
  }

  return value;
}

function assertIdString(value: unknown, path: string): string {
  const id = assertNonEmptyString(value, path);
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error(`${path} can only contain letters, numbers, underscores, and hyphens`);
  }

  return id;
}

function assertUrlString(value: unknown, path: string): string {
  const url = assertNonEmptyString(value, path);

  try {
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Unsupported protocol");
    }
  } catch {
    throw new Error(`${path} must be a valid http(s) URL`);
  }

  return url;
}

function assertLocalizedName(value: unknown, path: string): LocalizedName {
  assertPlainObject(value, path);

  const entries = Object.entries(value);
  if (entries.length === 0) {
    throw new Error(`${path} must contain at least one locale`);
  }

  return Object.fromEntries(
    entries.map(([locale, label]) => [locale, assertNonEmptyString(label, `${path}.${locale}`)]),
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
