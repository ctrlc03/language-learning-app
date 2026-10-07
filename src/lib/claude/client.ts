import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

const MISSING_KEY_MESSAGE =
  'AI features need an Anthropic API key: set ANTHROPIC_API_KEY in .env and restart the server.';

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

/** Failure payload shared by every AI route: non-2xx JSON `{ error }`. */
export function aiError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

/** 503 when no API key is configured; null when the route may proceed. */
export function missingKeyResponse(): Response | null {
  return process.env.ANTHROPIC_API_KEY?.trim() ? null : aiError(MISSING_KEY_MESSAGE, 503);
}

/** Map a thrown SDK/runtime error to a short, learner-readable message and a sensible HTTP status. */
export function describeAiError(
  error: unknown,
  fallback: string,
): { message: string; status: number } {
  if (error instanceof SyntaxError) {
    return { message: 'The request was not valid JSON.', status: 400 };
  }
  if (
    error instanceof Anthropic.AuthenticationError ||
    error instanceof Anthropic.PermissionDeniedError
  ) {
    return {
      message:
        'The Anthropic API key was rejected. Check ANTHROPIC_API_KEY in .env and restart the server.',
      status: 503,
    };
  }
  if (error instanceof Anthropic.RateLimitError) {
    return {
      message: 'The AI service is rate limited right now. Wait a moment and try again.',
      status: 429,
    };
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return {
      message: 'Could not reach the AI service. Check your connection and try again.',
      status: 502,
    };
  }
  if (error instanceof Anthropic.APIError) {
    if (error.status === 400 && /credit balance/i.test(error.message)) {
      return {
        message: 'The Anthropic account has no credit left. Add credit and try again.',
        status: 503,
      };
    }
    if (error.status !== undefined && error.status >= 500) {
      return {
        message: 'The AI service is temporarily unavailable. Try again shortly.',
        status: 502,
      };
    }
  }
  return { message: fallback, status: 500 };
}

export function aiErrorResponse(error: unknown, fallback: string): Response {
  const { message, status } = describeAiError(error, fallback);
  return aiError(message, status);
}
