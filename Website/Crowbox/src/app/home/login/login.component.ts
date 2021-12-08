import { Component, OnInit } from '@angular/core';
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  userEmail = new FormControl('', [Validators.required, Validators.email]);
  userPassword = new FormControl('', [Validators.required]);

  hide = true;

  constructor(private handleAuth:HandleAuthService) { }

  ngOnInit(): void {
  }

  login() {
    if (this.userEmail.value && this.userPassword.value) {
      this.handleAuth.login(this.userEmail.value, this.userPassword.value);
    } else {
      alert("Oh no! Something has gone wrong and we could not log you in...please try again.");
    }
  }
  
  getErrorMessage() {
    if (this.userEmail.hasError('required')) {
      return 'You must enter a value';
    }

    return this.userEmail.hasError('email') ? 'Not a valid email' : '';
  }

}
