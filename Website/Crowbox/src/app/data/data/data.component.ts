import { Component, OnInit } from '@angular/core';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

//import the auth service
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

//import the crowbox service to handle firebase api requests
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';


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

  /* Crow On Perch Charts Related */
  $crowsOnPerch?: Observable<any>;
  //y axis data
  crowsOnPerchDate?: string[] = ["null"];
  //x axis data
  crownsOnPerchValues?: number[] = [0];
  //most recent date for crows landing on perch
  currentCrowsOnPerchDate?:string = "null";
  //crows on perch barchart options
  public crowOnPerchChartOptions = {
    responsive: true,
    scales: { xAxes: [{}], yAxes: [{
      display:true,
      ticks: {
        beginAtZero: true
      }
    }] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };

  public crowOnPerchChartLabels = ['Number Of Crows That Landed on The Perch'];
  public crowOnPerchChartType = 'bar';
  public crowOnPerchChartLegend = true;

  public crowOnPerchChartData = [
    { data: this.crownsOnPerchValues, label: this.crowsOnPerchDate },
  ];

  constructor(private authService: HandleAuthService, private crowboxService: CrowboxdbService) { }

  ngOnInit(): void {
    //upon the view rendering, get the User Id 
    this.currentUserId = this.authService.currentUserId;

    this.checkIfUserExists();

    this.initialiseCrowOnPerchChartData();
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
        //create the user and their respective data slots here
        console.log("In data component, no such user found");
        this.crowboxService.updateUserLocation("Portugal");
      }
    });
  }

  initialiseCrowOnPerchChartData() {
    //create the observable as a snapshot of the 
    //data 
    this.$crowsOnPerch = this.crowboxService
    .getCrowOnPerchData()
    .snapshotChanges()
    .pipe( map (changes =>
      changes.map(c => 
        ({key: c.payload.key, ...c.payload.val()})
        )
      )
    );

    //subscribe to this observable to extract the data
    //set the data in the arrays
    this.$crowsOnPerch.subscribe(data => {
      /* for(var i = 0; i<data.length(); i++) {
        console.log(data[i].key);
      } */
      console.log(data);
    });
  }



}
