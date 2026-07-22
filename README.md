# Dream & Infinity — Interview Preparation Platform

Dream & Infinity is a scalable SaaS foundation for AI-assisted placement and technical-interview preparation. This repository intentionally contains architecture and configuration only; authentication, APIs, and UI screens are deferred to later implementation phases.

## Technology

- **Frontend:** React, Vite, Tailwind CSS, Redux Toolkit, React Router, Axios, React Hook Form, React Hot Toast, Framer Motion
- **Backend:** Node.js, Express, MongoDB with Mongoose
- **Platform services:** JWT, bcrypt, Socket.IO, WebRTC, Gemini (provider abstraction), Cloudinary
- **Deployment:** Vercel (frontend), Render (API/realtime server), MongoDB Atlas

## Repository structure

```text
Favour-AI/
├── frontend/
│   ├── src/
│   │   ├── assets/             # Images, fonts, and static visual assets
│   │   ├── components/         # Reusable UI building blocks and feature components
│   │   ├── constants/          # Immutable UI/application constants
│   │   ├── hooks/              # Reusable React hooks
│   │   ├── layouts/            # Shared page shells such as dashboard and public layouts
│   │   ├── pages/              # Route-level screens, organised by feature as the app grows
│   │   ├── redux/              # Store configuration and Redux slices
│   │   │   └── slices/         # Feature-owned global state reducers
│   │   ├── routes/             # Route definitions, guards, and lazy-loading boundaries
│   │   ├── services/           # Axios client, API modules, socket client, and WebRTC helpers
│   │   ├── styles/             # Tailwind entry point, design tokens, and global styles
│   │   └── utils/              # Pure presentation-side helpers
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/             # Environment validation and external-client configuration
│   │   ├── controllers/        # HTTP orchestration; no domain logic or direct infrastructure setup
│   │   ├── middleware/         # Authentication, authorization, error, rate-limit, and request middleware
│   │   ├── models/             # Mongoose schemas, indexes, and persistence models
│   │   ├── routes/             # Versioned API route modules (for example, /api/v1)
│   │   ├── services/           # Business use-cases and infrastructure adapters
│   │   │   ├── ai/             # Provider-agnostic AI contracts and orchestration
│   │   │   │   └── providers/  # Gemini adapter; future providers live beside it
│   │   │   └── storage/        # Cloudinary media abstraction
│   │   ├── socket/             # Socket.IO server setup, event handlers, and room policies
│   │   ├── utils/              # Shared backend utilities and typed application errors
│   │   └── validators/         # Request DTO validation schemas
│   ├── uploads/                # Temporary local upload staging; excluded from Git
│   └── package.json
├── docs/                       # Architecture decisions, API contracts, and operational documentation
├── .gitignore
├── package.json                # npm workspaces and top-level developer commands
└── README.md
```

## Architectural principles

The frontend separates routes, screens, reusable components, client integrations, and state. The backend follows a clear request flow: **route → middleware → controller → service → model/provider**. Controllers remain thin, services hold business use-cases, and adapters isolate external infrastructure. This supports independent feature growth, focused testing, and safer changes.

Features should become vertically organised inside these layers when they grow (for example `services/interview`, `controllers/interview.controller.js`, and `redux/slices/interviewSlice.js`). Shared concerns remain central only when they are genuinely cross-cutting.

Compared with a typical MERN starter, this foundation adds npm workspaces, API versioning, request validation boundaries, a dedicated external-provider layer, explicit realtime and WebRTC modules, security middleware dependencies, and documented ownership boundaries. These choices keep vendor changes, scaling work, and new product areas from leaking across the whole codebase.

## Frontend ↔ backend communication

The frontend will use a single configured Axios client in `frontend/src/services`, with a base URL supplied by environment variables. Feature API modules call versioned REST endpoints such as `/api/v1/...`; response/error normalization occurs once in the client layer. Authentication headers and refresh behaviour will be added later through interceptors and middleware, not scattered across components.

Socket.IO uses a separate client service for event-driven state such as interview-room presence, notifications, and WebRTC signaling. REST remains the source for durable resources; sockets communicate transient events.

## Redux responsibilities

Redux is reserved for app-wide, cross-screen state: authenticated user/session state, application preferences, dashboard data caches, interview-session state, notifications, and socket connection status. React Hook Form owns local form state, while component-only visual state stays local. This avoids turning the store into a duplicate of every component.

## AI module design

AI capabilities belong in `backend/src/services/ai`. The application service will depend on a provider contract rather than Gemini-specific calls; `services/ai/providers` will initially contain a Gemini implementation. Prompt templates, response mapping, safety controls, timeout/retry policy, and usage accounting can therefore evolve without changing controllers or product features. API keys remain backend-only environment variables.

## Realtime interviews and video calling

Socket.IO is hosted with the Express server and organised under `backend/src/socket`. It authenticates socket connections, authorizes room membership, and relays signaling events. WebRTC runs peer-to-peer in the browser; frontend WebRTC helpers obtain camera/microphone media, manage `RTCPeerConnection`, and exchange offer/answer/ICE candidates through Socket.IO. For production reliability, TURN credentials should be provisioned through a managed TURN service; Socket.IO does not carry audio/video streams.

## Database design philosophy

MongoDB models should represent stable business aggregates—such as users, interview sessions, question sets, attempts, feedback, and subscriptions—rather than mirror individual screens. Each collection will have explicit validation, timestamps, ownership references, and indexes derived from actual query patterns. Embed small, bounded data read with its parent; reference independently growing or frequently queried entities. Store Cloudinary metadata and URLs, never binary media. Schema evolution will use backward-compatible fields and documented migrations.

## Dependency manifests

The root `package.json` uses npm workspaces. Frontend and backend dependencies are declared independently in their respective package manifests, keeping browser-only packages out of the server bundle and server secrets/providers out of the client. Run `npm install` from the repository root when implementation begins.

## Implemented modules

- **Authentication:** User model, JWT/Bearer authentication, strong password validation, account/profile endpoints, Redux state, protected/guest routes, and dark responsive account screens. See [authentication API documentation](docs/authentication.md).
- **Landing page:** A responsive, animated product home page composed from reusable sections under `frontend/src/components/landing`.
- **AI Career Assistant:** Gemini-backed, provider-agnostic career chat with reusable context support. See [AI API documentation](docs/ai-career-assistant.md).
- **Resume Analyzer:** Cloudinary-backed PDF/DOCX uploads with structured ATS analysis through the shared AI service. See [Resume API documentation](docs/resume-analyzer.md).
- **Skill Gap & Readiness Engine:** AI assessment combining profile, resume, interview, and coding context. See [Skill Gap API documentation](docs/skill-gap-analyzer.md).

## Visual direction for the future UI

The visual system will follow a dark, high-clarity product dashboard inspired by Linear, Vercel, Notion, and Stripe: restrained purple/blue gradients, glass surfaces used sparingly, rounded hierarchy-driven cards, accessible contrast, responsive layouts, and purposeful Framer Motion transitions.
