import { Component, OnInit, OnDestroy } from '@angular/core';
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

import {FormControl, Validators} from '@angular/forms';
import { PublicService } from 'src/app/services/public/public.service';
import { first, map } from 'rxjs/operators';
import { Observable, Subscriber, Subscription } from 'rxjs';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

  userEmail = new FormControl('', [Validators.required, Validators.email]);

  userName = new FormControl('', [Validators.required]);

  userLocation = new FormControl('', [Validators.required]);

  userPassword = new FormControl('', [Validators.required]);

  countries$?:Observable<any>;
  listOfCountries: any[] = [];
  selectedCountry?:any;

  hide = true;

  /* OTHER SUBSCRIPTIONS */
  $countriesList?:Subscription;

  constructor(private handleAuth:HandleAuthService, private publicService:PublicService) { }

  ngOnDestroy(): void {
      this.$countriesList?.unsubscribe();
  }

  ngOnInit(): void {
    this.getCountriesList();
  }

  getCountriesList() {
    this.countries$ = this.publicService.getAllCountryData()
    .snapshotChanges()
    .pipe(
      map(value => 
        value.map(v => (
          {key: v.payload.key, ...v.payload.val()}
        )))
    );

    this.$countriesList = this.countries$
    .pipe(first())
    .subscribe(result => {
      this.listOfCountries = result;
    })
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
