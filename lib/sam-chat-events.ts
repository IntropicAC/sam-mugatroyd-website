export const SAM_CHAT_OPEN_EVENT = "sam-chat:open";

export function openSamChat() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(SAM_CHAT_OPEN_EVENT));
}
