import { z } from "zod";

const sessionMessage = "Your session could not be verified. Open EaseCareer in a new tab, sign in, and try again.";

function responseMessage(response: Response) {
  if (response.redirected || response.type === "opaqueredirect" || response.status === 401 || response.status === 403) return sessionMessage;
  if (response.status === 408 || response.status === 504) return "The request timed out. Please try again.";
  if (response.status === 429) return "Too many requests. Wait a moment and try again.";
  if (response.status >= 500) return `The service is temporarily unavailable (HTTP ${response.status}). Please try again.`;
  if (!response.ok) return `The request could not be completed (HTTP ${response.status}). Please reload EaseCareer and try again.`;
  if (response.headers.get("Content-Type")?.includes("text/html")) return sessionMessage;
  return "The server returned an incomplete response. Please try again.";
}

export async function readApi<S extends z.ZodTypeAny>(response: Response, schema: S): Promise<z.output<S>> {
  if (response.redirected || response.type === "opaqueredirect") throw new Error(sessionMessage);
  let data: unknown;
  try {
    data = JSON.parse(await response.text());
  } catch {
    throw new Error(responseMessage(response));
  }
  if (!response.ok) {
    const error = z.object({ error: z.string().min(1).max(1000) }).safeParse(data);
    throw new Error(error.success ? error.data.error : responseMessage(response));
  }
  const result = schema.safeParse(data);
  if (!result.success) throw new Error("The server returned incomplete data. Please try again.");
  return result.data;
}
