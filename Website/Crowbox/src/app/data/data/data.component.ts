import { Component, OnInit, AfterViewInit } from '@angular/core';

import { first, map } from 'rxjs/operators';
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
export class DataComponent implements OnInit, AfterViewInit {

  /* USER RELATED */
  //the user id taken from HandleAuthService
  currentUserId: any;
  //Observable to handle the user related subscriptions
  userData$?:Observable<any>;

  /* ---------------------------------------------------- */

  /* CROW ON PERCH RELATED */
  //observable to initialise the data set
  $initialCrowOnPerchSub?: Observable<any>;
  //observable to get the new child of the data set
  $childCrowOnPerchSub?:Observable<any>;
  //y axis data
  crowsOnPerchDate: string[] = [];
  //x axis data
  crownsOnPerchValues: number[] = [];
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

  public crowOnPerchChartLabels = this.crowsOnPerchDate;
  public crowOnPerchChartType = 'bar';
  public crowOnPerchChartLegend = true;

  public crowOnPerchChartData = [
    { data: this.crownsOnPerchValues, label: "Number Of Crows That Landed On The Perch" }
  ];

  /* ---------------------------------------------------- */

  /* COINS DEPOSITED RELATED */
  //observable to initialise and get child values of data set
  $childCoinsDepositedSub?: Observable<any>;
  //y axis data
  coinsDepositedDate: string[] = [];
  //x axis data
  coinsDepositedValues: number[] = [];
  //most recent date for coin deposited
  currentCoinDepositedDate?: string = "null";
  //coins deposited bar chart options
  public coinsDepositedChartOptions = {
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

  public coinsDepositedChartLabels = this.coinsDepositedDate;
  public coinsDepositedChartType = 'bar';
  public coinsDepositedChartLegend = true;

  public coinsDepositedChartData = [
    { data: this.coinsDepositedValues, label: "Number of Coins Deposited" }
  ];

  /* ---------------------------------------------------- */

  constructor(private authService: HandleAuthService, private crowboxService: CrowboxdbService) { }

  ngOnInit(): void {
    //upon the view rendering, get the User Id 
    this.currentUserId = this.authService.currentUserId;

    this.checkIfUserExists();
  }

  ngAfterViewInit() {
    //this.initialiseCrowOnPerchChartData();
    this.getCrowOnPerchDataChildren()
    this.getCoinDepositedDataChildren();
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

  getCrowOnPerchDataChildren() {
    //get a snapshot of the child added
    this.$childCrowOnPerchSub = this.crowboxService
    .getCrowOnPerchData()
    .stateChanges();

    this.$childCrowOnPerchSub
    .subscribe(action => {
      //get the index of the key from the date array
      let indexOfKey = this.crowsOnPerchDate.indexOf(action.key);
      //if the index is -1, then the date does not currently exist
      //this means that it is a new date, so we push it onto the array
      //since it is a new date, we also push on the value onto the value
      //array
      if (indexOfKey == -1) {
        this.crowsOnPerchDate.push(action.key);
        this.crownsOnPerchValues.push(action.payload.val().value);
      } else {
        //if it does exist, then we don't need to add the new date
        //simply replace the existing data value with the new data value
        //for the same date 
        this.crownsOnPerchValues[indexOfKey] = action.payload.val().value;
      }

      //reset the bar charts data as well as labels
      this.crowOnPerchChartLabels = this.crowsOnPerchDate;
      this.crowOnPerchChartData = [
        { data: this.crownsOnPerchValues, label: "Number Of Crows That Landed On The Perch" }
      ];
    });
  }

  getCoinDepositedDataChildren() {
    //get snapshot of child added 
    this.$childCoinsDepositedSub = this.crowboxService
    .getCoinDepositedData()
    .stateChanges();

    this.$childCoinsDepositedSub
    .subscribe(action => {
      //get index of the key from the date array
      let indexOfKey = this.coinsDepositedDate.indexOf(action.key);
      //if the index is -1, then the date does not currently exist
      //this means that it is a new date, so we push it onto the array
      //since it is a new date, we also push on the value onto the value
      //array
      if (indexOfKey == -1) {
        this.coinsDepositedDate.push(action.key);
        this.coinsDepositedValues.push(action.payload.val().value);
      } else {
        //if it does exist, then we don't need to add the new date
        //simply replace the existing data value with the new data value
        //for the same date 
        this.coinsDepositedValues[indexOfKey] = action.payload.val().value;
      }

      //reset the bar charts data as well as labels
      this.coinsDepositedChartLabels = this.coinsDepositedDate;
      this.coinsDepositedChartData = [
        { data: this.coinsDepositedValues, label: "Number of Coins Deposited" }
      ];
    });
  }


  //don't think I need this function anymore!
  initialiseCrowOnPerchChartData() {
    //create the observable as a snapshot of the 
    //data 
    this.$initialCrowOnPerchSub = this.crowboxService
    .getCrowOnPerchData()
    .snapshotChanges()
    .pipe( map (changes =>
      changes.map(c => 
        ({key: c.payload.key, ...c.payload.val()})
        )
      )
    );

    //Subscribe to this observable to extract the data.
    //Set the data in the arrays, do this only once.
    //End the subscription afterwards (hence the use of 
    //first()).
    this.$initialCrowOnPerchSub
    .pipe(first())
    .subscribe(data => {
      //first, we store the last key/date 
      this.currentCrowsOnPerchDate = data[data.length - 1].key;

      //next, we store each value into the respective array
      for(var i = 0; i<data.length; i++) {
        //store keys in the date array
        this.crowsOnPerchDate.push(data[i].key);
        //store data in the values array
        this.crownsOnPerchValues.push(data[i].value);
      } 
    });
  }

}
