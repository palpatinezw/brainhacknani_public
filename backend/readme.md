# Backend Documentation for Sigma

I love creating backends from scratch. aw yeah

- [Users](https://github.com/palpatinezw/brainhacknani/tree/backend#users)
- [Flairs](https://github.com/palpatinezw/brainhacknani/tree/backend#flairs)
- [Admissions](https://github.com/palpatinezw/brainhacknani/tree/backend#admissions)
- [Circle Data](https://github.com/palpatinezw/brainhacknani/tree/backend#circle-data)
- [Example implementation](https://github.com/palpatinezw/brainhacknani/tree/backend#example-implementation-with-fetch)

# Help and Logs

If you wish to create a video recording demonstrating functionality of the app, refer to help.txt for more information. For reference, logs.txt contains ALL the calls used to set-up the backend as needed (users bob and jon were created beforehand).

# API endpoints:

## Users

**`/create`**

*Function: create an account on the platform*

*access method: GET with query params*

username: username

password: password in plaintext form

*returns:* JSON Object with success key set to 0/1 for failure/success, eg.
`{ success: 1, info: "created user" }`

<br>

**`/login`**

*Function: login to the platform*

*access method: GET with query params*

username: username

password: password in plaintext form

*returns:* JSON Object with success key set to 0/1 for failure/success

<br>

**`/create_circle`**

*Function: create a circle with specified settings*

*access method: GET with query params*

*info: This endpoint creates a circle with the current user as the only member, with full admin privs*

username: username

password: password in plaintext form

circleName: name of the circle

circleVis: visibility of the circle ("private" for circles that require moderators to accept user's requests to join)

circleInfo: string containing a brief description about the circle

*returns:* JSON Object with success key set to 0/1 for failure/success

<br>

**`/my_circles`**

*Function: retrieves all circles that a user currently belongs to.*

*access method: GET with query params*

username: username

password: password in plaintext form

Returns:

```
{
	success: 0/1,
	results: [{
		name: "Apple some circle",
		flairs: ["Owner", "Member", "Janitor"]
	}, {
		name: "Boy some other circle",
		flairs: ["Owner", "Member", "Coolguy"]
	}]
}
```

The results are ordered in alphabetical order.

<br>

<br>

## Flairs

**`/create_flair_info`**

*access method: GET with query params*

username: username

password: password in plaintext form

circleName: name of the circle

returns: where power is an integer >= 0

`{
	success: 1,
	power: 0-9,
	allowCreateFlairs: 0/1,
	allowAcceptMembers: 0/1
}` OR 

`{ success: 0 }` for all failures (unauth, no flairs, no flairs allowed to be assigned etc)

<br>

**`/create_flair`**

*Function: create a specified flair*

*access method: GET with query params*

username: username

password: password in plaintext form

circleName: name of the circle

flairName: name of the flair user is intending to create

flairPower: power of the flair. Must be larger power then the user's power found from `/create_flair_info`

flairAssign **(deprecated)**: 0/1. If the user is found to be able to assign flairs from `/create_flair_info` (eg. `allowAssignFlairs: 1`), this value for the target flair can be set to 0/1, corresponding to dis/allow. Conversely, if the user is unable to assign flairs, he can only create roles that cannot assign flairs (eg. `flairAssign: 0`)

flairCreate: 0/1. Same concept as flairAssign.

flairAccept: 0/1. Same concept as flairAssign.

Returns: JSON Object with success key set to 0/1 for failure/success

<br>

**`/assign_flair_info`**

*access method: GET with query params*

username: username

password: password in plaintext form

circleName: name of the circle

newuser: 0/1. If the user has not yet joined a circle but wishes to look at available flairs for new members, newuser should be set to 1.

Returns:

```
{
	success: 0/1,
	availableFlairs: [
		{
			name: "sample Flair",
			id: 1, // unique id on server
			active: 0/1, // whether flair should be shown to user or hidden
			power: 3, // integer >= 0
			allowCreateFlair: 0/1,
			allowAcceptMembers: 0/1
		}
	]
}
```

<br>

**`/assign_flair`**

*Function: assign specified flairs to specified users*

*access method: GET with query params*

username: username

password: password in plaintext form

circleName: name of the circle

flairNames: one string that represents the name of the flairs to be applied to each of the users. The string should follow this format: `"a,b0c,d"` where a and b are the flairs to be applied to the first user, and c and d are the flairs to be applied to the user (eg. 0 is used as a primary separator and , is used as the secondary separator). The clientside implementation from a 2D array is as follows. Each flair acts as a toggle (eg. if a user already has the flair, it is removed). Alternate usage: pass only one string that represents the name of the one flair to be applied to each of the users (eg. `"a"`).

```
x = [["a", "b"], ["c", "d"]]
res = ""
for (let y of x) {
	res += y.toString() + "0"
}
res = res.slice(0, -1)
```

targetUsernames: stringified list of usernames corresponding to the 2D flair list (eg. `"tom,bob"`). The clientside implementation is `usernames = ["tom", "bob"]; return usernames.toString()`.

Returns: JSON Object with success key set to 0/1 for failure/success. 1 only indicates that *at least one* flair was successfully applied to one user. However, most of the times you don't have to worry about this and you can just take it to indicate complete success.

<br><br>

## Admissions

**`/join_circle`**

*Function: join a specified circle*

*access method: GET with query params*

username: username

password: password in plaintext form

circleName: name of the circle

Returns: 

```
{
	success: 0/1,
	info: "banned/pending/joined/unaffected"
}
```

Pending means having sent a request for a private server that has not been un/accepted. Unaffected means none of the previous statuses. It is possible that the info value is not set if success is 0, if an error was thrown.

<br>

**`/join_circle_status`**

*Function: find the user's status on the joining process of a specified circle*

*access method: GET with query params*

username: username

password: password in plaintext form

circleName: name of the circle

Returns: 

```
{
	success: 0/1,
	info: "banned/pending/joined/unaffected"
}
```

Pending means having sent a request for a private server that has not been un/accepted. Unaffected means none of the previous statuses. It is possible that the info value is not set if success is 0, if an error was thrown.

<br>

**`/leave_circle`**

*Function: leave a specified circle. Checks if user is in the circle first.*

*access method: GET with query params*

username: username

password: password in plaintext form

circleName: name of the circle

Returns: 

```
{
	success: 0/1,
}
```

<br>

**`/accept_member_info`**

*Function: view the users that have sent a request to join the private server. Checks if user has privileges to accept new members.*

*access method: GET with query params*

username: username

password: password in plaintext form

circleName: name of the circle

Returns: 

```
{
	success: 0/1,
	pendingUsers: ["bob", "jon"]
}
```

<br>

**`/accept_member`** 

*Function: accept one user that has sent a request to join the private server. Checks if user has privileges to accept new members.*

*access method: GET with query params*

username: username

password: password in plaintext form

circleName: name of the circle

targetUsername: username of the user trying to join the server

action: "ban/decline/accept" the action to be taken on the user

Returns: 

```
{
	success: 0/1,
}
```

<br>

**`/kick`**

*Function: kicks user from a circle. Additional use: ban a user regardless of whether he is currently in the server.*

*access method: GET with query params*

username: username

password: password in plaintext form

circleName: name of the circle

targetUsername: username of the user trying to join the server

ban: 0/1 whether the additional use should be exercised

Returns: 

```
{
	success: 0/1
}
```

<br>

<br>

## Circle Data

**`/get_members`**

*Function: lists the members in a circle. User has to be a member of the circle.*

*access method: GET with query params*

username: username

password: password in plaintext form

circleName: name of the circle

Returns: (the value of members is another object, with member usernames as keys, and members' flairs as values)

```
{
	success: 0/1,
	members: {
		bob: ["Owner"]
	}
}
```

<br>

**`/get_circle_data`**

*Function: retrieves information about a circle regardless of if user is in the circle.*

*access method: GET with query params*

username: username

password: password in plaintext form

circleName: name of the circle

Returns: 

```
{
	success: 0/1,
	circle: {
		name: "sample circle",
		vis: "public/private",
		flairs: ["Owner", "therapist"],
		infoText: "This is a cool circle that I created"
	}
}
```

The circle key is only defined if success is 1.

<br>

**`/search_circles`**

*Function: retrieves information about a circle regardless of if user is in the circle.*

*access method: GET with query params*

username: username

password: password in plaintext form

searchstring: string to search for in the names of all circles

Returns:

```
{
	success: 0/1,
	results: ["wood", "woodworking", "chuckers of wood"]
}
```

The search results are ordered such that results that match the searchstring ("wood") completely are first. They are followed by circles that start with the searchstring ("wood"-"working"). Circles that contain the searchstring anywhere in the name are last.

<br><br>

# Explanation of power:

How "power" works for the flairs is that 0 is the person with most abilities, and you can only un/assign other members flairs that correspond to a higher power than yours (I know this idea of lower power being better is kinda unintuitive). Comparison of the absolute value or magnitude of the power will use "larger/smaller", eg. 5 is larger than 3. Comparison of the meaning of the power will use "stronger/weaker", eg. 3 is stronger than 5.

<br><br>

# Example implementation with fetch:

*host: http://flyyee-brainhackserver.herokuapp.com/*

```
fetch('http://flyyee-brainhackserver.herokuapp.com/create?username=${username}&password=${password}')
.then(response => response.json())
.then(data => if (data.success == 1) { console.log("good") } )
```



