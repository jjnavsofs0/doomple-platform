import mammoth from "mammoth";
import path from "path";
import { pathToFileURL } from "url";
import { prisma } from "@/lib/prisma";
import { getOpenAIClient, isOpenAIConfigured } from "@/lib/openai";
import { reportOperationalIssue } from "@/lib/operational-issues";
import { slugify } from "@/lib/utils";

type CreateKnowledgeDocumentInput = {
  title: string;
  type: "TEXT" | "FILE";
  rawText?: string;
  url?: string | null;
  storageKey?: string | null;
  storageProvider?: string | null;
  mimeType?: string | null;
  size?: number | null;
  uploadedById?: string | null;
};

const CHATBOT_VECTOR_STORE_SETTING_KEY = "chatbot_vector_store";
const CHATBOT_VECTOR_STORE_NAME = "Doomple Chatbot Knowledge";

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTextForRetrieval(text: string) {
  return text.replace(/\u0000/g, "").trim();
}

function buildKnowledgeFileName(title: string) {
  return `${slugify(title) || "knowledge-document"}.md`;
}

function buildKnowledgeFileBody(title: string, rawText: string) {
  return `# ${title.trim()}\n\n${rawText.trim()}`;
}

async function readStoredVectorStoreId() {
  const envVectorStoreId = process.env.OPENAI_VECTOR_STORE_ID?.trim();
  if (envVectorStoreId) {
    return envVectorStoreId;
  }

  const row = await prisma.appSetting.findUnique({
    where: { key: CHATBOT_VECTOR_STORE_SETTING_KEY },
  });

  if (!row?.value || typeof row.value !== "object") {
    return "";
  }

  const value = row.value as { vectorStoreId?: unknown };
  return typeof value.vectorStoreId === "string" ? value.vectorStoreId.trim() : "";
}

async function persistVectorStoreId(vectorStoreId: string) {
  if (process.env.OPENAI_VECTOR_STORE_ID?.trim()) {
    return;
  }

  await prisma.appSetting.upsert({
    where: { key: CHATBOT_VECTOR_STORE_SETTING_KEY },
    update: {
      value: {
        vectorStoreId,
      },
      group: "communications",
      label: "Chatbot Vector Store",
      description: "OpenAI vector store used for chatbot knowledge retrieval.",
    },
    create: {
      key: CHATBOT_VECTOR_STORE_SETTING_KEY,
      group: "communications",
      label: "Chatbot Vector Store",
      description: "OpenAI vector store used for chatbot knowledge retrieval.",
      value: {
        vectorStoreId,
      },
    },
  });
}

export async function getChatbotVectorStore() {
  if (!isOpenAIConfigured()) {
    return null;
  }

  const vectorStoreId = await readStoredVectorStoreId();
  if (!vectorStoreId) {
    return null;
  }

  try {
    return await getOpenAIClient().vectorStores.retrieve(vectorStoreId);
  } catch (error) {
    await reportOperationalIssue({
      title: "Chatbot vector store could not be loaded",
      error,
      severity: "WARNING",
      area: "chatbot.vector-store.retrieve",
      metadata: {
        vectorStoreId,
      },
    });
    console.warn("Failed to load chatbot vector store:", error);
    return null;
  }
}

async function ensureChatbotVectorStoreId() {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI is not configured. Set OPENAI_API_KEY before indexing chatbot knowledge.");
  }

  const existingId = await readStoredVectorStoreId();
  if (existingId) {
    return existingId;
  }

  const client = getOpenAIClient();
  const vectorStore = await client.vectorStores.create({
    name: CHATBOT_VECTOR_STORE_NAME,
    expires_after: {
      anchor: "last_active_at",
      days: 30,
    },
  });

  await persistVectorStoreId(vectorStore.id);
  return vectorStore.id;
}

async function deleteOpenAIKnowledgeFile(openaiFileId?: string | null) {
  if (!openaiFileId || !isOpenAIConfigured()) {
    return;
  }

  try {
    await getOpenAIClient().files.delete(openaiFileId);
  } catch (error) {
    await reportOperationalIssue({
      title: "Chatbot knowledge file cleanup failed",
      error,
      severity: "WARNING",
      area: "chatbot.vector-store.delete-file",
      metadata: {
        openaiFileId,
      },
    });
    console.warn(`Failed to delete OpenAI file ${openaiFileId}:`, error);
  }
}

async function uploadKnowledgeToVectorStore(params: {
  title: string;
  rawText: string;
  previousOpenaiFileId?: string | null;
}) {
  const client = getOpenAIClient();
  const vectorStoreId = await ensureChatbotVectorStoreId();

  if (params.previousOpenaiFileId) {
    await deleteOpenAIKnowledgeFile(params.previousOpenaiFileId);
  }

  const fileName = buildKnowledgeFileName(params.title);
  const fileBody = buildKnowledgeFileBody(params.title, params.rawText);
  const file = new File([fileBody], fileName, {
    type: "text/markdown",
  });

  const uploadedFile = await client.files.create({
    file,
    purpose: "assistants",
  });

  try {
    const batch = await client.vectorStores.fileBatches.createAndPoll(vectorStoreId, {
      file_ids: [uploadedFile.id],
    });

    if (batch.status !== "completed" || batch.file_counts.failed > 0) {
      throw new Error("OpenAI could not finish indexing this knowledge document.");
    }

    return {
      openaiFileId: uploadedFile.id,
      openaiFilename: fileName,
      vectorStoreId,
    };
  } catch (error) {
    await deleteOpenAIKnowledgeFile(uploadedFile.id);
    throw error;
  }
}

export async function extractKnowledgeTextFromFile(params: {
  buffer: Buffer;
  fileName: string;
  mimeType?: string | null;
}) {
  const lowerName = params.fileName.toLowerCase();
  const mimeType = params.mimeType || "";

  if (
    mimeType.includes("text/") ||
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md") ||
    lowerName.endsWith(".csv") ||
    lowerName.endsWith(".json")
  ) {
    return params.buffer.toString("utf8");
  }

  if (mimeType.includes("text/html") || lowerName.endsWith(".html") || lowerName.endsWith(".htm")) {
    return stripHtml(params.buffer.toString("utf8"));
  }

  if (mimeType.includes("application/pdf") || lowerName.endsWith(".pdf")) {
    const pdfParseHref = pathToFileURL(
      path.join(
        process.cwd(),
        "node_modules",
        "pdf-parse",
        "dist",
        "pdf-parse",
        "cjs",
        "index.cjs"
      )
    ).href;
    const pdfParseNamespace = await import(
      /* webpackIgnore: true */
      pdfParseHref
    );
    const pdfParseModule = ("default" in pdfParseNamespace
      ? pdfParseNamespace.default
      : pdfParseNamespace) as {
      PDFParse: new (params: { data: Uint8Array }) => {
        getText: () => Promise<{ text: string }>;
        destroy?: () => Promise<void>;
      };
    };
    const { PDFParse } = pdfParseModule;

    const parser = new PDFParse({ data: new Uint8Array(params.buffer) });

    try {
      const parsed = await parser.getText();
      return parsed.text.trim();
    } finally {
      if (typeof parser.destroy === "function") {
        await parser.destroy();
      }
    }
  }

  if (
    mimeType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
    lowerName.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer: params.buffer });
    return result.value.trim();
  }

  throw new Error("Unsupported document type. Upload TXT, MD, HTML, CSV, JSON, PDF, or DOCX.");
}

export async function createKnowledgeDocument(input: CreateKnowledgeDocumentInput) {
  const baseSlug = slugify(input.title) || "knowledge-item";
  let slug = baseSlug;
  let duplicateIndex = 1;

  while (await prisma.chatbotKnowledgeDocument.findUnique({ where: { slug } })) {
    duplicateIndex += 1;
    slug = `${baseSlug}-${duplicateIndex}`;
  }

  return prisma.chatbotKnowledgeDocument.create({
    data: {
      title: input.title,
      slug,
      type: input.type,
      status: "PROCESSING",
      rawText: input.rawText || null,
      excerpt: input.rawText ? input.rawText.slice(0, 280) : null,
      url: input.url || null,
      storageKey: input.storageKey || null,
      storageProvider: input.storageProvider || null,
      mimeType: input.mimeType || null,
      size: input.size ?? null,
      uploadedById: input.uploadedById || null,
    },
  });
}

export async function indexKnowledgeDocument(documentId: string, rawText: string) {
  const cleanedText = normalizeTextForRetrieval(rawText);

  if (!cleanedText) {
    await prisma.chatbotKnowledgeDocument.update({
      where: { id: documentId },
      data: {
        status: "FAILED",
        excerpt: "No readable text could be extracted from this item.",
        rawText: null,
        openaiFileId: null,
        openaiFilename: null,
      },
    });
    return;
  }

  const document = await prisma.chatbotKnowledgeDocument.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      title: true,
      openaiFileId: true,
    },
  });

  if (!document) {
    throw new Error("Knowledge document not found.");
  }

  try {
    const uploaded = await uploadKnowledgeToVectorStore({
      title: document.title,
      rawText: cleanedText,
      previousOpenaiFileId: document.openaiFileId,
    });

    await prisma.chatbotKnowledgeChunk.deleteMany({
      where: { documentId },
    });

    await prisma.chatbotKnowledgeDocument.update({
      where: { id: documentId },
      data: {
        status: "READY",
        rawText: cleanedText,
        excerpt: cleanedText.slice(0, 280),
        openaiFileId: uploaded.openaiFileId,
        openaiFilename: uploaded.openaiFilename,
      },
    });
  } catch (error) {
    await prisma.chatbotKnowledgeDocument.update({
      where: { id: documentId },
      data: {
        status: "FAILED",
        openaiFileId: null,
        openaiFilename: null,
        excerpt:
          error instanceof Error
            ? error.message.slice(0, 280)
            : "The document could not be indexed in OpenAI vector storage.",
      },
    });
    throw error;
  }
}

export async function removeKnowledgeDocumentFromVectorStore(documentId: string) {
  const document = await prisma.chatbotKnowledgeDocument.findUnique({
    where: { id: documentId },
    select: {
      openaiFileId: true,
    },
  });

  await deleteOpenAIKnowledgeFile(document?.openaiFileId);
}

export async function getKnowledgeContext(query: string, limit = 6) {
  if (!isOpenAIConfigured()) {
    return [];
  }

  const vectorStore = await getChatbotVectorStore();
  if (!vectorStore?.id) {
    return [];
  }

  const response = await getOpenAIClient().vectorStores.search(vectorStore.id, {
    query,
    max_num_results: limit,
    rewrite_query: true,
    ranking_options: {
      ranker: "auto",
      score_threshold: 0.1,
    },
  });

  return response.data
    .flatMap((result) =>
      result.content
        .filter((entry) => entry.type === "text" && entry.text.trim())
        .map((entry, index) => ({
          id: `${result.file_id}-${index}`,
          title: result.filename.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "),
          content: entry.text.trim(),
          score: result.score,
        }))
    )
    .slice(0, limit);
}
