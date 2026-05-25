'use client';

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { bookList } from "@/lib/books";
import { SAM_CHAT_OPEN_EVENT } from "@/lib/sam-chat-events";
import styles from "./ChatWidget.module.css";

const STORAGE_KEY = "samAiChat";
const MAX_CHATS = 5;
const MAX_MESSAGES = 20;
const MAX_INPUT_CHARS = 500;
const MAX_CHATS_NOTICE =
  "You can keep up to 5 chats. Close one of your saved chats before starting another.";
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

type ChatSession = {
  createdAt: number;
  id: string;
  messages: ChatMessage[];
  seqToken: string | null;
  threadId: string | null;
  updatedAt: number;
};

type StoredChatMessage = {
  content: string;
  role: ChatRole;
};

type StoredChatSession = {
  createdAt?: unknown;
  id?: unknown;
  messages?: unknown;
  seqToken?: unknown;
  threadId?: unknown;
  updatedAt?: unknown;
};

type StoredChatState = {
  activeChatId?: unknown;
  chats?: unknown;
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

type ThreadPromise = {
  chatId: string;
  promise: Promise<string>;
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createChatSession(): ChatSession {
  const now = Date.now();
  return {
    createdAt: now,
    id: createId(),
    messages: [],
    seqToken: null,
    threadId: null,
    updatedAt: now,
  };
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

function normalizeStoredMessages(messages: unknown) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(isStoredMessage)
    .slice(-MAX_MESSAGES)
    .map((message) => ({ ...message, id: createId() }));
}

function normalizeStoredChatSession(session: unknown): ChatSession | null {
  if (!session || typeof session !== "object") {
    return null;
  }

  const candidate = session as StoredChatSession;
  const id = typeof candidate.id === "string" ? candidate.id : createId();
  const createdAt = typeof candidate.createdAt === "number" ? candidate.createdAt : Date.now();
  const updatedAt = typeof candidate.updatedAt === "number" ? candidate.updatedAt : createdAt;
  const seqToken = typeof candidate.seqToken === "string" ? candidate.seqToken : null;
  const threadId = typeof candidate.threadId === "string" ? candidate.threadId : null;

  return {
    createdAt,
    id,
    messages: normalizeStoredMessages(candidate.messages),
    seqToken,
    threadId,
    updatedAt,
  };
}

function loadStoredChatState(raw: string) {
  const parsed = JSON.parse(raw) as StoredChatState;

  if (Array.isArray(parsed.chats)) {
    const chats = parsed.chats
      .map(normalizeStoredChatSession)
      .filter((chat): chat is ChatSession => Boolean(chat))
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(-MAX_CHATS);
    const activeChatId =
      typeof parsed.activeChatId === "string" && chats.some((chat) => chat.id === parsed.activeChatId)
        ? parsed.activeChatId
        : chats.at(-1)?.id ?? null;

    return { activeChatId, chats };
  }

  const legacyMessages = normalizeStoredMessages(parsed.messages);
  if (!parsed.threadId && legacyMessages.length === 0) {
    return { activeChatId: null, chats: [] };
  }

  const legacyChat = createChatSession();
  legacyChat.messages = legacyMessages;
  legacyChat.seqToken = typeof parsed.seqToken === "string" ? parsed.seqToken : null;
  legacyChat.threadId = typeof parsed.threadId === "string" ? parsed.threadId : null;

  return { activeChatId: legacyChat.id, chats: [legacyChat] };
}

function getChatTitle(chat: ChatSession, index: number) {
  const firstUserMessage = chat.messages.find((message) => message.role === "user")?.content.trim();
  if (!firstUserMessage) {
    return chat.messages.length > 0 ? `Chat ${index + 1}` : "New chat";
  }

  return firstUserMessage.length > 30 ? `${firstUserMessage.slice(0, 29)}...` : firstUserMessage;
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
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [chatNotice, setChatNotice] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? null,
    [activeChatId, chats],
  );
  const messages = useMemo(() => activeChat?.messages ?? [], [activeChat]);
  const seqToken = activeChat?.seqToken ?? null;
  const threadId = activeChat?.threadId ?? null;

  const abortRef = useRef<AbortController | null>(null);
  const activeChatIdRef = useRef(activeChatId);
  const chatsRef = useRef(chats);
  const createThreadPromiseRef = useRef<ThreadPromise | null>(null);
  const honeypotRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef(messages);
  const seqTokenRef = useRef(seqToken);
  const threadIdRef = useRef(threadId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

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
          const stored = loadStoredChatState(raw);
          const active = stored.chats.find((chat) => chat.id === stored.activeChatId) ?? null;

          chatsRef.current = stored.chats;
          activeChatIdRef.current = stored.activeChatId;
          messagesRef.current = active?.messages ?? [];
          seqTokenRef.current = active?.seqToken ?? null;
          threadIdRef.current = active?.threadId ?? null;

          setChats(stored.chats);
          setActiveChatId(stored.activeChatId);
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

    if (chats.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const stored: StoredChatState = {
      activeChatId,
      chats: chats.map((chat) => ({
        createdAt: chat.createdAt,
        id: chat.id,
        messages: chat.messages.map(({ content, role }) => ({ content, role })),
        seqToken: chat.seqToken,
        threadId: chat.threadId,
        updatedAt: chat.updatedAt,
      })),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, [activeChatId, chats, hydrated]);

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

  const ensureActiveChat = useCallback(() => {
    const existingId = activeChatIdRef.current;
    if (existingId && chatsRef.current.some((chat) => chat.id === existingId)) {
      return existingId;
    }

    if (chatsRef.current.length >= MAX_CHATS) {
      setChatNotice(MAX_CHATS_NOTICE);
      return null;
    }

    const session = createChatSession();
    activeChatIdRef.current = session.id;
    chatsRef.current = [...chatsRef.current, session];
    messagesRef.current = [];
    seqTokenRef.current = null;
    threadIdRef.current = null;

    setChatNotice(null);
    setActiveChatId(session.id);
    setChats(chatsRef.current);

    return session.id;
  }, []);

  const updateChatMessages = useCallback(
    (chatId: string, updater: (messages: ChatMessage[]) => ChatMessage[]) => {
      const updatedChats = chatsRef.current.map((chat) => {
        if (chat.id !== chatId) {
          return chat;
        }

        const nextMessages = updater(chat.messages).slice(-MAX_MESSAGES);
        const updatedChat = {
          ...chat,
          messages: nextMessages,
          updatedAt: Date.now(),
        };

        if (activeChatIdRef.current === chatId) {
          messagesRef.current = nextMessages;
        }

        return updatedChat;
      });

      chatsRef.current = updatedChats;
      setChats(updatedChats);
    },
    [],
  );

  const updateChatConnection = useCallback(
    (chatId: string, connection: { seqToken?: string | null; threadId?: string | null }) => {
      const updatedChats = chatsRef.current.map((chat) => {
        if (chat.id !== chatId) {
          return chat;
        }

        const updatedChat = {
          ...chat,
          seqToken: connection.seqToken !== undefined ? connection.seqToken : chat.seqToken,
          threadId: connection.threadId !== undefined ? connection.threadId : chat.threadId,
          updatedAt: Date.now(),
        };

        if (activeChatIdRef.current === chatId) {
          seqTokenRef.current = updatedChat.seqToken;
          threadIdRef.current = updatedChat.threadId;
        }

        return updatedChat;
      });

      chatsRef.current = updatedChats;
      setChats(updatedChats);
    },
    [],
  );

  const createThread = useCallback(async (chatId: string) => {
    const existingChat = chatsRef.current.find((chat) => chat.id === chatId);
    if (existingChat?.threadId) {
      return existingChat.threadId;
    }

    if (createThreadPromiseRef.current?.chatId === chatId) {
      return createThreadPromiseRef.current.promise;
    }

    const promise = fetch("/api/chat", {
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

        updateChatConnection(chatId, {
          seqToken: data.seqToken || null,
          threadId: data.threadId,
        });
        return data.threadId;
      })
      .finally(() => {
        if (createThreadPromiseRef.current?.chatId === chatId) {
          createThreadPromiseRef.current = null;
        }
      });

    createThreadPromiseRef.current = { chatId, promise };
    return promise;
  }, [updateChatConnection]);

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

  const updateAssistantMessage = useCallback(
    (chatId: string, id: string, content: string) => {
      updateChatMessages(chatId, (current) =>
        current.map((message) => (message.id === id ? { ...message, content } : message)),
      );
    },
    [updateChatMessages],
  );

  const sendMessage = useCallback(
    async (overrideMessage?: string) => {
      const text = (overrideMessage ?? input).trim();
      if (!text || isLoading) {
        return;
      }

      const chatId = ensureActiveChat();
      if (!chatId) {
        return;
      }

      const currentChat = chatsRef.current.find((chat) => chat.id === chatId);
      const currentMessages = currentChat?.messages ?? [];
      const userCount = currentMessages.filter((message) => message.role === "user").length;
      if (userCount >= MAX_MESSAGES / 2) {
        updateChatMessages(chatId, (current) => [
          ...current,
          {
            content:
              "You've reached the chat limit for this session. Start a new saved chat, or use the contact form for a deeper conversation.",
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

      updateChatMessages(chatId, (current) => [...current, userMessage, assistantMessage]);

      try {
        const conversationId = await createThread(chatId);
        const latestChat = chatsRef.current.find((chat) => chat.id === chatId);
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const response = await fetch("/api/chat", {
          body: JSON.stringify({
            honeypot: honeypotRef.current?.value || "",
            message: text,
            seqToken: latestChat?.seqToken || "",
            threadId: conversationId,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = (await response.json()) as ChatApiJson;
          if (data.seqToken) {
            updateChatConnection(chatId, { seqToken: data.seqToken });
          }

          updateAssistantMessage(chatId, assistantId, data.error || "Sorry, something went wrong.");
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
              updateAssistantMessage(chatId, assistantId, stripCitations(fullText));
            }

            if (event.seqToken) {
              updateChatConnection(chatId, { seqToken: event.seqToken });
            }

            if (event.error) {
              updateAssistantMessage(chatId, assistantId, event.error);
            }
          }
        }

        if (buffer.trim()) {
          const event = parseStreamEvent(buffer);
          if (event?.seqToken) {
            updateChatConnection(chatId, { seqToken: event.seqToken });
          }
          if (event?.error) {
            updateAssistantMessage(chatId, assistantId, event.error);
          }
        }

        if (fullText) {
          updateAssistantMessage(chatId, assistantId, stripCitations(fullText, true));
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Sam AI: send failed", error);
        updateAssistantMessage(chatId, assistantId, "Sorry, something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [
      createThread,
      ensureActiveChat,
      input,
      isLoading,
      updateAssistantMessage,
      updateChatConnection,
      updateChatMessages,
    ],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleNewChat = () => {
    if (isLoading) {
      return;
    }

    const currentChat = chatsRef.current.find((chat) => chat.id === activeChatIdRef.current);
    if (currentChat && currentChat.messages.length === 0 && !currentChat.threadId) {
      setInput("");
      setChatNotice(null);
      return;
    }

    if (chatsRef.current.length >= MAX_CHATS) {
      setChatNotice(MAX_CHATS_NOTICE);
      return;
    }

    const session = createChatSession();
    createThreadPromiseRef.current = null;
    activeChatIdRef.current = session.id;
    chatsRef.current = [...chatsRef.current, session];
    messagesRef.current = [];
    seqTokenRef.current = null;
    threadIdRef.current = null;

    setInput("");
    setChatNotice(null);
    setActiveChatId(session.id);
    setChats(chatsRef.current);
  };

  const handleSwitchChat = (chatId: string) => {
    if (isLoading || chatId === activeChatIdRef.current) {
      return;
    }

    const nextChat = chatsRef.current.find((chat) => chat.id === chatId);
    if (!nextChat) {
      return;
    }

    createThreadPromiseRef.current = null;
    activeChatIdRef.current = chatId;
    messagesRef.current = nextChat.messages;
    seqTokenRef.current = nextChat.seqToken;
    threadIdRef.current = nextChat.threadId;

    setInput("");
    setChatNotice(null);
    setActiveChatId(chatId);
  };

  const handleCloseChat = (chatId: string) => {
    if (isLoading) {
      return;
    }

    const nextChats = chatsRef.current.filter((chat) => chat.id !== chatId);
    const shouldMoveActive = activeChatIdRef.current === chatId;
    const nextActiveChat = shouldMoveActive
      ? nextChats.at(-1) ?? null
      : nextChats.find((chat) => chat.id === activeChatIdRef.current) ?? null;

    if (shouldMoveActive) {
      createThreadPromiseRef.current = null;
      activeChatIdRef.current = nextActiveChat?.id ?? null;
      messagesRef.current = nextActiveChat?.messages ?? [];
      seqTokenRef.current = nextActiveChat?.seqToken ?? null;
      threadIdRef.current = nextActiveChat?.threadId ?? null;
      setInput("");
      setActiveChatId(nextActiveChat?.id ?? null);
    }

    chatsRef.current = nextChats;
    setChatNotice(null);
    setChats(nextChats);
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
            <button
              type="button"
              className={styles.newButton}
              onClick={handleNewChat}
              disabled={isLoading}
            >
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

        {(chats.length > 0 || chatNotice) && (
          <div className={styles.chatShelf}>
            {chats.length > 0 && (
              <div className={styles.chatTabs} aria-label="Saved chats">
                {chats.map((chat, index) => {
                  const title = getChatTitle(chat, index);
                  const isActive = chat.id === activeChatId;

                  return (
                    <div
                      key={chat.id}
                      className={styles.chatTab}
                      data-active={isActive ? "true" : "false"}
                    >
                      <button
                        type="button"
                        className={styles.chatTabButton}
                        onClick={() => handleSwitchChat(chat.id)}
                        disabled={isLoading}
                        aria-current={isActive ? "true" : undefined}
                        title={title}
                      >
                        {title}
                      </button>
                      <button
                        type="button"
                        className={styles.closeChatButton}
                        onClick={() => handleCloseChat(chat.id)}
                        disabled={isLoading}
                        aria-label={`Close ${title}`}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {chatNotice && <p className={styles.chatNotice}>{chatNotice}</p>}
          </div>
        )}

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
