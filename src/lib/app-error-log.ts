import { createHash } from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { notifyAdmins } from "@/lib/realtime";

export type AppErrorSeverityValue = "INFO" | "WARNING" | "ERROR" | "CRITICAL";
export type AppErrorSourceValue = "CLIENT" | "SERVER" | "RENDER";

type RecordAppErrorParams = {
  title: string;
  message: string;
  severity?: AppErrorSeverityValue;
  source?: AppErrorSourceValue;
  route?: string | null;
  area?: string | null;
  method?: string | null;
  statusCode?: number | null;
  stack?: string | null;
  metadata?: Record<string, unknown> | null;
  userId?: string | null;
};

type ToggleAppErrorResolutionParams = {
  id: string;
  isResolved: boolean;
  resolvedById?: string | null;
};

const ALERT_COOLDOWN_MS = 30 * 60 * 1000;

function normalizeText(value: unknown, fallback: string) {
  const text = String(value || "").trim();
  return text || fallback;
}

function buildFingerprint(params: {
  title: string;
  message: string;
  route?: string | null;
  source: AppErrorSourceValue;
  area?: string | null;
}) {
  return createHash("sha256")
    .update(
      [
        params.source,
        params.route || "",
        params.area || "",
        params.title,
        params.message.slice(0, 1000),
      ].join("::")
    )
    .digest("hex");
}

function getAlertRecipients() {
  const explicit = (process.env.APP_ERROR_ALERT_EMAILS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (explicit.length > 0) {
    return explicit;
  }

  const fallback = process.env.AWS_SES_REPLY_TO?.trim();
  return fallback ? [fallback] : [];
}

async function sendErrorAlertEmail(params: {
  title: string;
  message: string;
  severity: AppErrorSeverityValue;
  route?: string | null;
  source: AppErrorSourceValue;
  area?: string | null;
  statusCode?: number | null;
  occurrences: number;
  stack?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const recipients = getAlertRecipients();
  if (recipients.length === 0) return;

  const subject = `[Doomple ${params.severity === "CRITICAL" ? "Critical" : "Error"}] ${params.title}`;
  const metadataBlock = params.metadata
    ? JSON.stringify(params.metadata, null, 2)
    : "None";

  const text = [
    "A critical application error was recorded.",
    "",
    `Severity: ${params.severity}`,
    `Title: ${params.title}`,
    `Message: ${params.message}`,
    `Source: ${params.source}`,
    `Route: ${params.route || "Unknown"}`,
    `Area: ${params.area || "Unknown"}`,
    `Status code: ${params.statusCode ?? "N/A"}`,
    `Occurrences: ${params.occurrences}`,
    "",
    "Metadata:",
    metadataBlock,
    "",
    "Stack:",
    params.stack || "No stack trace available",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a">
      <h2 style="margin:0 0 16px">${params.severity === "CRITICAL" ? "Critical" : "Application"} error recorded</h2>
      <p><strong>Severity:</strong> ${params.severity}</p>
      <p><strong>Title:</strong> ${params.title}</p>
      <p><strong>Message:</strong> ${params.message}</p>
      <p><strong>Source:</strong> ${params.source}</p>
      <p><strong>Route:</strong> ${params.route || "Unknown"}</p>
      <p><strong>Area:</strong> ${params.area || "Unknown"}</p>
      <p><strong>Status code:</strong> ${params.statusCode ?? "N/A"}</p>
      <p><strong>Occurrences:</strong> ${params.occurrences}</p>
      <h3 style="margin-top:20px">Metadata</h3>
      <pre style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:8px">${metadataBlock}</pre>
      <h3 style="margin-top:20px">Stack</h3>
      <pre style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:8px">${params.stack || "No stack trace available"}</pre>
    </div>
  `;

  await sendTransactionalEmail({
    to: recipients,
    subject,
    html,
    text,
    replyTo: process.env.AWS_SES_REPLY_TO || undefined,
  });
}

export async function recordAppError(params: RecordAppErrorParams) {
  const severity = params.severity || "ERROR";
  const source = params.source || "SERVER";
  const title = normalizeText(params.title, "Application error");
  const message = normalizeText(params.message, "Unknown application error");
  const fingerprint = buildFingerprint({
    title,
    message,
    route: params.route || "",
    source,
    area: params.area || "",
  });

  const now = new Date();
  const existing = await prisma.appErrorLog.findUnique({
    where: { fingerprint },
  });

  const payload = {
    title,
    message,
    severity,
    source,
    route: params.route || null,
    area: params.area || null,
    method: params.method || null,
    statusCode: params.statusCode ?? null,
    stack: params.stack || null,
    metadata: (params.metadata || undefined) as Prisma.InputJsonValue | undefined,
    userId: params.userId || null,
  };

  const log = existing
    ? await prisma.appErrorLog.update({
        where: { fingerprint },
        data: {
          ...payload,
          occurrences: { increment: 1 },
          lastSeenAt: now,
          isResolved: false,
          resolvedAt: null,
        },
      })
    : await prisma.appErrorLog.create({
        data: {
          fingerprint,
          ...payload,
          firstSeenAt: now,
          lastSeenAt: now,
        },
      });

  const shouldAlert =
    (severity === "CRITICAL" || severity === "ERROR") &&
    (!log.lastAlertedAt ||
      now.getTime() - new Date(log.lastAlertedAt).getTime() > ALERT_COOLDOWN_MS);

  if (shouldAlert) {
    try {
      await notifyAdmins({
        title: severity === "CRITICAL" ? "Critical app error" : "Application error",
        message: `${title}${params.route ? ` on ${params.route}` : ""}`,
        type: "SYSTEM",
        link: "/admin/errors",
        topics: ["errors", "notifications", "dashboard"],
        metadata: {
          errorId: log.id,
          severity,
          route: params.route || null,
          area: params.area || null,
          statusCode: params.statusCode ?? null,
        },
      });

      await prisma.appErrorLog.update({
        where: { id: log.id },
        data: {
          lastAlertedAt: now,
        },
      });
    } catch (notificationError) {
      console.warn(
        "App error notification could not be delivered:",
        notificationError instanceof Error ? notificationError.message : notificationError
      );
    }

    try {
      await sendErrorAlertEmail({
        title,
        message,
        severity,
        route: params.route || null,
        source,
        area: params.area || null,
        statusCode: params.statusCode ?? null,
        occurrences: existing ? existing.occurrences + 1 : 1,
        stack: params.stack || null,
        metadata: params.metadata || null,
      });
    } catch (emailError) {
      console.warn(
        "Error alert email could not be sent:",
        emailError instanceof Error ? emailError.message : emailError
      );
    }
  }

  return log;
}

export async function setAppErrorResolution(
  params: ToggleAppErrorResolutionParams
) {
  return prisma.appErrorLog.update({
    where: { id: params.id },
    data: {
      isResolved: params.isResolved,
      resolvedAt: params.isResolved ? new Date() : null,
      resolvedById: params.isResolved ? params.resolvedById || null : null,
    },
  });
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error || "Unknown error");
}

export function getErrorStack(error: unknown) {
  return error instanceof Error ? error.stack || null : null;
}
