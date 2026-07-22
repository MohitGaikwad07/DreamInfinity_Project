# Coding Interview Platform

All coding endpoints require a Bearer token and are available at `/api/coding` and `/api/v1/coding`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/questions` | List coding questions; optional `category` filter |
| POST | `/run` | Execute code against custom input |
| POST | `/submit` | Execute, score, persist, and AI-review a submission |
| GET | `/history` | Retrieve the authenticated user's submissions |
| GET | `/leaderboard` | Retrieve the overall coding leaderboard |

`POST /run` accepts `language`, `code`, and optional `input`. `POST /submit` additionally requires `questionId` and accepts a coding `mode`: `practice`, `interview`, `contest`, or `company_assessment`.

Set `JUDGE0_URL` and `JUDGE0_API_KEY` in `backend/.env`. The server keeps the API key private, sends source code to Judge0, and returns compile/runtime output, execution time, and memory usage. A successful submission is saved with its score and Gemini-backed AI code review.

The browser workspace uses Monaco Editor and supports all configured languages: Java, Python, JavaScript, C++, C, Go, Rust, and TypeScript. Code is retained in Redux during the active session. Browser/editor theme controls are provided by Monaco; full-screen and browser webcam policies remain host-browser concerns for assessment deployments.
