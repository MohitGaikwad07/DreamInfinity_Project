# AI Career Assistant API

The AI service is exposed through both `/api/ai` and the versioned `/api/v1/ai` base paths. All endpoints require a Bearer JWT and are limited to 30 requests per 15 minutes per client.

## Request contract

Every endpoint accepts this reusable body shape:

```json
{
  "prompt": "Help me prepare for an Amazon software engineer interview.",
  "history": [
    { "role": "user", "content": "I have three weeks." },
    { "role": "assistant", "content": "Let's build a focused plan." }
  ],
  "context": {
    "resume": "Future resume context",
    "interviewScores": [],
    "codingHistory": [],
    "skillGap": [],
    "jobDescription": "Future job description context"
  }
}
```

`history` is optional and accepts up to 20 messages. `context` is intentionally flexible so future resume, coding, interview, and company modules can supply relevant user data without changing the provider contract.

## Endpoints

| Endpoint | Purpose |
| --- | --- |
| `POST /api/ai/chat` | General career assistant conversation |
| `POST /api/ai/summarize` | Summarize supplied material while retaining key actions |
| `POST /api/ai/explain` | Explain a technical topic progressively |
| `POST /api/ai/roadmap` | Generate a structured learning roadmap |
| `POST /api/ai/interview-hint` | Give a guided interview hint without over-solving |

A successful response returns:

```json
{
  "success": true,
  "message": { "role": "assistant", "content": "Markdown response…" },
  "streaming": false
}
```

The facade in `backend/src/services/ai/AIService.js` is provider-neutral. `GeminiProvider` is the current adapter; a different provider only needs the same `generate` contract. The response shape has a `streaming` field reserved for a future streaming transport.

## Setup and test

1. Add `GEMINI_API_KEY` to `backend/.env`; optionally set `GEMINI_MODEL`.
2. Start the backend and frontend from the repository root with `npm run dev:backend` and `npm run dev:frontend`.
3. Sign in, open `/assistant`, and send a prompt.
4. To test directly, call a protected endpoint with `Authorization: Bearer <token>` and the request contract above.

Never expose the Gemini key in frontend environment variables or browser code.
