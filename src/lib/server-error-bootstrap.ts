import { getErrorMessage, getErrorStack, recordAppError } from "@/lib/app-error-log";

const globalForErrorLogging = globalThis as typeof globalThis & {
  __doompleServerErrorLoggingRegistered?: boolean;
  __doompleServerErrorLoggingActive?: boolean;
  __doompleUnhandledRejectionListener?: (reason: unknown) => void;
  __doompleUncaughtExceptionListener?: (error: Error) => void;
  __doompleProcessWarningListener?: (warning: Error & { code?: string; name?: string }) => void;
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
  severity?: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
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

function isNodeDeprecationWarningMessage(value: unknown) {
  const text = normalizeValue(value);
  return (
    text.includes("DeprecationWarning") ||
    text.includes("[DEP0169]") ||
    text.includes("`url.parse()` behavior is not standardized")
  );
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

    if (args.some((arg) => isNodeDeprecationWarningMessage(arg))) {
      return;
    }

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

  const processWarningListener = (warning: Error & { code?: string; name?: string }) => {
    if (!isNodeDeprecationWarningMessage(warning.message) && warning.name !== "DeprecationWarning") {
      return;
    }

    void logServerError({
      title: `${warning.name || "Process warning"}${warning.code ? ` (${warning.code})` : ""}`,
      message: warning.message,
      stack: warning.stack || null,
      severity: "INFO",
      area: "process.warning",
      metadata: {
        code: warning.code || null,
        name: warning.name || null,
      },
    });
  };

  globalForErrorLogging.__doompleUnhandledRejectionListener = unhandledRejectionListener;
  globalForErrorLogging.__doompleUncaughtExceptionListener = uncaughtExceptionListener;
  globalForErrorLogging.__doompleProcessWarningListener = processWarningListener;

  process.on("unhandledRejection", unhandledRejectionListener);
  process.on("uncaughtException", uncaughtExceptionListener);
  process.on("warning", processWarningListener);

  globalForErrorLogging.__doompleServerErrorLoggingRegistered = true;
}

registerServerErrorLogging();

export {};
