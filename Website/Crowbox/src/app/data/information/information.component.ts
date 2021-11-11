import { AfterContentInit, Component, OnInit, Input, OnChanges } from '@angular/core';
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css']
})
export class InformationComponent implements OnInit, AfterContentInit, OnChanges {

  //receive the values array for both: Crows on perch and Coins Deposited
  @Input() crowsOnPerch!:number[];
  @Input() coinsDeposited!:number[]; 

  totalCrowsLandedOnPerch:number = 0;
  totalCoinsDeposited?:number = 0;

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

  ngOnChanges() {
    this.addCrowsOnPerchValues();
    this.addCoinsDepositedValues();
  }

  /* ADD UP ALL VALUES IN CROW ON PERCH ARRAY */
  addCrowsOnPerchValues() {
    if(this.crowsOnPerch.length != 0) {
      const reducer = (accumulator:any, curr:any) => accumulator + curr;
      console.log(this.crowsOnPerch.reduce(reducer));
      this.totalCrowsLandedOnPerch = this.crowsOnPerch.reduce(reducer);
    }
  }

  /* ADD UP ALL THE VALUES IN THE COINS DEPOSITED ARRAY */
  addCoinsDepositedValues() {
    if(this.coinsDeposited.length !=0) {
      const reducer = (accumulator:any, curr:any) => accumulator + curr;
      this.totalCoinsDeposited = this.coinsDeposited.reduce(reducer);
    }
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
  /* THERE IS AN ISSUE HERE 
  NICKNAME IS NOT WITHIN GETUSER()*/
  getAllInformationData() {
    this.crowboxService.getUser()
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
