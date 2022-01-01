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
  userName?:any;
  userEmail?:any;

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
  locationDataPath = 'Public/Location/';

  //Site Data list
  siteReference!:AngularFireList<any>;
  siteDataPath = 'Site/';

  //Status Object 
  statusReference!:AngularFireObject<any>;
  statusDataPath: any;


  constructor(private db: AngularFireDatabase, private handleAuth: HandleAuthService) {
    
    //try to get the user id from handleAuth (if this is the first time loggin in)
    //previously, I resorted to using the local storage to retrieve 
    //any user details before the subscription was received. 
    //now, I am going to do everything within the subscription
    this.handleAuth.currentUser$
    .subscribe(user => {
      this.currentUserId = user.uid;
      this.userName = user.name;
      this.userEmail = user.email;

      console.log("WITHIN currentUser$, the ID is: ");
      console.log(this.currentUserId);

      this.setupReferences();
    });
  }

  setupReferences() {
    //set up user object
    //set up crows on perch list
    //set up coins deposited list 

    //setting the reference for the user's object
    //used to get data such as Location and nam
    this.userReference = this.db.object(this.usersDataPath+`${this.currentUserId}`);

    //setting the reference for the crows on the perch
    //data
    this.crowsOnPerchDataPath = `Users/${this.currentUserId}/Crowbox/crows_landed_on_perch`;
    this.crowsOnPerchReference = this.db.list(this.crowsOnPerchDataPath);

    //setting the reference for the coins deposited data
    this.coinsDepositedDataPath = `Users/${this.currentUserId}/Crowbox/coins_deposited`;
    this.coinsDepositedReference = this.db.list(this.coinsDepositedDataPath);

    //setting up the reference for the main crowbox
    this.crowboxDataPath = `Users/${this.currentUserId}/Crowbox`;
    this.crowboxReference = this.db.object(this.crowboxDataPath);
    
    //set up public list
    this.publicReference = this.db.list(this.publicDataPath);

    //set up the Location list 
    this.locationReference = this.db.list(this.locationDataPath);

    //set up site list
    this.siteReference = this.db.list(this.siteDataPath);

    //set up the Troubleshoot/status reference
    this.statusDataPath = `Users/${this.currentUserId}/Crowbox/Status`;
    this.statusReference = this.db.object(this.statusDataPath);
  }


  /* These functions simply return the reference. 
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

  /* USER RELATED */

  setBoxExistence(isExists:string){
    this.userReference.update({box:isExists});
  }

  updateProfilePictureURL(url:string){
    this.userReference.update({profilePicture:url});
  }

  updateTotalCrowsOnPerchValueFromAllBoxes(value:number) {
    this.userReference.update({total_crows_landed_on_perch:value})
  }

  updateTotalCoinsDepositedFromAllBoxes(value:number) {
    this.userReference.update({total_coins_deposited:value})
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
    this.userReference.update({date_joined:dateJoined});
  }

  updateUserName(name:string) {
    this.userReference.update({name:name});
  }

  setUserName() {
    this.userReference.update({name:this.userName});
  }

  updateTotalCoinsDeposited(numCoins:number) {
    this.userReference.update({total_coins_deposited:numCoins});
  }

  updateTotalCrowsLandedOnPerch(crowsOnPerch:number) {
    this.userReference.update({total_crows_landed_on_perch:crowsOnPerch});
  }

  updateSharingPreferences(sharing:string) {
    this.userReference.update({sharing_preference:sharing});
  }

  updateNotifcationSettings(notifcation:string) {
    this.userReference.update({notification_settings:notifcation});
  }


  updateCrowboxNickname(nickname:string) {
    this.crowboxReference.update({nickname:nickname});
  }

  setUserEmail() {
    this.userReference.update({email:this.userEmail});
  }

  updateUserEmail(email:string) {
    this.userReference.update({email:email});
  }

  updateNumCrowBoxes(num:number) {
    this.userReference.update({num_crowboxes:num});
  }
  
  updateDateJoined(date:string) {
    this.userReference.update({date_joined:date});
  }

  updateCrowboxTotalCoinsDeposited(coins:number) {
    this.crowboxReference.update({total_coins_deposited:coins});
  }

  updateCrowboxCrowsOnPerch(crows:number) {
    this.crowboxReference.update({total_crows_landed_on_perch:crows});
  }


  /* PUBLIC RELATED */
  getAllPublicData(): AngularFireList<any> {
    return this.publicReference;
  }

  getAllLocationData(): AngularFireList<any> {
    return this.locationReference;
  }

 
  /* TROUBLESHOOT RELATED */
  getStatusData():AngularFireObject<any>{
    return this.statusReference;
  }

  updatePreviousWifiTime(time:String) {
    this.statusReference.update({prevWifiTime:time});
  }

  updateWifiStatus(status:String) {
    this.statusReference.update({wifi:status});
  }

  /* SITE RELATED */

  getAllSiteData(): AngularFireList<any>{
    return this.siteReference;
  }

  /* OFFLINE RELATED */
  updateOfflineCrowsOnPerch(date:string, crows:number) {
    let path = `Users/${this.currentUserId}/Crowbox/crows_landed_on_perch/${date}`;

    let offlineReference = this.db.object(path);
    offlineReference.update({value:crows});
  }

  updateOfflineCoinsDeposited(date:string, coins:number) {
    let path = `Users/${this.currentUserId}/Crowbox/coins_deposited/${date}`;

    let offlineReference = this.db.object(path);
    offlineReference.update({value:coins});
  }



}
