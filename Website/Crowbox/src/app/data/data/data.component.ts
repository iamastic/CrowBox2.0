import { Component, OnInit, AfterContentInit } from '@angular/core';

import { Observable } from 'rxjs';

//import the auth service
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

//import the crowbox service to handle firebase api requests
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';

//import the carousel handling module
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { first } from 'rxjs/operators';

//to get the current date when user first makes an account
import { DatePipe } from '@angular/common';

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
  //date joined
  currentDate?:any;

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

  //crows on perch bar color options
  crowColor1 = "#FF7360";
  crowColor2 = "#F51D00";
  currentCrowColor:string = this.crowColor1;
  crowBarChartColors:string[] = [];

  //crows on perch barchart options  
  public crowOnPerchChartOptions = {
    responsive: true,
    scales: { 
      yAxes: [{
        display:true,
        ticks: {
          beginAtZero: true, 
          stepSize: 1,
        },
        maintainAspectRatio: false,
        scaleLabel: {
          display:true,
          labelString:'Amount'
        }

      }], 
      xAxes: [{
        scaleLabel: {
          display:true,
          labelString:'Date'
        }
      }]
    },

    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };

  public crowOnPerchChartColor = [
    {
      backgroundColor: this.crowBarChartColors
    }
  ]

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

  //coins deposited bar color options
  coinColor1 = "#453E51";
  coinColor2 = "#958CA6";
  currentCoinColor:string = this.coinColor1;
  coinBarChartColors:string[] = [];


  //coins deposited bar chart options
  public coinsDepositedChartOptions = {
    responsive: true,
    scales: { 
      xAxes: [{
        scaleLabel: {
          display:true,
          labelString:'Date'
        }
      }], 
    yAxes: [{
      display:true,
      ticks: {
        beginAtZero: true,
        stepSize: 1,
      },
      maintainAspectRatio: false,
      scaleLabel: {
        display:true,
        labelString:'Amount'
      }

    }] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };

  public coinChartColor = [
    {
      backgroundColor: this.coinBarChartColors
    }
  ]

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

  
  publicCrowColor1 = "#9CFFFA";
  publicCrowColor2 = "#00A39B";
  currentPublicCrowColor = this.publicCrowColor1;
  publicCrowChartColors:string[] = [];

  //public crows on perch barchart options
  public publicCrowOnPerchChartOptions = {
    responsive: true,
    scales: { 
      xAxes: [{
        scaleLabel: {
          display:true,
          labelString:'Location'
        }
      }], 
      yAxes: [{
        display:true,
        ticks: {
          beginAtZero: true, 
          stepSize: 1,
        },
        maintainAspectRatio: false,
        scaleLabel: {
          display:true,
          labelString:'Amount'
        }
      }] 
    },
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

  public publicCrowsOnPerchColor = [
    {
      backgroundColor: this.publicCrowChartColors
    }
  ]

  public publicCrowOnPerchChartData = [
    { data: this.publicCrowsOnPerchValues, label: "Number Of Crows That Landed On The Perch" }
  ];
  /* ---------------------------------------------------- */

  /* PUBLIC CROWS ON PERCH DATA */

  $initialPublicCoinsDepositedSub?:Observable<any>;
  $childPublicCoinsDepositedSub?:Observable<any>;
  publicCoinsDepositedLocation: string[] = [];
  publicCoinsDepositedValues: string[] = [];

  publicCoinColor1 = "#FBE889";
  publicCoinColor2 = "#F5CC14";
  currentPublicCoinColor = this.publicCoinColor1;
  publicCoinChartColor:string[] = [];


  //public crows on perch barchart options
  public publicCoinsDepositedChartOptions = {
    responsive: true,
    scales: { 
      xAxes: [{
        scaleLabel: {
          display:true,
          labelString:'Location'
        }
      }], 
    yAxes: [{
      display:true,
      ticks: {
        beginAtZero: true, 
        stepSize: 1,
      },
      maintainAspectRatio: false,
      scaleLabel: {
        display:true,
        labelString:'Amount'
      }    }] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };

  public publicCoinsColor = [
    {
      backgroundColor:this.publicCoinChartColor
    }
  ]

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
  constructor(private handleAuth: HandleAuthService, private crowboxService: CrowboxdbService, public datepipe:DatePipe) {

  }

  ngOnInit(): void {
    //upon the view rendering, get the User Id - don't need to do this anymore
    //this.currentUserId = this.authService.currentUserState?.uid;

    //Subscribe to the user auth state observable and wait 
    //to get the UID to proceed
    this.handleAuth.currentUser$
    .pipe(first())
    .subscribe(user => {
      this.currentUserId = user.uid;
      this.handleAuth.isLoggedIn;

      console.log("Current User Id is " );
      console.log(this.currentUserId);
  
      this.checkIfUserExists();
      this.initialiseCharts();
    });
  }

  ngAfterContentInit() {
    //set the charts to be YOUR DATA instead of PUBLIC DATA
    this.showPersonal();
  }

  initialiseCharts() {
    this.getCrowOnPerchDataChildren()
    this.getCoinDepositedDataChildren();
    this.getPublicCrowOnPerchData();
    this.getPublicCoinsDepositedData();

    //if the array is empty, let the user know that they need to setup a crowbox
    if((this.coinsDepositedDate.length == 0) && (this.crowsOnPerchDate.length == 0)) {
      console.log("COINS and CROWS array are currently empty");
      this.showUserId = true;
    } else {
      console.log("COINS and CROWS array have now been filled");
    }

  }

  /* Check if the user already has a profile in the 
  firebase database. If they do not, then create one
  and update the data: Name, Location, Total Data
  and Preferences */
  checkIfUserExists(): void {
    console.log("checkIfUserExists() called");
    this.userData$ = this.crowboxService.getUser().snapshotChanges();

    this.userData$
    .pipe(first())
    .subscribe(action => {
      if(action.key){
        console.log("User is in the database");
        console.log(action.key);
      } else { 
        console.log("In data component, no such user found");
        console.log("Creating user");
        //create the user and initialise their respective data slots here
        //get the current date
        this.currentDate = this.datepipe.transform((new Date), 'yyyy/dd/MM');
        this.currentTrainingStage = 1;
        this.crowboxService.updateTrainingStage(this.currentTrainingStage);
        this.crowboxService.updateNotifcationSettings("null");
        this.crowboxService.updateSharingPreferences("null");
        this.crowboxService.updateTotalCoinsDeposited(0);
        this.crowboxService.updateTotalCrowsLandedOnPerch(0);
        this.crowboxService.setUserEmail();
        this.crowboxService.updateCrowboxNickname("null");
        this.crowboxService.updateUserLocation("null");
        this.crowboxService.updateDateJoined(this.currentDate);        
        this.crowboxService.updateUserName("null");
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
        //this.crownsOnPerchValues.push(action.payload.val().value);
        this.crownsOnPerchValues = [
          ...this.crownsOnPerchValues, action.payload.val().value
        ];
        this.switchCrowChartColor();
        this.crowBarChartColors.push(this.currentCrowColor);
      } else {
        //if it does exist, then we don't need to add the new date
        //simply replace the existing data value with the new data value
        //for the same date 
        this.crownsOnPerchValues[indexOfKey] = action.payload.val().value;
        this.crownsOnPerchValues = [...this.crownsOnPerchValues];
      }

      //reset the bar charts data as well as labels
      this.crowOnPerchChartLabels = this.crowsOnPerchDate;
      this.crowOnPerchChartData = [
        { data: this.crownsOnPerchValues, label: "Number Of Crows That Landed On The Perch" }
      ];
    });
  }

  switchCrowChartColor() {
    if (this.currentCrowColor === this.crowColor1) {
      this.currentCrowColor = this.crowColor2;
    } else {
      this.currentCrowColor = this.crowColor1;
    }
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
        //this.coinsDepositedValues.push(action.payload.val().value);
        this.coinsDepositedValues = [
          ...this.coinsDepositedValues, action.payload.val().value
        ];

        this.switchCoinChartColor();
        this.coinBarChartColors.push(this.currentCoinColor);

      } else {
        //if it does exist, then we don't need to add the new date
        //simply replace the existing data value with the new data value
        //for the same date 
        this.coinsDepositedValues[indexOfKey] = action.payload.val().value;

        this.coinsDepositedValues = [...this.coinsDepositedValues];
      }

      //reset the bar charts data as well as labels
      this.coinsDepositedChartLabels = this.coinsDepositedDate;
      this.coinsDepositedChartData = [
        { data: this.coinsDepositedValues, label: "Number of Coins Deposited" }
      ];
    });
  }

  
  switchCoinChartColor() {
    if (this.currentCoinColor === this.coinColor1) {
      this.currentCoinColor = this.coinColor2;
    } else {
      this.currentCoinColor = this.coinColor1;
    }
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

        this.switchPublicCrowChartColor();
        this.publicCrowChartColors.push(this.currentPublicCrowColor);
      } else {
        this.publicCrowsOnPerchValues[indexOfKey] = action.payload.val().crows_landed_on_perch;
      }
    });

    this.publicCrowOnPerchChartLabels = this.publicCrowsOnPerchLocation;
    this.publicCrowOnPerchChartData = [
      { data: this.publicCrowsOnPerchValues, label: "Number Of Crows That Landed On The Perch" }
    ];
  }
  
  switchPublicCrowChartColor() {
    if (this.currentPublicCrowColor === this.publicCrowColor1) {
      this.currentPublicCrowColor = this.publicCrowColor2;
    } else {
      this.currentPublicCrowColor = this.publicCrowColor1;
    }
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
        this.switchPublicCoinsColors();
        this.publicCoinChartColor.push(this.currentPublicCoinColor);
      } else {
        this.publicCoinsDepositedValues[indexOfKey] = action.payload.val().coins_deposited;
      }
    });

    this.publicCoinsDepositedChartLabels = this.publicCoinsDepositedLocation;

    this.publicCoinsDepositedChartData = [
      { data: this.publicCoinsDepositedValues, label: "Number Of Coins Deposited" }
    ];
  }

  switchPublicCoinsColors() {
    if (this.currentPublicCoinColor === this.publicCoinColor1) {
      this.currentPublicCoinColor = this.publicCoinColor2;
    } else {
      this.currentPublicCoinColor = this.publicCoinColor1;
    }
  }
  /* ---------------------------------------------------- */

  showPersonal() {
    this.showPublicData = false;
  }
  showPublic() {
    this.showPublicData = true;
  }
}
