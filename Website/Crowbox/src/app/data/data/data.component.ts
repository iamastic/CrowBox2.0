import { Component, OnInit } from '@angular/core';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

//import the auth service
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

//import the crowbox service to handle firebase api requests
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';
import { Action } from 'rxjs/internal/scheduler/Action';


@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit {

  /* User related */
  //the user id taken from HandleAuthService
  currentUserId: any;
  //Observable to handle the user related subscriptions
  userData$?:Observable<any>;

  constructor(private authService: HandleAuthService, private crowboxService: CrowboxdbService) { }

  ngOnInit(): void {
    //upon the view rendering, get the User Id 
    this.currentUserId = this.authService.currentUserId;

    this.checkIfUserExists();
  }

  /* Check if the user already has a profile in the 
  firebase database. If they do not, then create one
  and update the data: Name, Location, Total Data
  and Preferences */
  checkIfUserExists(): void {

    this.userData$ = this.crowboxService.getUser().snapshotChanges();

    this.userData$.subscribe(action => {
      
      if(action.key){
        console.log("User is in the database");
        console.log(action.key);
        console.log(action.payload.val().Location);
      } else {
        console.log("In data component, no such user found");
        this.crowboxService.updateUserLocation("Portugal");

      }
    })




   /*  this.userData$ = this.crowboxService.getUser().snapshotChanges().pipe(
      map(changes => 
        changes.map(c =>
          ({key:c.payload.key, ...c.payload.val()})
        )
      )
    ); */

    //subscribe to get the data
   /*  this.userData$.subscribe(data => {
      if(data.key === undefined) {
        console.log("In data component, no such user found");
      } else {
        console.log("User is in the database");
      }
    }); */
  }

}
