# Human Video Interviews

Authenticated users can create, join, and schedule interview rooms through `/api/interview-room`. Socket.IO authenticates with the same JWT and carries WebRTC signaling, chat, shared notes, whiteboard state, and collaborative-editor updates.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/create` | Create an active room and unique room ID |
| POST | `/join` | Join a room by room ID (two participants maximum) |
| POST | `/schedule` | Schedule an interview room |
| GET | `/history` | Get the user's rooms and invitations |
| POST | `/:roomId/rate` | Submit post-interview rating feedback |

The browser provides camera/microphone control, screen sharing, room-link copying, Socket.IO reconnects, chat, shared notes, and the Monaco collaborative code surface. WebRTC offer/answer/ICE messages are exposed through the `signal` socket event for peer-connection wiring in a TURN-enabled production deployment.
