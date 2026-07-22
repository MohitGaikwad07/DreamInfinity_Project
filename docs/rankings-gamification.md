# Rankings, Gamification & Achievements

The authenticated rankings dashboard is at `/rankings`. It presents XP and level progress, current and longest streaks, coins, career score, challenges, earned badges, reward activity, and global/weekly/monthly leaderboards.

## API

Endpoints are available under `/api/gamification` and `/api/v1/gamification` with bearer authentication.

- `GET /profile` — progression, career score, streaks, achievements, activities, challenges, and rank
- `GET /leaderboard?period=all|weekly|monthly` — leaderboard data
- `GET /achievements` and `GET /challenges` — profile collections
- `POST /update-xp` — reusable service endpoint for awarding XP and coins

## Reward integration

The reward service is invoked only from trusted backend actions—never from the browser—so users cannot self-award XP. The following platform activities now produce a recorded reward, update XP/coins/level/streak, and progress active challenges:

- first login each day
- resume uploads and improved resume analyses
- completed AI mock interviews
- coding attempts and solved coding problems
- community posts and answers
- generated learning roadmaps
- company-readiness assessments

`grantXp` is the shared reward service. It updates daily and longest streaks, level, coins, XP activity history, and active daily/weekly/monthly challenge progress. Achievement checks use the same stored coding, interview, community, XP, and streak data whenever a gamification profile is loaded or XP is granted.

## Frontend

`/rankings` is an authenticated, responsive progression dashboard. It includes level XP progress, streak and coin counters, career-score breakdown, challenge cards, animated-tier badge cards, reward history, and all-time/weekly/monthly leaderboards. Redux keeps the profile and leaderboard data in `gamificationSlice`.
