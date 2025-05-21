# USER

## Register User

Endpoint: POST /api/users

Request Body:

```json
{
  "username": "najah",
  "email": "najah121@gmail.com",
  "password": "N47ah"
}
```

Response Body:

```json
{
  "data": {
    "username": "najah",
    "email": "najah121@gmail.com"
  },
  "status": "berhasil mendaftar"
}
```

## Login User

Endpoint: GET api/users/login

## Update User

Endpoint: PATCH api/users/current

## Logout User

Endpoint: DELETE /api/users/current

