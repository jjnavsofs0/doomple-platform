import OpenAI from "openai";

function readEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

export function isOpenAIConfigured() {
  return Boolean(readEnv("OPENAI_API_KEY"));
}

export function getOpenAIChatModel() {
  return readEnv("OPENAI_CHAT_MODEL") || "gpt-5-mini";
}

export function getOpenAIEmbeddingModel() {
  return readEnv("OPENAI_EMBEDDING_MODEL") || "text-embedding-3-small";
}

let cachedClient: OpenAI | null = null;

export function getOpenAIClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = readEnv("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OpenAI is not configured. Set OPENAI_API_KEY in the environment.");
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}
