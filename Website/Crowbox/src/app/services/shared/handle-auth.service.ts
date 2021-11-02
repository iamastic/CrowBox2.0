import { Injectable } from '@angular/core';

//firebase
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class HandleAuthService {

  /* Here, we store the user's data upon them signing in or signing up. 
  This is initialised to null.  */
  currentUserData: any = null;

  currentUserId: any;

  constructor(private fireAuth: AngularFireAuth) { 
    /* initialise the currentUserId to that of the local storage */
    this.currentUserId = localStorage.getItem('uid');
  }

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
        localStorage.setItem('uid', this.currentUserId);
      } else {
        console.log("Error in retrieving user data from Auth");
      }
    });
  }

  logout() {
    //simply log out the user
    this.fireAuth.signOut();
  }

}
