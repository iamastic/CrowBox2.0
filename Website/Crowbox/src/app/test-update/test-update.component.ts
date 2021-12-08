import { Component, OnInit } from '@angular/core';

import { CrowboxdbService } from '../services/crowboxdb.service';
import CrowboxData  from 'src/app/models/crowbox-data';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

//chart imports
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';


//shared service
import { SharedService } from '../services/shared.service';


@Component({
  selector: 'app-test-update',
  templateUrl: './test-update.component.html',
  styleUrls: ['./test-update.component.css']
})
export class TestUpdateComponent implements OnInit {

  userId?:string;

  chartCoinDeposited = 0;
  chartCrowsOnPerch = 0;
  coinsData = [0];
  perchData = [0];

  /* chart stuff */
  public barChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
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
  public barChartLabels = ['Current'];
  public barChartType = 'bar';
  public barChartLegend = true;

  public barChartData = [
    { data: this.coinsData, label: 'Coins Deposited' },
    { data: this.perchData, label: 'Crows Landed On Perch'}
  ];


  trainingStage?:number = 0;
  key!:string;

  dataSample?:CrowboxData[];

  updateTrainingStage?:Observable<any>;

  displayCoins?:Observable<any>;

  displayCrows?:Observable<any>;


  coinsDeposited!:any;


  constructor(private cbservice: CrowboxdbService, private sharesService: SharedService) {
  }

  ngOnInit(): void {
    console.log("Entered ngonit");

    this.getUserId();
    this.updateCoinsDeposited();
    this.updateNumCrowsOnPerch();
  }

  /* getUserId(){
    this.sharesService.useridMessage$.subscribe(x => {
      this.userId = x;
      console.log(this.userId);
      console.log("Subscribing");
    }  
    );
  } */

  getUserId(){

    this.userId = this.sharesService.userId;
    console.log(this.userId);
    
  }

  //updating crowbox stage
  retrieveCrowboxData(): Observable<any> {
    this.updateTrainingStage = this.cbservice.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ key: c.payload.key, ...c.payload.val()  })
        )
      )
    );

    return this.updateTrainingStage;
  }

  updateSubscription(): void {
    
    this.retrieveCrowboxData().subscribe(data => {
      this.dataSample = data;

      if (this.dataSample) {
        console.log(this.dataSample);
        this.key = this.dataSample[0].key;
        console.log(this.key);
        this.UpdateCrowBoxTrainingStage(this.key);
      }
    })
  }

  UpdateCrowBoxTrainingStage(userKey:any) {
    this.cbservice.userDbPath = `Users/${userKey}`;
    console.log(this.cbservice.userDbPath);

    this.cbservice.userReference = this.cbservice.db.list(this.cbservice.userDbPath);
    /* this.cbservice.userReference.update('Crowbox', {current_training_stage:this.trainingStage}); */

    this.cbservice.updateUserRef('Crowbox', {current_training_stage:this.trainingStage});

  } 

  setOne(){
    this.trainingStage = 1;
    console.log(this.trainingStage);
  }

  setTwo(){
    this.trainingStage = 2;
    console.log(this.trainingStage);
  }

  setThree(){
    this.trainingStage = 3;
    console.log(this.trainingStage);
  }

  setFour(){
    this.trainingStage = 4;
    console.log(this.trainingStage);
  }
  
  //displaying coins deposited
  updateCoinsDeposited() {
    this.retrieveCrowboxData().subscribe(data => {
      this.dataSample = data;

      if (this.dataSample) {
        console.log(this.dataSample);
        this.key = this.dataSample[0].key;
        console.log(this.key);
        this.showCoinsDeposited(this.key);
      }
    });
  }
  
  showCoinsDeposited(userKey:any) {
    this.cbservice.userDbPath = `Users/${userKey}`;
    console.log(this.cbservice.userDbPath);
    this.cbservice.userReference = this.cbservice.db.list(this.cbservice.userDbPath);

    this.displayCoins = this.cbservice.userReference.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => (
          {key: c.payload.key, ...c.payload.val()}
        )))
    );

    //subscribe to it 
    this.displayCoins.subscribe(data =>
      {
        this.chartCoinDeposited = data[0].coins_deposited;
        this.coinsData[0] = this.chartCoinDeposited;

        this.barChartData = [
          { data: this.coinsData, label: 'Coins Deposited' },
          { data: this.perchData, label: 'Crows Landed On Perch'}

        ];

      }
    )
  }

  //display number of crows landed on perch
  updateNumCrowsOnPerch() {
    this.retrieveCrowboxData().subscribe(data => {
      this.dataSample = data;

      if (this.dataSample) {
        console.log(this.dataSample);
        this.key = this.dataSample[0].key;
        console.log(this.key);
        this.showNumCrowsOnPerch(this.key);
      }
    });
  }

  showNumCrowsOnPerch(userKey:string) {
    this.cbservice.userDbPath = `Users/${userKey}`;
    console.log(this.cbservice.userDbPath);
    this.cbservice.userReference = this.cbservice.db.list(this.cbservice.userDbPath);

    this.displayCrows = this.cbservice.userReference.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => (
          {key: c.payload.key, ...c.payload.val()}
        )))
    );

    this.displayCrows.subscribe(data => {
      this.chartCrowsOnPerch = data[0].crows_landed_on_perch;
      this.perchData[0] = this.chartCrowsOnPerch;
      
      this.barChartData = [
        { data: this.coinsData, label: 'Coins Deposited' },
        { data: this.perchData, label: 'Crows Landed On Perch'}

      ];
    });
  }

}
