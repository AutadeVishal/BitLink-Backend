#devTinder APIs

AuthRouters:
-POST /auth/signup
-POST /auth/login
-POST /auth/logout

profileRouter
-GET /profile/view
-PATCH /profile/edit
-PATCH /profile/password

connectionRequestRouter
-POST /request/send/interested/:userID
-POST /request/send/ignored/:userID
-POST /request/review/accepted/:request_D
-POST /request/review/rejected/:requestID


-GET /user/connections
-GET /requests/received
-GET /feed -Gets you the profiels of the other users 