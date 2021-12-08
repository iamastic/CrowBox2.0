## User Authentication

To set up User Authentication, I followed a [gudie](https://remotestack.io/angular-firebase-authentication-example-tutorial/) as well as the [Angular Fire docs](https://github.com/angular/angularfire/blob/master/docs/auth/getting-started.md). 

Currently, I have kept it very simple. I am only offering a login method for the user. First, to use the Authentication functions, I need to import two libraries into an Authentication Service I set up called `HandleAuthService`:

```js
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
```

In the same service, I declare two variables; one two handle the entirety of the user's data and another to store the user's uniquely generated ID:
```js
  currentUserData: any = null;
  currentUserId: any;
```

I injected the AngularFireAuth into the constructor. Then, to allow the user to login, this was the function: 
```js
  login() {
    /* Sign in or Sign Up with google's pop up.
    This essentially kills two birds with one stone. */
    this.fireAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());

    /* Once the user has signed up or in, store their data in
    the local storage. */
    this.fireAuth.authState.subscribe( authState => {
      //grab the user data from the auth state
      this.currentUserData = authState;
      //store the user id (uid) in the local storage
      if (this.currentUserData.uid) {
        this.currentUserId = this.currentUserData.uid;
        console.log("Setting the uid in localstorage" + this.currentUserId);
        localStorage.setItem('uid', this.currentUserId);
      } else {
        console.log("Error in retrieving user data from Auth");
      }
    });
  }
```
The user's data was stored locally in their browser's storage. This is so that they do not have to constantly login every time the page refreshes. 

In another component, called the `AuthComponent`, which is placed on the Home Page, I injected this service into it so that I may make use of its functions. A simple button was set up in the view page of the `AuthComponent` which when clicked, invoked the `login()` function. Upon loggin in, I then redirected the user to the Data component/page. 

```js
    this.router.navigate(['data']);
```

The Data Component also injected the `HandleAuthService` and had access to the user's unique ID. Using this ID, it generates a new node in the Firebase Database if one doesn't already exist for said user. 
