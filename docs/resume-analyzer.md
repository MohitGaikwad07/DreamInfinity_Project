# Resume Analyzer API

All endpoints require `Authorization: Bearer <token>`. Both `/api/resume` and `/api/v1/resume` are supported.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/upload` | Upload a PDF/DOCX resume and create its AI analysis |
| GET | `/` | List the authenticated user's resume history |
| DELETE | `/:id` | Delete a resume record and its Cloudinary file |
| POST | `/analyze` | Re-run analysis of an existing resume |

## Upload

Send `multipart/form-data` with:

- `resume`: PDF or DOCX, maximum 8 MB
- `targetRole`: one of Frontend Developer, Backend Developer, Full Stack Developer, Java Developer, Python Developer, Data Analyst, AI Engineer, or DevOps Engineer

The response contains the file metadata, ATS score and breakdown, categorized skills, missing skills, extracted sections, and AI suggestions. Original files are stored in Cloudinary; extracted text is retained server-side only for re-analysis and is excluded from standard response serialization.

## Re-analyze

```json
{
  "resumeId": "mongo-resume-id",
  "targetRole": "AI Engineer",
  "context": {
    "jobDescription": "Optional future job-description context"
  }
}
```

Analysis uses the shared `AIService` facade so resume data and context can be reused by Skill Gap Analyzer, job recommendations, and the AI Career Assistant. Configure `GEMINI_API_KEY` and Cloudinary credentials in `backend/.env` before testing.
