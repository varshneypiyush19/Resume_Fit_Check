import { TailoredResumeResponse } from "@/types/resume";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function tailorResume(
  file: File,
  jobDescription: string
): Promise<TailoredResumeResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription);

  const response = await fetch(`${API_BASE_URL}/api/tailor`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Failed to customize resume";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = `Server error (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function tailorResumeStream(
  file: File,
  jobDescription: string,
  onStatus?: (stage: string) => void,
  onToken?: (token: string) => void
): Promise<TailoredResumeResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription);

  const response = await fetch(`${API_BASE_URL}/api/tailor-stream`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Failed to customize resume";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = `Server error (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    return tailorResume(file, jobDescription);
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let finalResult: TailoredResumeResponse | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const evtBlock of events) {
      if (!evtBlock.trim()) continue;
      const lines = evtBlock.split("\n");
      let eventType = "message";
      let dataStr = "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventType = line.replace("event:", "").trim();
        } else if (line.startsWith("data:")) {
          dataStr = line.replace("data:", "").trim();
        }
      }

      if (eventType === "status" && onStatus && dataStr) {
        try {
          const parsed = JSON.parse(dataStr);
          onStatus(parsed.stage);
        } catch {}
      } else if (eventType === "token" && onToken && dataStr) {
        try {
          const parsed = JSON.parse(dataStr);
          onToken(parsed.chunk);
        } catch {}
      } else if (eventType === "complete" && dataStr) {
        try {
          finalResult = JSON.parse(dataStr);
        } catch (e) {
          console.error("Failed to parse completion payload:", e);
        }
      } else if (eventType === "error" && dataStr) {
        try {
          const parsed = JSON.parse(dataStr);
          throw new Error(parsed.error);
        } catch {
          throw new Error(dataStr || "Streaming error occurred.");
        }
      }
    }
  }

  if (!finalResult) {
    return tailorResume(file, jobDescription);
  }

  return finalResult;
}
