# Authentication API

Base path: `/api/v1/auth`  
Protected endpoints require `Authorization: Bearer <token>`.

## Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/register` | No | Create a user and receive a JWT |
| POST | `/login` | No | Authenticate and receive a JWT |
| POST | `/logout` | Yes | End the client session (JWT is removed client-side) |
| GET | `/me` | Yes | Return the current user |
| PATCH | `/profile` | Yes | Update the name and avatar metadata |
| PATCH | `/change-password` | Yes | Verify the current password and set a new one |

## Request examples

### Register

```json
{
  "name": "Avery Singh",
  "email": "avery@example.com",
  "password": "StrongPass#2026"
}
```

### Login

```json
{
  "email": "avery@example.com",
  "password": "StrongPass#2026"
}
```

### Update profile

```json
{
  "name": "Avery Singh",
  "avatar": { "url": "https://example.com/avatar.png", "publicId": "avatars/avery" }
}
```

### Change password

```json
{
  "currentPassword": "StrongPass#2026",
  "password": "EvenStronger#2027"
}
```

Passwords require at least eight characters and must include uppercase, lowercase, numeric, and special characters. Validation errors return HTTP `422` with an `errors` array. Successful registration/login responses contain `{ success, token, user }`; passwords are never included in responses.

## Local run and testing

1. Copy `backend/.env.example` to `backend/.env` and provide MongoDB and JWT values.
2. Copy `frontend/.env.example` to `frontend/.env` if the API is not running on the default URL.
3. From repository root, run `npm run dev:backend` and `npm run dev:frontend` in separate terminals.
4. Register through `/register`, then confirm redirection to `/dashboard`; refresh to verify `GET /me` restores the user.
5. Confirm a guest cannot open `/dashboard`, an authenticated user cannot open `/login`, invalid passwords return validation feedback, and logout clears access.

For API-only tests, use any HTTP client against `http://localhost:5000/api/v1/auth`. Ensure the bearer token is attached to protected requests.
