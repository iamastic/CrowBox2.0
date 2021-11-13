import { Injectable, NgZone } from '@angular/core';

//firebase
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
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

  constructor(private fireAuth: AngularFireAuth, private ngZone: NgZone, private router: Router) { 
    /* initialise the currentUserId to that of the local storage */
/* 
    this.fireAuth.authState.subscribe(user => {
      if (user) {
        console.log("User is LOGGED IN");
        this.currentUserState = {
          uid: user.uid!,
          email: user.email!,
          displayName: user.displayName!
        };

        console.log("Current User State is:");
        console.log(this.currentUserState);

        localStorage.setItem('user', JSON.stringify(this.currentUserState));
      } else {
        console.log("User is not logged in?");
        localStorage.setItem('user', "null");
      }
    }) */

    
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


  login() {
    /* Sign in or Sign Up with google's pop up.
    This essentially kills two birds with one stone. */

    return this.googleLogin( new firebase.auth.GoogleAuthProvider());
  }

  get isLoggedIn():boolean {

    console.log("INSIDE isLoggedIn()");
/* 
    const item = localStorage.getItem('user');
    if (item !=='undefined' && item!==null) {
      const currentUser = JSON.parse(item);
      return (currentUser !== null)? true: false;
    } else {
      console.log("USER IS NOT LOGGED IN");
      return false;
    }   
 */
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
    
/*     console.log("INSIDE isLoggedIn()");
    this.fireAuth.user
    .subscribe(result => {
      if(result) {
        console.log(result.displayName);
        return true;
      } else {
        console.log("USER IS NOT LOGGED IN");
        return false;
      }
    }); */

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
