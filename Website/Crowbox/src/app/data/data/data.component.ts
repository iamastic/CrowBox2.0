import { Component, OnInit, AfterContentInit } from '@angular/core';

import { Observable } from 'rxjs';

//import the auth service
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

//import the crowbox service to handle firebase api requests
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';

//import the carousel handling module
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit, AfterContentInit {

  /* USER RELATED */
  //the user id taken from HandleAuthService
  currentUserId: any;
  //Observable to handle the user related subscriptions
  userData$?:Observable<any>;
  //show the User Id
  showUserId?:boolean;

  /* ---------------------------------------------------- */
  /* TRAINING STAGE RELATED */
  currentTrainingStage?: number;

  /* ---------------------------------------------------- */

  /* PERSONAL CROW ON PERCH RELATED */
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
    scales: { xAxes: [{

    }], yAxes: [{
      display:true,
      ticks: {
        beginAtZero: true, 
        stepSize: 1,
      },
      maintainAspectRatio: false,
      labelString:'Date'
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

  /* PERSONAL COINS DEPOSITED RELATED */
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
        beginAtZero: true,
        stepSize: 1,
      },
      maintainAspectRatio: false

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

  /* PUBLIC CROWS ON PERCH DATA */
  //observable to initialise data set
  $initialPublicCrowOnPerchSub?:Observable<any>;
  //observable to get the new child 
  $childPublicCrowOnPerchSub?:Observable<any>;
  //y axis data
  publicCrowsOnPerchLocation:string[] = [];
  //x axis data
  publicCrowsOnPerchValues: number[] = [];

  //public crows on perch barchart options
  public publicCrowOnPerchChartOptions = {
    responsive: true,
    scales: { xAxes: [{

    }], yAxes: [{
      display:true,
      ticks: {
        beginAtZero: true, 
        stepSize: 1,
      },
      maintainAspectRatio: false,
      labelString:'Location'
    }] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };

  public publicCrowOnPerchChartLabels = this.publicCrowsOnPerchLocation;
  public publicCrowOnPerchChartType = 'bar';
  public publicCrowOnPerchChartLegend = true;

  public publicCrowOnPerchChartData = [
    { data: this.publicCrowsOnPerchValues, label: "Number Of Crows That Landed On The Perch" }
  ];
  /* ---------------------------------------------------- */

  /* PUBLIC CROWS ON PERCH DATA */

  $initialPublicCoinsDepositedSub?:Observable<any>;
  $childPublicCoinsDepositedSub?:Observable<any>;
  publicCoinsDepositedLocation: string[] = [];
  publicCoinsDepositedValues: string[] = [];

  //public crows on perch barchart options
  public publicCoinsDepositedChartOptions = {
    responsive: true,
    scales: { xAxes: [{

    }], yAxes: [{
      display:true,
      ticks: {
        beginAtZero: true, 
        stepSize: 1,
      },
      maintainAspectRatio: false,
      labelString:'Location'
    }] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };

  public publicCoinsDepositedChartLabels = this.publicCoinsDepositedLocation;
  public publicCoinsDepositedChartType = 'bar';
  public publicCoinsDepositedChartLegend = true;

  public publicCoinsDepositedChartData = [
    { data: this.publicCoinsDepositedValues, label: "Number Of Coins Deposited" }
  ];

  /* ---------------------------------------------------- */

  /* PERSONAL OR PUBLIC DATA */
  showPublicData?:boolean;

  /* ---------------------------------------------------- */
  constructor(private authService: HandleAuthService, private crowboxService: CrowboxdbService, config: NgbCarouselConfig) {
    config.showNavigationIndicators = true;
    config.showNavigationArrows = true;
   }

  ngOnInit(): void {
    //upon the view rendering, get the User Id 
    this.currentUserId = this.crowboxService.currentUserId;
    console.log("Current User Id is " + this.currentUserId);

    this.checkIfUserExists();
  }

  ngAfterContentInit() {
    this.getCrowOnPerchDataChildren()
    this.getCoinDepositedDataChildren();
    this.getPublicCrowOnPerchData();
    this.getPublicCoinsDepositedData();

    //if the array is empty, let the user know that they need to setup a crowbox
    if((this.coinsDepositedDate.length == 0) && (this.crowsOnPerchDate.length == 0)) {
      console.log("Empty coins and crows array");
      this.showUserId = true;
    } 

    //set the charts to be YOUR DATA instead of PUBLIC DATA
    this.showPublicData = false;
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
        //console.log(action.payload.val().Location);
      } else {
        //create the user and initialise their respective data slots here
        console.log("In data component, no such user found");
        console.log("Creating user");
        this.currentTrainingStage = 1;
        this.crowboxService.updateTrainingStage(this.currentTrainingStage);
        this.crowboxService.updateNotifcationSettings("null");
        this.crowboxService.updateSharingPreferences("null");
        this.crowboxService.updateTotalCoinsDeposited(0);
        this.crowboxService.updateTotalCrowsLandedOnPerch(0);
        this.crowboxService.updateUserName("null");
        this.crowboxService.updateCrowboxNickname("null");
      }
    });
  }

  /* ---------------------------------------------------- */

  /* PERSONAL DATA */
  getCrowOnPerchDataChildren() {
    //get a snapshot of the child added
    this.$childCrowOnPerchSub = this.crowboxService
    .getCrowOnPerchData()
    .stateChanges();

    this.$childCrowOnPerchSub
    .subscribe(action => {
      //set the showUserId to false as the user has already set up the crowbox
      this.showUserId = false;
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
      //set the showUserId to false as the user has already set up the crowbox
      this.showUserId = false;
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
  /* ---------------------------------------------------- */

  /* PUBLIC DATA */
  getPublicCrowOnPerchData() {
    this.$childPublicCrowOnPerchSub = this.crowboxService
    .getAllLocationData()
    .stateChanges();

    this.$childPublicCrowOnPerchSub
    .subscribe(action => {
      let indexOfKey = this.publicCrowsOnPerchLocation.indexOf(action.key);

      if(indexOfKey == -1) {
        this.publicCrowsOnPerchLocation.push(action.key);
        this.publicCrowsOnPerchValues.push(action.payload.val().crows_landed_on_perch);
      } else {
        this.publicCrowsOnPerchValues[indexOfKey] = action.payload.val().crows_landed_on_perch;
      }
    });

    this.publicCrowOnPerchChartLabels = this.publicCrowsOnPerchLocation;
    this.publicCrowOnPerchChartData = [
      { data: this.publicCrowsOnPerchValues, label: "Number Of Crows That Landed On The Perch" }
    ];
  }

  getPublicCoinsDepositedData() {
    this.$childPublicCoinsDepositedSub = this.crowboxService
    .getAllLocationData()
    .stateChanges();

    this.$childPublicCoinsDepositedSub
    .subscribe(action => {
      let indexOfKey = this.publicCoinsDepositedLocation.indexOf(action.key);

      if (indexOfKey == -1) {
        this.publicCoinsDepositedLocation.push(action.key);
        this.publicCoinsDepositedValues.push(action.payload.val().coins_deposited);
      } else {
        this.publicCoinsDepositedValues[indexOfKey] = action.payload.val().coins_deposited;
      }
    });

    this.publicCoinsDepositedChartLabels = this.publicCoinsDepositedLocation;

    this.publicCoinsDepositedChartData = [
      { data: this.publicCoinsDepositedValues, label: "Number Of Coins Deposited" }
    ];
  }
  /* ---------------------------------------------------- */

  showPersonal() {
    this.showPublicData = false;
  }
  showPublic() {
    this.showPublicData = true;
  }
}
