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

  constructor(private handleAuth: HandleAuthService, private router:Router) { }

  ngOnInit(): void {
  }

  login() {
    //user the auth service to login or signup the user
    this.handleAuth.login();
    //after logging in or signing up, redirect to the data section
    this.router.navigate(['data']);
  }

}
