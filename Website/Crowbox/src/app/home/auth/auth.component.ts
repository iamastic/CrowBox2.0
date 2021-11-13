import { Component, OnInit } from '@angular/core';

//a provider service to handle sending the user data from auth component to data section
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

//for router navigation and sending user information to the data section
import { Router } from '@angular/router';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {  

  showSignUp!: boolean;

  constructor(private handleAuth: HandleAuthService, private router:Router) {

  }

  ngOnInit(): void {
    if(this.isLoggedIn()){
      this.showSignUp = false;
    } else {
      this.showSignUp = true;
    }

    console.log("To SHOW Sign up Sign: "+this.showSignUp);
  }

  isLoggedIn() {
    return this.handleAuth.isLoggedIn;
  }

  login() {
    //user the auth service to login or signup the user
    this.handleAuth.login();
  }

  logout() {
    this.showSignUp = true;
    this.handleAuth.logout();

  }

}
