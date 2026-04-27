# BitLink APIs

## Auth
- POST /auth/signup
- POST /auth/login
- POST /auth/logout

## Profile
- GET /profile/view
- PATCH /profile/edit

## Connection Requests
- POST /connection/request/send/interested/:toUserEmail
- POST /connection/request/send/ignored/:toUserEmail
- POST /connection/request/review/accepted/:fromUserEmail
- POST /connection/request/review/rejected/:fromUserEmail

## User Discovery
- GET /request/connections
- GET /request/view
- GET /request/feed

### /request/feed Query Params
- page
- limit
- search
- minAge
- maxAge
- gender or genders (comma separated)
- skills (comma separated)
- minSkillLevel (1-10)
- maxSkillLevel (1-10)
- projectTypes (comma separated)

## Projects
- POST /project/create
- GET /project/mine

## Chat
- GET /chat/inbox
- GET /chat/:targetUserId
- POST /chat/:targetUserId/read