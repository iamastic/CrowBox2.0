import { Component, OnInit, AfterContentInit, OnDestroy, EventEmitter, Output } from '@angular/core';

import { interval, Observable, Subscription } from 'rxjs';

//import the auth service
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

//import the crowbox service to handle firebase api requests
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';

//import the carousel handling module
import { first } from 'rxjs/operators';

//to get the current date when user first makes an account
import { DatePipe } from '@angular/common';

/* FOR OFFLINE PURPOSES */
interface dataObject {
  date:string;
  value:number;
}

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit, AfterContentInit, OnDestroy {

  /* SENDING DATA TO PRIVATE.COMPONENT.TS */
  @Output() crowsOnPerchOutput = new EventEmitter<any>();
  @Output() coinsDepositedOutput = new EventEmitter<any>();

  sendCrowsOnPerchToParent() {
    this.crowsOnPerchOutput.emit(this.crownsOnPerchValues);
  }

  sendCoinsDepositedToParent() {
    this.coinsDepositedOutput.emit(this.coinsDepositedValues);
  }

  /* OFFLINE RELATED */
  file:any;
  fileName:any;
  uploaded:boolean = false; 

  //For crows
  offlineCrowData:dataObject[] = [];
  offlineCurrentCrowDate:any = "null";

  //For coins
  offlineCoinData:dataObject[] = [];
  offlineCurrentCoinDate:any = "null";

  /* ---------------------------------------------------- */

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
  childCrowOnPerchSub$?:Observable<any>;
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
        },
        gridLines: {
          display:false
        }

      }], 
      xAxes: [{
        scaleLabel: {
          display:true,
          labelString:'Date'
        },
        gridLines: {
          display:false
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
  childCoinsDepositedSub$?: Observable<any>;
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
        },
        gridLines: {
          display:false
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
      },
      gridLines: {
        display:false
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

  /* CROWS ON PERCH OR COINS DEPOSITED DATA */
  showCoinsDeposited?:boolean;

  /* ---------------------------------------------------- */

  /* HANDLING WIFI TROUBLESHOOT */
  wifiCheckTimer$ = interval(10000);
  $wifiSub?:Subscription;

  /* OTHER SUBSCRIPTIONS - To handle unsubscribing */
  $handleUserAuth?:Subscription;
  $userDataSub?:Subscription;
  $childCrowOnPerch?:Subscription;
  $childCoinsDeposited?:Subscription;

  /* CHART TYPES FOR CROW ON PERCH */
  switchCrowToLineChart() {
    this.crowOnPerchChartType = "line";
  }

  switchCrowToBarChart() {
    this.crowOnPerchChartType = "bar";
  }

  switchCrowToHorizontalBarChart() {
    this.crowOnPerchChartType = "horizontalBar";
  }

  /* CHART TYPES FOR COINS DEPOSITED */
  switchCoinToLineChart() {
    this.coinsDepositedChartType = "line";
  }
 
  switchCoinToBarChart() {
    this.coinsDepositedChartType = "bar";
  }

  
  switchCoinToHorizontalBarChart() {
    this.coinsDepositedChartType = "horizontalBar";
  }


  constructor(private handleAuth: HandleAuthService, private crowboxService: CrowboxdbService, public datepipe:DatePipe) {}

  ngOnDestroy() {

    this.$wifiSub?.unsubscribe();
    this.$handleUserAuth?.unsubscribe();
    this.$userDataSub?.unsubscribe();
    this.$childCrowOnPerch?.unsubscribe();
    this.$childCoinsDeposited?.unsubscribe();
  }

  checkIfWifiConnection() {
    //In here, I want to check the two times that have been set
    //in the Status object in firebase 

    //First, get both the times - Only take the first and then 
    //unsubscribe. This will anyway be resubscribed in the next 
    //interval
    this.crowboxService
    .getStatusData()
    .snapshotChanges()
    .pipe(first())
    .subscribe(result => {
      console.log("Checking WiFi Connection");
      let previoustTime = result.payload.val().prevWifiTime;
      let currentTime = result.payload.val().currentWifiTime;
      let oldStatus = result.payload.val().wifi;
      
      //Then, we compare the two times 
      if (previoustTime === currentTime) {
        //If they are equal, that means the WiFi is not connected 
        //Set the error message
        // console.log("Times are Equal");
        if (oldStatus === "WORKING") {
          this.crowboxService.updateWifiStatus("DISCONNECTED");
        }

      } else {
          //If they are not equal, that means the WiFi is connected
          //Set it to Working and update value of prevWiFiTime
          // console.log("Times are NOT equal");
          if(oldStatus !== "WORKING") {
            this.crowboxService.updateWifiStatus("WORKING");
            this.crowboxService.updatePreviousWifiTime(currentTime);
          } else {
              this.crowboxService.updatePreviousWifiTime(currentTime);
          }
      }

    });
  }

  ngOnInit(): void {

    this.$wifiSub = this.wifiCheckTimer$.subscribe(r => {
      console.log(r);
      this.checkIfWifiConnection();
      
    })

    //upon the view rendering, get the User Id - don't need to do this anymore
    //this.currentUserId = this.authService.currentUserState?.uid;

    //Subscribe to the user auth state observable and wait 
    //to get the UID to proceed
    this.$handleUserAuth = this.handleAuth.currentUser$
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

    this.$userDataSub = this.userData$
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
            if(this.currentTrainingStage) {
              this.crowboxService.updateTrainingStage(this.currentTrainingStage);
            }
            this.crowboxService.updateNotifcationSettings("ON");
            this.crowboxService.updateSharingPreferences("PUBLIC");
            this.crowboxService.updateTotalCoinsDeposited(0);
            this.crowboxService.updateTotalCrowsLandedOnPerch(0);
            this.crowboxService.setUserEmail();
            this.crowboxService.updateCrowboxNickname("null");
            this.crowboxService.updateUserLocation(this.handleAuth.userLocation);
            if(this.currentDate) {
              this.crowboxService.updateDateJoined(this.currentDate);        
            }
            this.crowboxService.updateUserName(this.handleAuth.userName);

            this.crowboxService.updateProfilePictureURL("https://via.placeholder.com/100");
          }
        });
  }

  /* ---------------------------------------------------- */

  /* PERSONAL DATA */
  getCrowOnPerchDataChildren() {
    //get a snapshot of the child added
    this.childCrowOnPerchSub$ = this.crowboxService
    .getCrowOnPerchData()
    .stateChanges();

    this.$childCrowOnPerch = this.childCrowOnPerchSub$
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

          //Emit this data to the parent
          this.sendCrowsOnPerchToParent();
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
    this.childCoinsDepositedSub$ = this.crowboxService
    .getCoinDepositedData()
    .stateChanges();

    this.$childCoinsDeposited = this.childCoinsDepositedSub$
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

      //Emit this data to the parent
      this.sendCoinsDepositedToParent();
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

  showPersonal() {
    this.showCoinsDeposited = false;
  }
  showPublic() {
    this.showCoinsDeposited = true;
  }

  /* OFFLINE MODE */

  /* Upload file Code adapted from: https://blog.angular-university.io/angular-file-upload/ */
  //Get the file
  uploadFile(event:any) {
    this.file = event.target.files[0];    
    this.fileName = this.file.name;
  }

  readFile() {
    let fileReader = new FileReader();
    fileReader.readAsText(this.file);

    fileReader.onload = (e) => {
      console.log(fileReader.result);
      //For each line in the file...
      let tempData = (<string>fileReader.result).split('\n');
      tempData.forEach(line => {
        //Seperate each line by the comma delimiter to get
        //individual values
        let tempLine = line.split(',');

        if(tempLine[0]=== "crows_landed_on_perch") {
          this.offlineCrowsOnPerch(tempLine);
        }

        if (tempLine[0]==="coins_deposited") {
          this.offlineCoinsDeposited(tempLine);
        }
      });

      console.log("OFFLINE DATA");
      console.log(this.offlineCrowData);
      //Once the array is filled up, we update these 
      //values into Firebase!
      this.offlineCrowData.forEach(data => {
        this.crowboxService.updateOfflineCrowsOnPerch(data.date,data.value);
      });

      this.offlineCoinData.forEach(data => {
        this.crowboxService.updateOfflineCoinsDeposited(data.date,data.value);
      })

      this.uploaded = true;
    };
  }

  offlineCrowsOnPerch(tempLine:any) {
    //check the date, have we moved on to another day?
    //if so, then add on a new object 
    if(tempLine[1] !== this.offlineCurrentCrowDate) {
      console.log("New Date Found");
      console.log(tempLine[1]);
      this.offlineCurrentCrowDate = tempLine[1];
      //In here, we will be pushing this object onto 
      //the existing array as it is a brand new date
      let tempDataObject:dataObject = {
        date : this.offlineCurrentCrowDate,
        value : parseInt(tempLine[2])
      }
      this.offlineCrowData.push(tempDataObject);

    } else {
        console.log("Date currently is: " + this.offlineCurrentCrowDate);
        console.log("Length of array is: " + this.offlineCrowData.length);
        //If it is the same date, then we need to update
        //rather than push the object
        //We convert the value into an Integer/number
        let tempValue = parseInt(tempLine[2]);
        //Then replace the existing value with the new one 
        //at the same date
        this.offlineCrowData[this.offlineCrowData.length-1].value = tempValue;
      }
  }

  offlineCoinsDeposited(tempLine:any) {
    //check the date, have we moved on to another day?
    //if so, then add on a new object 
    if(tempLine[1] !== this.offlineCurrentCoinDate) {
      console.log("New Date Found");
      console.log(tempLine[1]);
      this.offlineCurrentCoinDate = tempLine[1];
      //In here, we will be pushing this object onto 
      //the existing array as it is a brand new date
      let tempDataObject:dataObject = {
        date : this.offlineCurrentCoinDate,
        value : parseInt(tempLine[2])
      }
      this.offlineCoinData.push(tempDataObject);

    } else {
        console.log("Date currently is: " + this.offlineCurrentCoinDate);
        console.log("Length of array is: " + this.offlineCoinData.length);
        //If it is the same date, then we need to update
        //rather than push the object
        //We convert the value into an Integer/number
        let tempValue = parseInt(tempLine[2]);
        //Then replace the existing value with the new one 
        //at the same date
        this.offlineCoinData[this.offlineCoinData.length-1].value = tempValue;
      }
  }
}
