import { Injectable } from '@angular/core';

/* for firebase connection to database and for getting the lists */
import { AngularFireDatabase, AngularFireList, AngularFireObject  } from '@angular/fire/database';

/* to get the unique user id for the lists */
import { HandleAuthService } from '../shared/handle-auth.service';

@Injectable({
  providedIn: 'root'
})
export class CrowboxdbService {

  //user's object 
  userReference!:AngularFireObject<any>;
  usersDataPath = 'Users/';
  currentUserId?:any;

  //crows on perch list 
  crowsOnPerchReference!:AngularFireList<any>;
  crowsOnPerchDataPath!: any;

  //coin deposited list
  coinsDepositedReference!:AngularFireList<any>;
  coinsDepositedDataPath!:any; 

  //crowbox object 
  crowboxReference!:AngularFireObject<any>;
  crowboxDataPath!:any;

  //public list
  publicReference!: AngularFireList<any>;
  publicDataPath = 'Public/';

  //Location List
  locationReference!:AngularFireList<any>;
  locationDataPath = 'Public/Location/'

  //Site Data list
  siteReference!:AngularFireList<any>;
  siteDataPath = 'Site/';


  constructor(private db: AngularFireDatabase, private handleAuth: HandleAuthService) {
    
    //try to get the user id from handleAuth (if this is the first time loggin in)
    this.currentUserId = this.handleAuth.currentUserState?.uid;
    //if you cannot get the user id from handleAuth, then get it from the localStorage
    if(!this.currentUserId) {
      console.log("Error in crowboxdb Service - Cannot retrieve user id from handleAuth");
      //get the user information from the local storage
      const item = localStorage.getItem('user');
      if (item !=='undefined' && item!==null) {
        const currentUser = JSON.parse(item);
        this.currentUserId = currentUser.uid!;
      }
    }

    //set up user object
    //set up crows on perch list
    //set up coins deposited list 

    //setting the reference for the user's object
    //used to get data such as Location and nam
    this.userReference = db.object(this.usersDataPath+`${this.currentUserId}`);

    //setting the reference for the crows on the perch
    //data
    this.crowsOnPerchDataPath = `Users/${this.currentUserId}/Crowbox/crows_landed_on_perch`;
    this.crowsOnPerchReference = db.list(this.crowsOnPerchDataPath);

    //setting the reference for the coins deposited data
    this.coinsDepositedDataPath = `Users/${this.currentUserId}/Crowbox/coins_deposited`;
    this.coinsDepositedReference = db.list(this.coinsDepositedDataPath);

    //setting up the reference for the main crowbox
    this.crowboxDataPath = `Users/${this.currentUserId}/Crowbox`;
    this.crowboxReference = db.object(this.crowboxDataPath);
    
    //set up public list
    this.publicReference = db.list(this.publicDataPath);

    //set up the Location list 
    this.locationReference = db.list(this.locationDataPath);

    //set up site list
    this.siteReference = db.list(this.siteDataPath);
  }


  /* these functions simply return the reference. 
  The reference will be used to further obtain the 
  individual pieces of data from the various nodes */
  getUser(): AngularFireObject<any> {
    return this.userReference;
  }

  getCrowOnPerchData(): AngularFireList<any> {
    return this.crowsOnPerchReference;
  }

  getCoinDepositedData():AngularFireList<any> {
    return this.coinsDepositedReference;
  }

  /* CROWBOX OBJECT RELATED */
  getUserCrowbox() : AngularFireObject<any> {
    return this.crowboxReference;
  }

  updateUserLocation(location:string):void {
    this.userReference.update({ location: location });
  }

  updateTrainingStage(trainingStage: number): void {
    this.crowboxReference.update({current_training_stage: trainingStage});
  }

  updateUserDateJoined(dateJoined:string): void {
    this.crowboxReference.update({date_joined:dateJoined});
  }

  updateUserName(name:string) {
    this.crowboxReference.update({name:name});
  }

  updateTotalCoinsDeposited(numCoins:number) {
    this.crowboxReference.update({total_coins_deposited:numCoins});
  }

  updateTotalCrowsLandedOnPerch(crowsOnPerch:number) {
    this.crowboxReference.update({total_crows_landed_on_perch:crowsOnPerch});
  }

  updateSharingPreferences(sharing:string) {
    this.crowboxReference.update({sharing_preference:sharing});
  }

  updateNotifcationSettings(notifcation:string) {
    this.crowboxReference.update({notification_settings:notifcation});
  }


  updateCrowboxNickname(nickname:string) {
    this.crowboxReference.update({nickanme:nickname});
  }


  /* PUBLIC RELATED */
  getAllPublicData(): AngularFireList<any> {
    return this.publicReference;
  }

  getAllLocationData(): AngularFireList<any> {
    return this.locationReference;
  }

  /* SITE RELATED */

  getAllSiteData(): AngularFireList<any>{
    return this.siteReference;
  }

}