/* CODE GUIDED BY AND ADAPTED FROM: https://remotestack.io/angular-firebase-authentication-example-tutorial/ */

import { Injectable, NgZone } from '@angular/core';

//firebase
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

export interface User {
  uid: string;
  email: string;
  displayName: string;
}

@Injectable({
  providedIn: 'root'
})
export class HandleAuthService {

  /* Here, we store the user's data upon them signing in or signing up. 
  This is initialised to null.  */
  currentUserData: any = null;

  currentUserId: any;
  currentUser$:Observable<any>;

  currentUserState?: User;

  //to be set when signing up only
  userName:any;
  userLocation:any;

  constructor(private fireAuth: AngularFireAuth, private ngZone: NgZone, private router: Router) { 

    this.userLocation = "null";
    /* initialise the currentUserId to that of the local storage */    
    this.currentUser$ = this.fireAuth.authState.pipe(
      take(1),
      map(user => {
        if (user) {
          console.log("User is LOGGED IN - handleAuth Constructor");
          //set the local storage here to "loggedIn"
          localStorage.setItem('userStatus', "loggedIn");
          return {uid: user.uid, email:user.email, displayName:user.displayName}

        } else {
          console.log("User is NOT logged in - handleAuth Constructor");
          localStorage.setItem('userStatus', "loggedOut");
          return null;
        }
      })
    );
  }

  signUp(email:string, password:string, name:string, location?:string) {
    this.fireAuth.createUserWithEmailAndPassword(email, password)
    .then(value => {
      //save all the data? Not sure how...
      console.log("Inside HandleAuth - New User has signed up!");
      this.userName = name; 
      this.userLocation = location;
      console.log("User's name is: " + this.userName + " User's Location is: " + this.userLocation);
      this.router.navigate(['data']);
    })
    .catch(error => {
      console.log("User was not able to sign up: " + error);
      alert("Account with this Email already exists!");
    })
  }

  login(email:string, password:string) {
    /* Sign in or Sign Up with google's pop up.
    This essentially kills two birds with one stone. */

    //return this.googleLogin( new firebase.auth.GoogleAuthProvider());
    this.fireAuth.signInWithEmailAndPassword(email, password)
    .then(value => {
      console.log("HandleAuth - User has logged in");
      this.router.navigate(['data']);
    })
    .catch(error => {
      console.log("HandleAuth - Unable to log in - there is some issue!");
      alert("This Email/Password combination is incorrect, please try again.");
    })
  }

  get isLoggedIn():boolean {

    console.log("INSIDE isLoggedIn()");
    const userStatus = localStorage.getItem('userStatus');
    if(userStatus === "loggedIn") {
      console.log("USER IS LOGGED IN - isLoggedIn()");
      return true;
    } else if (userStatus === "loggedOut") {
      console.log("USER is NOT LOGGED IN - isLoggedIn()");
      return false;
    } else {
      console.log("USER is NOT LOGGED IN - isLoggedIn()");
      return false;
    }
  }

  getAuthUser$(): Observable<any> {
    return this.fireAuth.user;
  }

  printAuthState() {
    console.log(this.fireAuth.authState);
  }

  googleLogin(provider:any) {

    return this.fireAuth.signInWithPopup(provider)
    .then((result)=> {
      this.ngZone.run(() => {
        this.router.navigate(['data']);
      });
      this.setUser(result.user);
    })
    .catch((error) => {
      console.log(error);
    })

  }


  setUser(result:any) {
    this.currentUserState = {
      uid : result.uid,
      email : result.email,
      displayName : result.displayName
    };
  }

  logout() {
    //simply log out the user
    return this.fireAuth
    .signOut()
    .then(()=> {
      localStorage.removeItem('userStatus');
      this.router.navigate(['home']);
    });
  }
}
