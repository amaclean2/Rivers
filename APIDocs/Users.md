# Using the Sunday Peak Users API

This section describes the actions you can take on users with the Sunday Peak api.

## Login a User

To login a user, you can pass an email and password to the login API endpoint. This will return a user object and an auth token that you can use in your session to complete further requests.

The login API doesn't require an auth token because it is a token-generating-request. Information about the user such as password hashes are hidden, since this isn't needed or usefull information.

### Login endpoint

```bash
https://api.sundaypeak.com/users/login

Content-Type: "application/json"
HTTP Method: POST
```

**Request Body:**
```javascript
{
    email: String,
    password: String,
    native: Boolean
}
```

| Key | Type | Description |
|--|--|--|
|`email`|String|formatted with an `@` separating an indentifier and a domain|
|`password`|String|*Note: This request is secured with a TLS certificate so any data passed over `https` will be encrypted*|
|`native`|Boolean|telling the backend whether this login is happening on a native app or a webapp|

**Response:**
```javascript
{
    data: {
        user: User,
        token: String
    },
    statusCode: Number,
    timestamp: Number
}
```

The `user` object is [described below](#user)  
`token` is a jwt used to identify the session as unique  

**Error Response:**
```javascript
{
    error: {
        message: String,
        handled: Boolean,
        request_body: Object,
        code_error: String | Object
    },
    statusCode: Number
}
```

**Description:**
`message` is the text sent back describing what went wrong  
`handled` describes whether the error was described and caught before the final return or not  
`request_body` as [described below](#request-body)  
`code_error` gives the iternal description of the error if it was handled. Can give more context to the error  
`status_code` is the code of the returned error  


## Object Breakdowns

### User

The User object contains all the relevant data about a given user. When a login, signup, or `getOtherUser` call is made, the User object is returned as part of the response object

```javascript
user: {
    first_name: String
    last_name: String
    email: String
    bio: String
    city: String
    id: Number
    phone: String
    user_site: String
    profile_picture_url: String
    email_opt_out: Boolean
    friends: Friend[]
    images: String[]
    completed_adventures: CompletedAdventure[]
    todo_adventures: TodoAdventure[]
}
```

**Description:**
|Key|Type|Description|
|--|--|--|
|`first_name`|String| |
|`last_name`|String| |
|email`|String| |
|`bio`|String| |
|`city`|String| |
|`id`|Int| |
|`phone`|String| |
|`user_site`|String|A url string depecting any website the user wishes to post in conjunction with their profile |
|`profile_picture_url`|String|A url string pointing to the Sunday Peak CDN|
|`email_opt_out`|Boolean|Describing whether the user has opted out of marketing emails|
|`friends`|[Friend](#friend)[]| |
|`images`|String[]| |
|`completed_adventures`|[Completed Adventure](#completed-adventure)[]| |
|`todo_adventures`|[Todo Adventure](#todo-adventure)[]| |

### Friend

The friend object is a modified subset of the User object.

```javascript
friend: {
    user_id: Number
    display_name: String
    first_name: String
    profile_picture_url: String
    email: String
    email_opt_out: Boolean
}
```

**Description:**

`user_id` references the id of the user  
`display_name` is a concatenated version of the users first and last names  
`first_name` the users first name  
`profile_picture_url` a web link to an image  
`email` an email string  
`email_opt_out` a boolean referencing whether the user has opted out of emails or not  

### Completed Adventure

The completed adventure is a modified subset of the Adventure object.

```javascript
completed_adventure: {
    creator_id: Number
    adventure_name: String
    adventure_type: String
    nearest_city: String
    adventure_id: Number
    user_id: Number
}
```

**Description:**

`creator_id` the id of the adventure creator  
`adventure_name` the name of the adventuren  
`adventure_type` type [AdventureType](https://github.com/amaclean2/Rivers/blob/main/APIDocs/Adventures.md#adventuretype)  
`nearest_city` a string denoting city and state  
`adventure_id` the id of the adventure  
`user_id` the user who completed the adventure  

### Todo Adventure

The todo adventure is a modified subset of the Adventure object.

```javascript
todo_adventure: {
    adventure_name: String
    adventure_type: String
    nearest_city: String
    adventure_id: Number
}
```

**Description:**

`adventure_name` the name of the adventure  
`adventure_type` type [AdventureType](https://github.com/amaclean2/Rivers/blob/main/APIDocs/Adventures.md#adventuretype)  
`nearest_city` a string denoting city and state  
`adventure_id` the id of the adventure  

### Request Body

The body sent with the request. Usually delivered as a proerty of an error response. This will include all the properties sent. If the request was altered in sanitization when it reached the server, this will include the sanitized body.
