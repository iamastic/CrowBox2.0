import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

@Component({
  selector: 'app-profilebox',
  templateUrl: './profilebox.component.html',
  styleUrls: ['./profilebox.component.css']
})
export class ProfileboxComponent implements OnInit, OnDestroy {

  //object to hold the user's profile data
  profileData = {
    name:"null",
    location:"null",
    email:"null",
    notification:"null",
    sharing:"null",
    numCrowBoxes:0,
    totalCoins:0,
    totalCrowsLanded:0
  };

  /* HANDLE SUBSCRIPTIONS */
  $handleUserAuthSub?:Subscription;
  $getUserInfoSub?:Subscription;

  constructor(private crowboxService:CrowboxdbService, private handleAuth: HandleAuthService) { }

  ngOnDestroy(): void {
    this.$handleUserAuthSub?.unsubscribe();
    this.$getUserInfoSub?.unsubscribe();
      
  }

  ngOnInit(): void {
    //Subscribe to the user auth state observable and wait 
    //to get the UID to proceed
    this.$handleUserAuthSub = this.handleAuth.currentUser$
    .subscribe(user => {
      this.getUserInformation();
    });
  }

  /* fill the profile data object with data from 
  firebase */
  getUserInformation() {
    this.$getUserInfoSub = this.crowboxService.getUser()
    .snapshotChanges()
    .subscribe(result => {
      this.profileData = {
        name: result.payload.val().name,
        location: result.payload.val().location,
        email: result.payload.val().email,
        notification: result.payload.val().notification_settings,
        sharing: result.payload.val().sharing_preference,
        numCrowBoxes: 0,
        totalCoins: result.payload.val().total_coins_deposited,
        totalCrowsLanded: result.payload.val().total_crows_landed_on_perch
      }
    });
  }

}
