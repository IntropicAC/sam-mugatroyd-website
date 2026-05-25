'use client';

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { bookList } from "@/lib/books";
import { SAM_CHAT_OPEN_EVENT } from "@/lib/sam-chat-events";
import styles from "./ChatWidget.module.css";

const STORAGE_KEY = "samAiChat";
const MAX_MESSAGES = 20;
const MAX_INPUT_CHARS = 500;
const WELCOME_MESSAGE =
  "Hi there. I'm Sam AI. I can answer questions about Sam's books, coaching, or anything on this site. What would you like to know?";

const PROMPT_SUGGESTIONS = [
  "What are Sam's books about?",
  "Which book should I read first?",
  "Tell me about Sam's coaching",
  "How can Sam help me?",
];

const BOOK_DATA = bookList.map((book) => ({
  cover: book.coverImage,
  id: book.id,
  pattern: book.matchPattern,
  title: book.title,
  url: book.amazonUrl,
}));

type ChatRole = "assistant" | "user";

type ChatMessage = {
  content: string;
  id: string;
  role: ChatRole;
};

type StoredChatMessage = {
  content: string;
  role: ChatRole;
};

type StoredChatState = {
  messages?: StoredChatMessage[];
  seqToken?: string | null;
  threadId?: string | null;
};

type ChatApiJson = {
  error?: string;
  seqToken?: string;
  threadId?: string;
};

type ChatStreamEvent = {
  error?: string;
  seqToken?: string;
  text?: string;
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isStoredMessage(message: unknown): message is StoredChatMessage {
  if (!message || typeof message !== "object") {
    return false;
  }

  const candidate = message as Partial<StoredChatMessage>;
  return (
    typeof candidate.content === "string" &&
    (candidate.role === "assistant" || candidate.role === "user")
  );
}

function stripCitations(text: string, trim = false) {
  const cleaned = text
    .replace(/\u3010[^\u3011]*\u3011/g, "")
    .replace(/\u3010[^\u3011]*$/g, "")
    .replace(/[ \t]{2,}/g, " ");

  return trim ? cleaned.trim() : cleaned;
}

function normalizeAssistantText(text: string) {
  return stripCitations(text, true)
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "");
}

function parseStreamEvent(rawEvent: string) {
  const data = rawEvent
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");

  if (!data || data === "[DONE]") {
    return null;
  }

  try {
    return JSON.parse(data) as ChatStreamEvent;
  } catch {
    return null;
  }
}

function linkifyText(text: string) {
  const parts = text.split(/(https?:\/\/[^\s<]+)/g);

  return parts.map((part, index) => {
    if (!/^https?:\/\//.test(part)) {
      return part;
    }

    const url = part.replace(/[),.]+$/, "");
    const trailing = part.slice(url.length);
    const label = url.includes("amazon.co.uk") ? "View on Amazon" : url;

    return (
      <span key={`${url}-${index}`}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {label}
          {url.includes("amazon.co.uk") ? " ->" : ""}
        </a>
        {trailing}
      </span>
    );
  });
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Zm0 14H5.2L4 17.2V4h16v12Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m18.3 5.7-1.4-1.4-4.9 4.9-4.9-4.9-1.4 1.4 4.9 4.9-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9 4.9-4.9Z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 21 23 12 2 3v7l15 2-15 2v7Z" />
    </svg>
  );
}

function renderAssistantMessage(content: string) {
  const normalized = normalizeAssistantText(content);

  if (!normalized) {
    return null;
  }

  return normalized.split(/\n+/).map((paragraph, index) => (
    <p key={`${paragraph}-${index}`}>{linkifyText(paragraph)}</p>
  ));
}

export default function ChatWidget() {
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [seqToken, setSeqToken] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const createThreadPromiseRef = useRef<Promise<string> | null>(null);
  const honeypotRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef(messages);
  const seqTokenRef = useRef(seqToken);
  const threadIdRef = useRef(threadId);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    seqTokenRef.current = seqToken;
  }, [seqToken]);

  useEffect(() => {
    threadIdRef.current = threadId;
  }, [threadId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredChatState;
          if (parsed.threadId && typeof parsed.threadId === "string") {
            threadIdRef.current = parsed.threadId;
            setThreadId(parsed.threadId);
          }
          if (parsed.seqToken && typeof parsed.seqToken === "string") {
            seqTokenRef.current = parsed.seqToken;
            setSeqToken(parsed.seqToken);
          }
          if (Array.isArray(parsed.messages)) {
            setMessages(
              parsed.messages
                .filter(isStoredMessage)
                .slice(-MAX_MESSAGES)
                .map((message) => ({ ...message, id: createId() })),
            );
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const stored: StoredChatState = {
      messages: messages.map(({ content, role }) => ({ content, role })),
      seqToken,
      threadId,
    };

    if (!threadId && messages.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, [hydrated, messages, seqToken, threadId]);

  useEffect(() => {
    const openChat = () => setIsOpen(true);
    window.addEventListener(SAM_CHAT_OPEN_EVENT, openChat);
    return () => window.removeEventListener(SAM_CHAT_OPEN_EVENT, openChat);
  }, []);

  useEffect(() => {
    function updateViewportVars() {
      const viewport = window.visualViewport;
      const height = viewport?.height || window.innerHeight || 0;
      const width = viewport?.width || window.innerWidth || 0;
      const bottom = viewport
        ? Math.max(0, window.innerHeight - (viewport.height + viewport.offsetTop))
        : 0;
      const right = viewport
        ? Math.max(0, window.innerWidth - (viewport.width + viewport.offsetLeft))
        : 0;

      document.documentElement.style.setProperty("--sam-chat-vh", `${height}px`);
      document.documentElement.style.setProperty("--sam-chat-vw", `${width}px`);
      document.documentElement.style.setProperty("--sam-chat-vv-bottom", `${bottom}px`);
      document.documentElement.style.setProperty("--sam-chat-vv-right", `${right}px`);
    }

    updateViewportVars();
    window.addEventListener("resize", updateViewportVars);
    window.visualViewport?.addEventListener("resize", updateViewportVars);
    window.visualViewport?.addEventListener("scroll", updateViewportVars);

    return () => {
      window.removeEventListener("resize", updateViewportVars);
      window.visualViewport?.removeEventListener("resize", updateViewportVars);
      window.visualViewport?.removeEventListener("scroll", updateViewportVars);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!window.matchMedia("(max-width: 768px)").matches) {
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const previous = {
      left: document.body.style.left,
      position: document.body.style.position,
      right: document.body.style.right,
      top: document.body.style.top,
      width: document.body.style.width,
    };

    document.documentElement.classList.add("sam-chat-scroll-lock");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.documentElement.classList.remove("sam-chat-scroll-lock");
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.left = previous.left;
      document.body.style.right = previous.right;
      document.body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  const createThread = useCallback(async () => {
    if (threadIdRef.current) {
      return threadIdRef.current;
    }

    if (createThreadPromiseRef.current) {
      return createThreadPromiseRef.current;
    }

    createThreadPromiseRef.current = fetch("/api/chat", {
      body: JSON.stringify({
        action: "create_thread",
        honeypot: honeypotRef.current?.value || "",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
      .then(async (response) => {
        const data = (await response.json()) as ChatApiJson;
        if (!response.ok || !data.threadId || data.threadId === "ok") {
          throw new Error(data.error || "Could not start the chat.");
        }

        threadIdRef.current = data.threadId;
        seqTokenRef.current = data.seqToken || null;
        setThreadId(data.threadId);
        setSeqToken(data.seqToken || null);
        return data.threadId;
      })
      .finally(() => {
        createThreadPromiseRef.current = null;
      });

    return createThreadPromiseRef.current;
  }, []);

  useEffect(() => {
    if (!isOpen || !hydrated || threadIdRef.current) {
      return;
    }

    void createThread().catch((error) => {
      console.error("Sam AI: failed to start chat", error);
    });
  }, [createThread, hydrated, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [input, isLoading, isOpen, messages]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const matchedBooks = useMemo(() => {
    const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant");
    if (!latestAssistant?.content) {
      return [];
    }

    return BOOK_DATA.filter((book) => book.pattern.test(latestAssistant.content));
  }, [messages]);

  const updateAssistantMessage = useCallback((id: string, content: string) => {
    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, content } : message)),
    );
  }, []);

  const sendMessage = useCallback(
    async (overrideMessage?: string) => {
      const text = (overrideMessage ?? input).trim();
      if (!text || isLoading) {
        return;
      }

      const userCount = messagesRef.current.filter((message) => message.role === "user").length;
      if (userCount >= MAX_MESSAGES / 2) {
        setMessages((current) => [
          ...current,
          {
            content:
              "You've reached the chat limit for this session. Press New to start again, or use the contact form for a deeper conversation.",
            id: createId(),
            role: "assistant",
          },
        ]);
        return;
      }

      setInput("");
      setIsLoading(true);

      const userMessage: ChatMessage = {
        content: text,
        id: createId(),
        role: "user",
      };
      const assistantId = createId();
      const assistantMessage: ChatMessage = {
        content: "",
        id: assistantId,
        role: "assistant",
      };

      setMessages((current) => [...current, userMessage, assistantMessage]);

      try {
        const conversationId = await createThread();
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const response = await fetch("/api/chat", {
          body: JSON.stringify({
            honeypot: honeypotRef.current?.value || "",
            message: text,
            seqToken: seqTokenRef.current || "",
            threadId: conversationId,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = (await response.json()) as ChatApiJson;
          if (data.seqToken) {
            seqTokenRef.current = data.seqToken;
            setSeqToken(data.seqToken);
          }

          updateAssistantMessage(assistantId, data.error || "Sorry, something went wrong.");
          return;
        }

        if (!response.body) {
          throw new Error("The chat response did not include a stream.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split(/\r?\n\r?\n/);
          buffer = events.pop() || "";

          for (const rawEvent of events) {
            const event = parseStreamEvent(rawEvent);
            if (!event) {
              continue;
            }

            if (event.text) {
              fullText += event.text;
              updateAssistantMessage(assistantId, stripCitations(fullText));
            }

            if (event.seqToken) {
              seqTokenRef.current = event.seqToken;
              setSeqToken(event.seqToken);
            }

            if (event.error) {
              updateAssistantMessage(assistantId, event.error);
            }
          }
        }

        if (buffer.trim()) {
          const event = parseStreamEvent(buffer);
          if (event?.seqToken) {
            seqTokenRef.current = event.seqToken;
            setSeqToken(event.seqToken);
          }
          if (event?.error) {
            updateAssistantMessage(assistantId, event.error);
          }
        }

        if (fullText) {
          updateAssistantMessage(assistantId, stripCitations(fullText, true));
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Sam AI: send failed", error);
        updateAssistantMessage(assistantId, "Sorry, something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [createThread, input, isLoading, updateAssistantMessage],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleNewChat = () => {
    abortRef.current?.abort();
    createThreadPromiseRef.current = null;
    threadIdRef.current = null;
    seqTokenRef.current = null;
    setInput("");
    setIsLoading(false);
    setMessages([]);
    setSeqToken(null);
    setThreadId(null);
    localStorage.removeItem(STORAGE_KEY);
    void createThread().catch((error) => {
      console.error("Sam AI: failed to start new chat", error);
    });
  };

  return (
    <div className={styles.root} data-open={isOpen ? "true" : "false"}>
      <div className={styles.backdrop} onClick={() => setIsOpen(false)} aria-hidden="true" />

      <section
        className={styles.panel}
        role="dialog"
        aria-label="Sam AI chat guide"
        aria-modal="false"
        aria-hidden={!isOpen}
      >
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.statusDot} aria-hidden="true" />
            <div>
              <p className={styles.title}>Sam AI</p>
              <p className={styles.subtitle}>Books, coaching, and honest questions</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button type="button" className={styles.newButton} onClick={handleNewChat}>
              New
            </button>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <CloseIcon />
            </button>
          </div>
        </header>

        <div className={styles.messages} aria-live="polite">
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            {renderAssistantMessage(WELCOME_MESSAGE)}
          </div>

          {messages.length === 0 && !isLoading && (
            <div className={styles.prompts}>
              {PROMPT_SUGGESTIONS.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  className={styles.promptButton}
                  onClick={() => void sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {messages.map((message, index) => {
            const isPendingAssistant =
              isLoading &&
              message.role === "assistant" &&
              !message.content &&
              index === messages.length - 1;

            return (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.role === "user" ? styles.userMessage : styles.assistantMessage
                }`}
              >
                {isPendingAssistant ? (
                  <span className={styles.typing} aria-label="Sam AI is typing">
                    <span />
                    <span />
                    <span />
                  </span>
                ) : message.role === "assistant" ? (
                  renderAssistantMessage(message.content)
                ) : (
                  message.content
                )}
              </div>
            );
          })}

          {matchedBooks.length > 0 && (
            <div className={styles.bookCards} aria-label="Related books">
              {matchedBooks.map((book) => (
                <a
                  key={book.id}
                  href={book.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.bookCard}
                >
                  <Image src={book.cover} alt="" width={54} height={78} />
                  <span>{book.title}</span>
                </a>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={input}
            maxLength={MAX_INPUT_CHARS}
            onChange={(event) => setInput(event.target.value.slice(0, MAX_INPUT_CHARS))}
            placeholder="Ask about Sam's books or coaching..."
            disabled={isLoading}
            aria-label="Message Sam AI"
          />
          <input
            ref={honeypotRef}
            className={styles.honeypot}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </form>

        <button
          type="button"
          className={styles.mobileClose}
          onClick={() => setIsOpen(false)}
          aria-label="Close Sam AI chat"
        >
          <ChatIcon />
          Back to site
        </button>
      </section>
    </div>
  );
}
