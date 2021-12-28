import { OnDestroy, Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css']
})
export class InformationComponent implements OnInit, OnChanges, OnDestroy {

  //receive the values array for both: Crows on perch and Coins Deposited
  @Input() crowsOnPerch!:number[];
  @Input() coinsDeposited!:number[]; 

  //is the user logged in yet?
  userSet:boolean = false;

  totalCrowsLandedOnPerch:number = 0;
  totalCoinsDeposited:number = 0;

  //display and manipulate the training stage for the crowbox
  currentTrainingStage?:number;

  //object holding all the information to be displayed on the data page 
  informationBox = {
    date_joined:"null",
    total_coins_deposited:0,
    total_crows_landed_on_perch:0
  }

  //the currently selected crowbox's name
  crowboxNickname?:any;

  //boolean to check if the user needs to fill out profile details
  pendingProfileDetails!:boolean;

  //Status of crowbox 
  status?:any;
  isError = false;
  showStatusBox = true;

  //Send the boolean value of showing the box to the private component
  @Output() showStatusBoxEmit = new EventEmitter<any>();
  sendShowStatusBoxValueToParent() {
    this.showStatusBoxEmit.emit(this.showStatusBox);
  }

  // For Troubleshooting
  coinsRemaining = "EMPTY";
  foodLevel = "EMPTY";
  water = "EMPTY";
  servo = "EMPTY";
  wifi = "EMPTY";



  /* OTHER SUBSCRIPTIONS */
  $handleUserAuthSub?:Subscription;
  $traingStageSub?:Subscription;
  $informationSub?:Subscription;
  $troubleShootSub?:Subscription;

  constructor(private handleAuth:HandleAuthService, private crowboxService:CrowboxdbService) { }

  ngOnDestroy(): void {
    this.$handleUserAuthSub?.unsubscribe();
    this.$traingStageSub?.unsubscribe();
    this.$informationSub?.unsubscribe();
    this.$troubleShootSub?.unsubscribe();

  }

  ngOnInit(): void {
    //Subscribe to the user auth state observable and wait 
    //to get the UID to proceed
    this.$handleUserAuthSub = this.handleAuth.currentUser$
    .subscribe(user => {
      this.userSet = true;
      this.getTrainingStage();
      this.getAllInformationData();
      this.getTroubleshootInfo();
    });
  }

  ngOnChanges() {
    if (this.userSet) {
      this.addCrowsOnPerchValues();
      this.addCoinsDepositedValues();
    }
  }

  /* ADD UP ALL VALUES IN CROW ON PERCH ARRAY */
  addCrowsOnPerchValues() {
    if(this.crowsOnPerch.length != 0) {
      const reducer = (accumulator:any, curr:any) => accumulator + curr;
      this.totalCrowsLandedOnPerch = this.crowsOnPerch.reduce(reducer);
    }

    this.crowboxService.updateCrowboxCrowsOnPerch(this.totalCrowsLandedOnPerch);
    this.crowboxService.updateTotalCrowsOnPerchValueFromAllBoxes(this.totalCrowsLandedOnPerch);
  }

  /* ADD UP ALL THE VALUES IN THE COINS DEPOSITED ARRAY */
  addCoinsDepositedValues() {
    if(this.coinsDeposited.length !=0) {
      const reducer = (accumulator:any, curr:any) => accumulator + curr;
      this.totalCoinsDeposited = this.coinsDeposited.reduce(reducer);
    }

    this.crowboxService.updateCrowboxTotalCoinsDeposited(this.totalCoinsDeposited);
    this.crowboxService.updateTotalCoinsDepositedFromAllBoxes(this.totalCoinsDeposited);

  }
  
  /* ---------------------------------------------------- */

  /* GET TRAINING STAGE */
  getTrainingStage() {
    this.$traingStageSub = this.crowboxService
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
    this.$informationSub = this.crowboxService.getUser()
    .snapshotChanges()
    .subscribe(result => {
      this.informationBox = {
        date_joined : result.payload.val().date_joined,
        total_coins_deposited: result.payload.val().total_coins_deposited,
        total_crows_landed_on_perch: result.payload.val().total_crows_landed_on_perch
      };

    this.crowboxService.getUserCrowbox()
    .snapshotChanges()
    .subscribe(result => {
      this.crowboxNickname= result.payload.val().nickname;
    });

    });
  }

  /* FOR TROUBLESHOOTING PURPOSES */
  getTroubleshootInfo() {
    this.$troubleShootSub = this.crowboxService
    .getStatusData()
    .snapshotChanges()
    .subscribe(result => {
        this.isError = false;
        this.status = "WORKING";

/*         Object.values(result.payload.val()).forEach(element => {
          if(element !== "WORKING") {
            this.isError = true;
            this.status = "ERROR";
            //ADD THE REST HERE
          } 
        });
 */
        this.coinsRemaining = result.payload.val().coins;
        this.foodLevel = result.payload.val().food;
        this.water = result.payload.val().humidity;
        this.wifi = result.payload.val().wifi;
        this.servo = result.payload.val().servo;

/*         if(this.coinsRemaining!=="WORKING"){
          if(this.foodLevel!=="WORKING") {
            if(this.water!=="WORKING"){
              if(this.wifi!=="WORKING"){
                if(this.servo!=="WORKING"){
                  this.isError = true;
                  this.status = "ERROR";
                }
              }
            }
          }
        } */

        if((this.coinsRemaining!=="WORKING") || (this.foodLevel!=="WORKING") || (this.water!=="WORKING") || (this.wifi!=="WORKING") || (this.servo!=="WORKING")) {
          this.isError = true;
          this.status = "ERROR";
        }
    });
  }
}
