# Company Preparation Center

The authenticated Company Preparation Center is available at `/company-prep`. It creates a company-specific plan from the latest resume analysis, Skill Gap assessment, coding submissions, interview history, and Community Hub experiences.

## API

All company endpoints require bearer authentication and are offered under both `/api/company` and `/api/v1/company`.

- `GET /company` — supported company explorer
- `GET /company/:id` — company profile and Community Hub experiences
- `POST /company/readiness` — persists a personalized readiness analysis and roadmap
- `POST /company/roadmap` — returns the latest saved roadmap
- `GET /company/questions?company=:slug` — company question bank
- `GET /company/compare?companies=google,microsoft` — comparison data

## Data model

`Company` holds editable company metadata, hiring rounds, topics, resources, FAQs, and question banks. `CompanyPreparation` stores each user’s readiness breakdown, gaps, roadmap, and AI-predicted questions. This keeps the module ready for future admin company management and richer AI providers.
