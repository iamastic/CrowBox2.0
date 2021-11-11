import { Component, OnInit } from '@angular/core';
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';

@Component({
  selector: 'app-profilebox',
  templateUrl: './profilebox.component.html',
  styleUrls: ['./profilebox.component.css']
})
export class ProfileboxComponent implements OnInit {

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

  constructor(private crowboxService:CrowboxdbService) { }

  ngOnInit(): void {
    this.getUserInformation();
  }

  /* fill the profile data object with data from 
  firebase */
  getUserInformation() {
    this.crowboxService.getUser()
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
