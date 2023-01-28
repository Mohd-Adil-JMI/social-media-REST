# social-media-REST

## Tech Stack
- Node Js
- Express
- MongoDB
# Environment Variables
```
JWT_SECRET=SECRED_KEY_FOR_JWT
MONGODB_URL_DEV=MONGODB_SERVER_URL
PORT=3000
```
# API Docs
### User Routes
#### Authorization Header
`Bearer <token>`
| USE | PATH | METHOD | REQUEST BODY | STATUS
| ------ | ------ | ------ | ------ | ------ |
| CREATE | /users | POST | name,username,password | CREATED |
| LOGIN | / users/login | POST | username,password | OK |
| LOGOUT | /users/logout | POST |  | OK |
| LOGOUT ALL | /users/logoutall | POST |  | OK |
| READ USER | /users/me | GET |  | OK |
| DELETE USER | /users/me | DELETE |  | OK |
| READ PROFILE  | /users/:username | GET |  | OK |
| READ FOLLOWERS  | /users/:username/followers | GET |  | OK |
| READ FOLLOWINGS  | /users/:username/followings | GET |  | OK |
| FOLLOW USER  | /users/:username/follow | POST |  | OK |
| UNFOLLOW USER  | /users/:username/follow | DELETE |  | OK |

### POST Routes
#### Authorization Header
`Bearer <token>`
| USE | PATH | METHOD | REQUEST BODY | STATUS |
| ------ | ------ | ------ | ------ | ------ |
| CREATE POST | /posts | POST | description | CREATED |
| READ POSTS | /posts | GET |  | OK |
| READ POST | /posts/:id | GET |  | OK |
| UPDATE POST | /posts/:id | PATCH | description | OK |
| DELETE POST | /posts/:id | DELETE |  | OK |


  
