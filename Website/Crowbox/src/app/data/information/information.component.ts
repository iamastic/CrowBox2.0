import { AfterContentInit, Component, OnInit } from '@angular/core';
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css']
})
export class InformationComponent implements OnInit, AfterContentInit {

  //display and manipulate the training stage for the crowbox
  currentTrainingStage?:number;

  //object holding all the information to be displayed on the data page 
  informationBox = {
    nickname:"null",
    date_joined:"null",
    total_coins_deposited:0,
    total_crows_landed_on_perch:0
  }

  //boolean to check if the user needs to fill out profile details
  pendingProfileDetails!:boolean;

  constructor(private crowboxService:CrowboxdbService) { }

  ngOnInit(): void {
  }

  ngAfterContentInit() {
    this.getTrainingStage();
    this.getAllInformationData();
  }
  
  /* ---------------------------------------------------- */

  /* GET TRAINING STAGE */
  getTrainingStage() {
    this.crowboxService
    .getUserCrowbox()
    .snapshotChanges()
    .subscribe(result => {
      this.currentTrainingStage = result.payload.val().current_training_stage;
    });
  }

  /* ---------------------------------------------------- */

  /* CHANGE TRAINING STAGES */
  phaseOne() {
    this.currentTrainingStage = 1;
    this.crowboxService.updateTrainingStage(this.currentTrainingStage);
  }

  phaseTwo() {
    this.currentTrainingStage = 2;
    this.crowboxService.updateTrainingStage(this.currentTrainingStage);
  }

  phaseThree() {
    this.currentTrainingStage = 3;
    this.crowboxService.updateTrainingStage(this.currentTrainingStage);
  }

  phaseFour() {
    this.currentTrainingStage = 4;
    this.crowboxService.updateTrainingStage(this.currentTrainingStage);
  }

  /* ---------------------------------------------------- */

  /* DISPLAY INFORMATION IN BOX */
  getAllInformationData() {
    this.crowboxService.getUserCrowbox()
    .snapshotChanges()
    .subscribe(result => {
      console.log("Information data: " + result.payload.val().date_joined);
      this.informationBox = {
        date_joined : result.payload.val().date_joined,
        nickname: result.payload.val().nickname,
        total_coins_deposited: result.payload.val().total_coins_deposited,
        total_crows_landed_on_perch: result.payload.val().total_crows_landed_on_perch
      };

      this.checkIfPendingProfile();
    });
  }

  checkIfPendingProfile() {
    if(this.informationBox.date_joined !== "null") {
      if(this.informationBox.nickname !== "null") {
        this.pendingProfileDetails = false;
      } else {
          this.pendingProfileDetails = true;
      }
    } else {
        this.pendingProfileDetails = true;
    }
  }

}
