type ReportOperationalIssueParams = {
  title: string;
  error: unknown;
  severity?: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  source?: "CLIENT" | "SERVER" | "RENDER";
  route?: string | null;
  area?: string | null;
  method?: string | null;
  statusCode?: number | null;
  metadata?: Record<string, unknown> | null;
};

export async function reportOperationalIssue(params: ReportOperationalIssueParams) {
  try {
    const { getErrorMessage, getErrorStack, recordAppError } = await import("@/lib/app-error-log");
    await recordAppError({
      title: params.title,
      message: getErrorMessage(params.error),
      stack: getErrorStack(params.error),
      severity: params.severity || "WARNING",
      source: params.source || "SERVER",
      route: params.route || null,
      area: params.area || "operational-issue",
      method: params.method || null,
      statusCode: params.statusCode ?? null,
      metadata: params.metadata || null,
    });
  } catch {
    // Swallow secondary logging failures to keep operational issues non-fatal.
  }
}
