import { Component, OnInit } from '@angular/core';
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

import {FormControl, Validators} from '@angular/forms';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  userEmail = new FormControl('', [Validators.required, Validators.email]);

  userName = new FormControl('', [Validators.required]);

  userLocation = new FormControl('', [Validators.required]);

  userPassword = new FormControl('', [Validators.required]);

  hide = true;


  constructor(private handleAuth:HandleAuthService) { }

  ngOnInit(): void {
  }

  signUp() {
    if (this.userEmail.value && this.userPassword.value && this.userLocation.value && this.userName.value) {
      this.handleAuth.signUp(this.userEmail.value, this.userPassword.value,this.userName.value,this.userLocation.value);
    } else {
      alert("Missing Information! Please fill out all required boxes");
    }
  }

  getErrorMessage() {
    if (this.userEmail.hasError('required')) {
      return 'You must enter a value';
    }

    return this.userEmail.hasError('email') ? 'Not a valid email' : '';
  }


}
