import { SAM_AI_INSTRUCTIONS } from "@/lib/sam-ai-instructions";

const OPENAI_BASE_URL = "https://api.openai.com/v1";
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const MAX_OUTPUT_TOKENS = Number.parseInt(process.env.OPENAI_MAX_OUTPUT_TOKENS || "450", 10);
const MAX_RESPONSE_WORDS = Number.parseInt(process.env.SAM_MAX_RESPONSE_WORDS || "300", 10);

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;
const MAX_THREADS_PER_DAY = 10;
const MAX_MESSAGE_LENGTH = 500;
const TOKEN_EXPIRY = 5 * 60 * 1000;

type ChatRequestBody = {
  action?: unknown;
  honeypot?: unknown;
  message?: unknown;
  seqToken?: unknown;
  threadId?: unknown;
};

type RateLimitEntry = {
  count: number;
  dailyThreads: number;
  dayStart: number;
  timestamp: number;
};

type SequentialTokenEntry = {
  timestamp: number;
  token: string;
};

type OpenAIErrorBody = {
  error?: {
    code?: string;
    message?: string;
    type?: string;
  };
};

type OpenAIStreamEvent = {
  delta?: string;
  error?: {
    message?: string;
    type?: string;
  };
  type?: string;
};

type OpenAIConversation = {
  id?: unknown;
};

type OpenAIAssistant = {
  tool_resources?: {
    file_search?: {
      vector_store_ids?: unknown[];
    };
  };
};

const rateLimitMap = new Map<string, RateLimitEntry>();
const tokenMap = new Map<string, SequentialTokenEntry>();

let discoveredVectorStoreId: string | null | undefined;

function generateToken() {
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function getDayStart() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

function setNextToken(threadId: string) {
  const token = generateToken();
  tokenMap.set(threadId, { timestamp: Date.now(), token });

  if (tokenMap.size > 5000) {
    const now = Date.now();
    for (const [id, data] of tokenMap) {
      if (now - data.timestamp > TOKEN_EXPIRY) {
        tokenMap.delete(id);
      }
    }
  }

  return token;
}

function validateSequentialToken(threadId: string, token: unknown) {
  if (!tokenMap.has(threadId)) {
    return { valid: true };
  }

  const stored = tokenMap.get(threadId);
  if (!stored) {
    return { valid: true };
  }

  if (Date.now() - stored.timestamp > TOKEN_EXPIRY) {
    tokenMap.delete(threadId);
    return { reason: "expired", valid: false };
  }

  if (typeof token !== "string" || stored.token !== token) {
    return { reason: "invalid", valid: false };
  }

  return { valid: true };
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string, isThreadCreation: boolean) {
  const now = Date.now();
  const dayStart = getDayStart();

  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap) {
      if (now - value.timestamp > RATE_LIMIT_WINDOW * 10) {
        rateLimitMap.delete(key);
      }
    }
  }

  const existing = rateLimitMap.get(ip);
  if (!existing) {
    rateLimitMap.set(ip, {
      count: 1,
      dailyThreads: isThreadCreation ? 1 : 0,
      dayStart,
      timestamp: now,
    });
    return { allowed: true };
  }

  if (existing.dayStart !== dayStart) {
    existing.dailyThreads = 0;
    existing.dayStart = dayStart;
  }

  if (isThreadCreation && existing.dailyThreads >= MAX_THREADS_PER_DAY) {
    return { allowed: false, reason: "daily_limit" };
  }

  if (now - existing.timestamp > RATE_LIMIT_WINDOW) {
    existing.count = 1;
    existing.timestamp = now;
    if (isThreadCreation) {
      existing.dailyThreads += 1;
    }
    return { allowed: true };
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      reason: "rate_limit",
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - existing.timestamp)) / 1000),
    };
  }

  existing.count += 1;
  if (isThreadCreation) {
    existing.dailyThreads += 1;
  }

  return { allowed: true };
}

function extractRequestedWordCount(message: string) {
  const match = message.match(/(\d{1,3}(?:,\d{3})?)\s*(?:word|words)\b/i);
  if (!match) {
    return null;
  }

  const value = Number.parseInt(match[1].replace(/,/g, ""), 10);
  return Number.isFinite(value) ? value : null;
}

function validateInput(body: ChatRequestBody) {
  if (body.message !== undefined) {
    if (typeof body.message !== "string" || body.message.trim().length === 0) {
      return { error: "Message cannot be empty", valid: false };
    }

    if (body.message.length > MAX_MESSAGE_LENGTH) {
      return { error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`, valid: false };
    }
  }

  if (
    body.threadId &&
    (typeof body.threadId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(body.threadId))
  ) {
    return { error: "Invalid conversation ID", valid: false };
  }

  return { valid: true };
}

function getAllowedOrigins(request: Request) {
  const sameOrigin = new URL(request.url).origin;
  const configured = (process.env.SAM_CHAT_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([
    sameOrigin,
    "https://www.sam-murgatroyd.co.uk",
    "https://sam-murgatroyd.co.uk",
    "https://www.sam-mugatroyd.co.uk",
    "https://sam-mugatroyd.co.uk",
    ...configured,
  ]);
}

function isLocalOrigin(origin: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  return getAllowedOrigins(request).has(origin) || isLocalOrigin(origin);
}

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (origin && isAllowedOrigin(request)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }

  return headers;
}

function jsonResponse(request: Request, body: unknown, status = 200, extraHeaders?: HeadersInit) {
  return Response.json(body, {
    headers: {
      ...corsHeaders(request),
      ...extraHeaders,
    },
    status,
  });
}

function openAIHeaders(betaAssistants = false) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  };

  if (betaAssistants) {
    headers["OpenAI-Beta"] = "assistants=v2";
  }

  return headers;
}

async function readOpenAIError(response: Response) {
  try {
    const body = (await response.json()) as OpenAIErrorBody;
    return body.error?.message || body.error?.type || `OpenAI request failed with ${response.status}`;
  } catch {
    return `OpenAI request failed with ${response.status}`;
  }
}

function getNetworkErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "OpenAI network request failed";
  }

  const cause = error.cause as { code?: unknown; message?: unknown } | undefined;
  const code = typeof cause?.code === "string" ? cause.code : undefined;
  const causeMessage = typeof cause?.message === "string" ? cause.message : undefined;

  if (code) {
    return `OpenAI network request failed (${code})`;
  }

  if (causeMessage) {
    return `OpenAI network request failed (${causeMessage})`;
  }

  return `OpenAI network request failed (${error.message})`;
}

async function openAIJson<T>(path: string, init: RequestInit = {}, betaAssistants = false): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${OPENAI_BASE_URL}${path}`, {
      ...init,
      headers: openAIHeaders(betaAssistants),
    });
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error));
  }

  if (!response.ok) {
    throw new Error(await readOpenAIError(response));
  }

  return (await response.json()) as T;
}

async function resolveVectorStoreId() {
  if (VECTOR_STORE_ID) {
    return VECTOR_STORE_ID;
  }

  if (discoveredVectorStoreId !== undefined) {
    return discoveredVectorStoreId;
  }

  if (!ASSISTANT_ID) {
    discoveredVectorStoreId = null;
    return null;
  }

  try {
    const assistant = await openAIJson<OpenAIAssistant>(`/assistants/${ASSISTANT_ID}`, {}, true);
    const id = assistant.tool_resources?.file_search?.vector_store_ids?.[0];
    discoveredVectorStoreId = typeof id === "string" ? id : null;
  } catch (error) {
    console.warn("Could not retrieve assistant vector store:", error);
    discoveredVectorStoreId = null;
  }

  return discoveredVectorStoreId;
}

function encodeSse(payload: unknown) {
  return `data: ${typeof payload === "string" ? payload : JSON.stringify(payload)}\n\n`;
}

function sendSse(controller: ReadableStreamDefaultController<Uint8Array>, payload: unknown) {
  controller.enqueue(new TextEncoder().encode(encodeSse(payload)));
}

function parseSseEvent(rawEvent: string) {
  const data = rawEvent
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");

  if (!data || data === "[DONE]") {
    return null;
  }

  return JSON.parse(data) as OpenAIStreamEvent;
}

function handleOpenAIStreamEvent(
  event: OpenAIStreamEvent,
  controller: ReadableStreamDefaultController<Uint8Array>,
  threadId: string,
) {
  if (event.type === "response.output_text.delta" && event.delta) {
    sendSse(controller, { text: event.delta });
    return false;
  }

  if (event.type === "response.completed") {
    sendSse(controller, { seqToken: setNextToken(threadId) });
    sendSse(controller, "[DONE]");
    return true;
  }

  if (event.type === "response.failed" || event.type === "response.error") {
    const errorMessage = event.error?.message || event.error?.type || "Unknown OpenAI error";
    sendSse(controller, { error: `Error: ${errorMessage}`, seqToken: setNextToken(threadId) });
    sendSse(controller, "[DONE]");
    return true;
  }

  return false;
}

async function streamOpenAIResponse(
  request: Request,
  controller: ReadableStreamDefaultController<Uint8Array>,
  threadId: string,
  message: string,
) {
  const vectorStoreId = await resolveVectorStoreId();
  const body = {
    conversation: threadId,
    input: message,
    instructions: SAM_AI_INSTRUCTIONS,
    max_output_tokens: MAX_OUTPUT_TOKENS,
    model: MODEL,
    stream: true,
    ...(vectorStoreId
      ? {
          tools: [
            {
              type: "file_search",
              vector_store_ids: [vectorStoreId],
            },
          ],
        }
      : {}),
  };

  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(`${OPENAI_BASE_URL}/responses`, {
        body: JSON.stringify(body),
        headers: openAIHeaders(),
        method: "POST",
        signal: request.signal,
      });
    } catch (error) {
      sendSse(controller, {
        error: `Error: ${getNetworkErrorMessage(error)}`,
        seqToken: setNextToken(threadId),
      });
      sendSse(controller, "[DONE]");
      return;
    }

    if (!response.ok) {
      const errorMessage = await readOpenAIError(response);
      if (response.status >= 500 && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      sendSse(controller, { error: `Error: ${errorMessage}`, seqToken: setNextToken(threadId) });
      sendSse(controller, "[DONE]");
      return;
    }

    if (!response.body) {
      throw new Error("OpenAI response did not include a stream body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || "";

      for (const rawEvent of events) {
        const event = parseSseEvent(rawEvent);
        if (!event) {
          continue;
        }

        if (handleOpenAIStreamEvent(event, controller, threadId)) {
          return;
        }
      }
    }

    if (buffer.trim()) {
      const event = parseSseEvent(buffer);
      if (event && handleOpenAIStreamEvent(event, controller, threadId)) {
        return;
      }
    }

    sendSse(controller, { seqToken: setNextToken(threadId) });
    sendSse(controller, "[DONE]");
    return;
  }
}

export function OPTIONS(request: Request) {
  return new Response(null, {
    headers: corsHeaders(request),
    status: 204,
  });
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return jsonResponse(request, { error: "Forbidden" }, 403);
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return jsonResponse(request, { error: "Invalid JSON body" }, 400);
  }

  if (typeof body.honeypot === "string" && body.honeypot.trim() !== "") {
    return jsonResponse(request, { threadId: "ok" });
  }

  const action = typeof body.action === "string" ? body.action : undefined;
  const rateCheck = checkRateLimit(getClientIp(request), action === "create_thread");

  if (!rateCheck.allowed) {
    const headers: HeadersInit = {};
    if (rateCheck.retryAfter) {
      headers["Retry-After"] = String(rateCheck.retryAfter);
    }

    return jsonResponse(
      request,
      {
        error:
          rateCheck.reason === "daily_limit"
            ? "You've started too many chats today. Please try again tomorrow."
            : "Please slow down. Try again in a moment.",
      },
      429,
      headers,
    );
  }

  const inputCheck = validateInput(body);
  if (!inputCheck.valid) {
    return jsonResponse(request, { error: inputCheck.error }, 400);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set");
    return jsonResponse(request, { error: "Server configuration error: missing API key" }, 500);
  }

  if (action === "create_thread") {
    try {
      const conversation = await openAIJson<OpenAIConversation>("/conversations", {
        body: "{}",
        method: "POST",
      });

      if (typeof conversation.id !== "string") {
        throw new Error("OpenAI did not return a conversation ID");
      }

      return jsonResponse(request, {
        seqToken: setNextToken(conversation.id),
        threadId: conversation.id,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown API error";
      console.error("Chat conversation creation failed:", message);
      return jsonResponse(request, { error: `API Error: ${message}` }, 500);
    }
  }

  if (typeof body.threadId !== "string" || typeof body.message !== "string") {
    return jsonResponse(request, { error: "Missing threadId or message" }, 400);
  }

  const tokenCheck = validateSequentialToken(body.threadId, body.seqToken);
  if (!tokenCheck.valid) {
    return jsonResponse(
      request,
      {
        error:
          tokenCheck.reason === "expired"
            ? "Session expired. Please refresh the page."
            : "Please wait for the previous message to complete.",
        seqToken: tokenMap.get(body.threadId)?.token || setNextToken(body.threadId),
      },
      429,
    );
  }

  const requestedWordCount = extractRequestedWordCount(body.message);
  if (requestedWordCount && requestedWordCount > MAX_RESPONSE_WORDS) {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        sendSse(controller, {
          text:
            `I keep replies under ${MAX_RESPONSE_WORDS} words so they stay complete and readable. ` +
            "I can give you a shorter summary, or split it into parts and continue if you want. Which would you prefer?",
        });
        sendSse(controller, { seqToken: setNextToken(body.threadId as string) });
        sendSse(controller, "[DONE]");
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders(request),
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream; charset=utf-8",
      },
    });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await streamOpenAIResponse(request, controller, body.threadId as string, body.message as string);
      } catch (error) {
        if (!request.signal.aborted) {
          const message = error instanceof Error ? error.message : "Unknown API error";
          console.error("Chat API stream failed:", message);
          sendSse(controller, { error: `Error: ${message}`, seqToken: setNextToken(body.threadId as string) });
          sendSse(controller, "[DONE]");
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders(request),
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
