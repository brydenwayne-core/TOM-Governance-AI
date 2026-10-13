import type { Scenario, Report, HistoryItem, Source, Profile } from "./types";
export interface Connection {
  url: string;
  token: string;
}
export async function request<T>(
  c: Connection,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = new URL(c.url);
  if (
    url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    )
  )
    throw new Error("Use HTTPS for a remote backend.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 250000);
  try {
    const response = await fetch(`${c.url.replace(/\/$/, "")}/api${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...(c.token ? { Authorization: `Bearer ${c.token}` } : {}),
        ...init.headers,
      },
    });
    if (!response.ok) {
      let detail = "Request failed";
      try {
        detail = (await response.json()).detail || detail;
      } catch {
        /* response may not be JSON */
      }
      throw new Error(
        `${response.status}: ${typeof detail === "string" ? detail : "Check the scenario fields."}`,
      );
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}
export const api = {
  profiles: (c: Connection) => request<Profile[]>(c, "/advisors"),
  documents: (c: Connection) => request<Source[]>(c, "/documents"),
  history: (c: Connection) => request<HistoryItem[]>(c, "/decisions"),
  report: (c: Connection, id: string) =>
    request<Report>(c, `/decisions/${encodeURIComponent(id)}`),
  run: (c: Connection, scenario: Scenario) =>
    request<Report>(c, "/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scenario),
    }),
  upload: (c: Connection, file: File, metadata: string) => {
    const body = new FormData();
    body.append("file", file);
    if (metadata.trim()) body.append("metadata", metadata);
    return request<Source>(c, "/documents", { method: "POST", body });
  },
};
export function download(report: Report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tom-advisory-${report.id}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
