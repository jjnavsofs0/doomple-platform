import { Prisma } from "@prisma/client";
import mammoth from "mammoth";
import { prisma } from "@/lib/prisma";
import { getOpenAIClient, getOpenAIEmbeddingModel, isOpenAIConfigured } from "@/lib/openai";
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

const MAX_CHUNK_LENGTH = 1200;
const CHUNK_OVERLAP = 150;

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function chunkText(text: string) {
  const normalized = text.replace(/\r/g, "").trim();
  if (!normalized) return [];

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs.length ? paragraphs : [normalized]) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length <= MAX_CHUNK_LENGTH) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
    }

    if (paragraph.length <= MAX_CHUNK_LENGTH) {
      current = paragraph;
      continue;
    }

    let start = 0;
    while (start < paragraph.length) {
      const next = paragraph.slice(start, start + MAX_CHUNK_LENGTH).trim();
      if (next) {
        chunks.push(next);
      }
      start += MAX_CHUNK_LENGTH - CHUNK_OVERLAP;
    }
    current = "";
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

async function embedTexts(values: string[]) {
  if (!values.length || !isOpenAIConfigured()) {
    return values.map(() => null);
  }

  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: getOpenAIEmbeddingModel(),
    input: values,
  });

  return response.data.map((item) => item.embedding);
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

  if (
    mimeType.includes("application/pdf") ||
    lowerName.endsWith(".pdf")
  ) {
    const pdfParseModule = await import("pdf-parse");
    const parser = "default" in pdfParseModule ? pdfParseModule.default : pdfParseModule;
    const pdfParse = parser as (buffer: Buffer) => Promise<{ text: string }>;
    const parsed = await pdfParse(params.buffer);
    return parsed.text.trim();
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

  const document = await prisma.chatbotKnowledgeDocument.create({
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

  return document;
}

export async function indexKnowledgeDocument(documentId: string, rawText: string) {
  const cleanedText = rawText.replace(/\u0000/g, "").trim();

  if (!cleanedText) {
    await prisma.chatbotKnowledgeDocument.update({
      where: { id: documentId },
      data: {
        status: "FAILED",
        excerpt: "No readable text could be extracted from this item.",
        rawText: null,
      },
    });
    return;
  }

  const chunks = chunkText(cleanedText);
  const embeddings = await embedTexts(chunks);

  await prisma.$transaction(async (tx) => {
    await tx.chatbotKnowledgeChunk.deleteMany({
      where: { documentId },
    });

    if (chunks.length > 0) {
      await tx.chatbotKnowledgeChunk.createMany({
        data: chunks.map((content, index) => ({
          documentId,
          content,
          chunkIndex: index,
          embedding: embeddings[index]
            ? (embeddings[index] as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        })),
      });
    }

    await tx.chatbotKnowledgeDocument.update({
      where: { id: documentId },
      data: {
        status: "READY",
        rawText: cleanedText,
        excerpt: cleanedText.slice(0, 280),
      },
    });
  });
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < a.length && index < b.length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }

  if (!normA || !normB) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function keywordScore(query: string, text: string) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2);

  if (!terms.length) {
    return 0;
  }

  const haystack = text.toLowerCase();
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

export async function getKnowledgeContext(query: string, limit = 6) {
  const chunks = await prisma.chatbotKnowledgeChunk.findMany({
    include: {
      document: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
    where: {
      document: {
        status: "READY",
      },
    },
    take: 400,
  });

  if (!chunks.length) {
    return [];
  }

  let queryEmbedding: number[] | null = null;
  if (isOpenAIConfigured()) {
    const embedded = await embedTexts([query]);
    queryEmbedding = embedded[0] || null;
  }

  const ranked = chunks
    .map((chunk) => {
      const embedding = Array.isArray(chunk.embedding)
        ? (chunk.embedding as unknown[]).map((entry) => Number(entry))
        : null;
      const vectorScore =
        queryEmbedding && embedding?.length ? cosineSimilarity(queryEmbedding, embedding) : 0;
      const textScore = keywordScore(query, chunk.content);

      return {
        id: chunk.id,
        title: chunk.document.title,
        content: chunk.content,
        score: vectorScore * 0.8 + textScore * 0.2,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter((item) => item.score > 0);

  return ranked;
}
