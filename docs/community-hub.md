# Community Hub

The Community Hub is available at `/community` after sign-in. Members can publish interview experiences, questions, discussions, articles, preparation guides, tips, notes, and resources. Posts support company, role, result, difficulty, and tag metadata.

## API

All endpoints require a bearer token. The backend exposes both `/api/community` and `/api/v1/community`.

- `GET /feed` — searchable/filterable post feed (`company`, `type`, `tag`, `search`, `result`, `difficulty`)
- `POST /post` — create a post
- `GET /company/:company` — company overview, experiences, and questions
- `GET /comments/:postId`, `POST /comment` — threaded comments
- `POST /vote`, `POST /bookmark`, `GET /bookmarks`, `POST /follow`, `POST /report`
- `GET /insights` — community topic analysis for the AI insight card

## Persistence

MongoDB collections cover company profiles, posts, comments, votes, bookmarks, follows, and moderation reports. New posts award 15 XP; comments award 5 XP. Admin workflows can use the stored report status and post status fields for moderation.
