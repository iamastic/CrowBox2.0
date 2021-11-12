import { Injectable, NgZone } from '@angular/core';

//firebase
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/app';

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

  currentUserState?: User;

  constructor(private fireAuth: AngularFireAuth, private ngZone: NgZone, private router: Router) { 
    /* initialise the currentUserId to that of the local storage */
    //this.currentUserId = localStorage.getItem('uid');
    //console.log("Got the user id from localstorage " + this.currentUserId);

    this.fireAuth.authState.subscribe(user => {
      if (user) {
        console.log("user is already logged in");
        this.currentUserState = {
          uid: user.uid!,
          email: user.email!,
          displayName: user.displayName!
        };

        console.log(this.currentUserState);
        localStorage.setItem('user', JSON.stringify(this.currentUserState));
        //JSON.parse(localStorage.getItem('user' || "{}"));
      } else {
        console.log("User is not logged in?");
        localStorage.setItem('user', "null");
        //JSON.parse(localStorage.getItem('user')!);
      }
    })
  }

  login() {
    /* Sign in or Sign Up with google's pop up.
    This essentially kills two birds with one stone. */

    return this.googleLogin( new firebase.auth.GoogleAuthProvider());


/*     this.fireAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
 */
    /* Once the user has signed up or in, store their data in
    the local storage. */
/*     this.fireAuth.authState.subscribe( authState => {
 *//*       //grab the user data from the auth state
 *//*       this.currentUserData = authState;
 */      //store the user id (uid) in the local storage
/*       if (this.currentUserData.uid) {
        this.currentUserId = this.currentUserData.uid;
        console.log("Setting the uid in localstorage" + this.currentUserId);
        localStorage.setItem('uid', this.currentUserId);
      } else {
        console.log("Error in retrieving user data from Auth");
      }
    }); */
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
