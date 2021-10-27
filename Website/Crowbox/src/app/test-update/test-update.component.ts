import { Component, OnInit } from '@angular/core';

import { CrowboxdbService } from '../services/crowboxdb.service';
import CrowboxData  from 'src/app/models/crowbox-data';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-test-update',
  templateUrl: './test-update.component.html',
  styleUrls: ['./test-update.component.css']
})
export class TestUpdateComponent implements OnInit {

  trainingStage?:number = 0;
  key!:string;

  dataSample?:CrowboxData[];

  updateTrainingStage?:Observable<any>;

  displayCoins?:Observable<any>;

  displayCrows?:Observable<any>;


  coinsDeposited!:any;


  constructor(private cbservice: CrowboxdbService) {
  }

  ngOnInit(): void {
    console.log("Entered ngonit");
    this.updateCoinsDeposited();
    this.updateNumCrowsOnPerch();
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

  updateSubscription() {
    
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
    this.cbservice.userReference.update('Crowbox', {current_training_stage:this.trainingStage});

  } 

  setOne(){
    this.trainingStage = 1;
    console.log(this.trainingStage);
  }

  setTwo(){
    this.trainingStage = 2;
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
  }

}
