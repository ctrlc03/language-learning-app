/**
 * In-band error trailer for /api/chat. Once streaming has started the HTTP status
 * is already 200, so a mid-stream upstream failure is appended to the body as
 * `CHAT_STREAM_ERROR_MARKER + message`. The client strips it and surfaces the message.
 * Kept dependency-free so the client bundle can import it without the SDK.
 */
export const CHAT_STREAM_ERROR_MARKER = '<!--ERROR-->';
