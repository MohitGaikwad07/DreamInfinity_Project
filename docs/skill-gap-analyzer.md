# Skill Gap & Interview Readiness API

All endpoints require a Bearer token and are available under `/api/skill-gap` and `/api/v1/skill-gap`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/analyze` | Create a role/company-specific readiness assessment |
| GET | `/history` | Retrieve the authenticated user's previous assessments |
| POST | `/roadmap` | Refresh the roadmap and recommendations for an assessment |

## Analyze request

```json
{
  "targetRole": "AI Engineer",
  "targetCompany": "Google",
  "experienceLevel": "Fresher"
}
```

The engine automatically uses the authenticated user's profile, interview/coding statistics, and the latest uploaded resume. It saves current, missing, recommended, and future skills; an overall score; seven-part readiness breakdown; company readiness scores; a five-week roadmap; and recommendations.

## Refresh roadmap

```json
{ "assessmentId": "mongo-assessment-id" }
```

This creates an updated roadmap using the same shared AI provider boundary as the Career Assistant and Resume Analyzer. Gemini and Cloudinary credentials are configured separately in `backend/.env`; this module requires Gemini but does not require Cloudinary unless a resume is being used as context.
