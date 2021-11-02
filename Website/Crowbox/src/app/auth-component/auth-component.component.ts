import { Component, OnInit } from '@angular/core';

//firebase
import { AngularFireAuth } from '@angular/fire/auth';

import firebase from 'firebase/app';

//shared service
import { SharedService } from '../services/shared.service';

//for router navigation and sending user id
import { Router } from '@angular/router';


@Component({
  selector: 'app-auth-component',
  templateUrl: './auth-component.component.html',
  styleUrls: ['./auth-component.component.css']
})
export class AuthComponentComponent implements OnInit {

  currentAuth: any = null;

  userId?:string;

  constructor(public auth: AngularFireAuth, private sharedService: SharedService, private router: Router) { }

  ngOnInit(): void {
/*     this.sharedService.useridMessage$.subscribe(x => this.userId = x);
 */  
    this.printUserId();
    this.sendUserData();
  }


  login() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
  logout() {
    this.auth.signOut();
  }

  printUserId() {
    this.auth.authState.subscribe( authState => {
      this.currentAuth = authState;
      this.userId = this.currentAuth.uid;

      //I want to send this uid to the test-update component
      /* console.log(this.currentAuth.uid);
      console.log(this.currentAuth.email); */
    })
  }

  sendUserData(){
    
    if (this.userId) {
      this.sharedService.userId = this.userId;
      this.sharedService.storeDataInSession();
      this.router.navigate(['data']);

    } else {
      console.log("User Id has not been set");
    }
  }

/*   sendUserData(){
    if(this.userId) {
      console.log(this.userId);
      this.sharedService.sendUserId(this.userId);
    } else {
      console.log("User Id has not been set");
    }
  } */



}
