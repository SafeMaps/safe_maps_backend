# Authentication

## Signup
To signup a user, make a POST request to /signup and pass a username and password through a JSON body request.
You will receive a JSON Web Token through a field called "token" in the JSON response.
Save this token in the devices storage using AsyncStorage in react native.

A status of 200 will be returned along with the data. 403 if the request failed. 500 if there was an internal server failure.

## Signin
To signin a user, make a GET request to /signin with the username and password through a JSON body request. Same as Signup, 
you will receive a JWT through the JSON body response from a field called "token"
A status of 200 will be returned along with the data. 403 if the request failed. 500 if there was an internal server failure.

## Logout
For logout, simply revoke the token in storage, and forward the user back to the login page.

## Authorization

Make sure that the user always has a JWT within the storage before they can use any of the protected features of the app.
If they don't, forward the user to the login page.

For protected endpoints, make sure to retrieve the JWT from storage and send the JWT through an Authorization header like so:

Authorization: 'Bearer ${token}'

Otherwise you will get an invalid response.

If you are sending and expecting to receive JSON, simply pass these headers:

  Accept: 'application/json',
  'Content-Type': 'application/json',