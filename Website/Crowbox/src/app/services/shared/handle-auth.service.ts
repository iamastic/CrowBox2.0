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
          return {uid: user.uid, email:user.email, displayName:user.displayName}
        } else {
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
    const item = localStorage.getItem('user');
    if (item !=='undefined' && item!==null) {
      const currentUser = JSON.parse(item);
      return (currentUser !== null)? true: false;
    } else {
      return false;
    }
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
      localStorage.removeItem('user');
      this.router.navigate(['home']);
    });
  }
}
