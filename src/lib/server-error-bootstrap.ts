import { getErrorMessage, getErrorStack, recordAppError } from "@/lib/app-error-log";

const globalForErrorLogging = globalThis as typeof globalThis & {
  __doompleServerErrorLoggingRegistered?: boolean;
  __doompleServerErrorLoggingActive?: boolean;
  __doompleUnhandledRejectionListener?: (reason: unknown) => void;
  __doompleUncaughtExceptionListener?: (error: Error) => void;
};

function normalizeValue(value: unknown) {
  if (value instanceof Error) {
    return value.message;
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

async function logServerError(params: {
  title: string;
  message: string;
  stack?: string | null;
  severity?: "ERROR" | "CRITICAL";
  area?: string;
  metadata?: Record<string, unknown>;
}) {
  if (globalForErrorLogging.__doompleServerErrorLoggingActive) {
    return;
  }

  globalForErrorLogging.__doompleServerErrorLoggingActive = true;

  try {
    await recordAppError({
      title: params.title,
      message: params.message,
      source: "SERVER",
      severity: params.severity || "ERROR",
      area: params.area || "server-runtime",
      stack: params.stack || null,
      metadata: params.metadata || null,
    });
  } catch {
    // Swallow secondary logging failures to avoid recursive console noise.
  } finally {
    globalForErrorLogging.__doompleServerErrorLoggingActive = false;
  }
}

function registerServerErrorLogging() {
  if (
    typeof window !== "undefined" ||
    globalForErrorLogging.__doompleServerErrorLoggingRegistered
  ) {
    return;
  }

  const originalConsoleError = console.error.bind(console);

  console.error = (...args: unknown[]) => {
    originalConsoleError(...args);

    const titleCandidate = typeof args[0] === "string" ? args[0] : "Server console error";
    const errorArg = args.find((arg) => arg instanceof Error) as Error | undefined;
    const title = String(titleCandidate || "Server console error").slice(0, 255);
    const message =
      errorArg?.message ||
      args.map((arg) => normalizeValue(arg)).join(" ").slice(0, 4000) ||
      "Unknown server error";
    const stack = errorArg?.stack || null;

    void logServerError({
      title,
      message,
      stack,
      severity: "ERROR",
      area: "console.error",
      metadata: {
        arguments: args.map((arg) => normalizeValue(arg)).slice(0, 8),
      },
    });
  };

  const unhandledRejectionListener = (reason: unknown) => {
    void logServerError({
      title: "Unhandled promise rejection",
      message: getErrorMessage(reason),
      stack: getErrorStack(reason),
      severity: "CRITICAL",
      area: "process.unhandledRejection",
    });
  };

  const uncaughtExceptionListener = (error: Error) => {
    void logServerError({
      title: "Uncaught server exception",
      message: getErrorMessage(error),
      stack: getErrorStack(error),
      severity: "CRITICAL",
      area: "process.uncaughtException",
    });
  };

  globalForErrorLogging.__doompleUnhandledRejectionListener = unhandledRejectionListener;
  globalForErrorLogging.__doompleUncaughtExceptionListener = uncaughtExceptionListener;

  process.on("unhandledRejection", unhandledRejectionListener);
  process.on("uncaughtException", uncaughtExceptionListener);

  globalForErrorLogging.__doompleServerErrorLoggingRegistered = true;
}

registerServerErrorLogging();

export {};
