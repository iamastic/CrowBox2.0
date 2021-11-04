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

  //coin deposied list
  coinsDepositedReference!:AngularFireList<any>;
  coinsDepositedDataPath!:any; 

  //public list
  publicReference!: AngularFireList<any>;
  publicDataPath = 'Public/';

  //Site Data list
  siteReference!:AngularFireList<any>;
  siteDataPath = 'Site/';

  constructor(private db: AngularFireDatabase, private handleAuth: HandleAuthService) {

    //set up user object
    //set up crows on perch list
    //set up coins deposited list 
    this.currentUserId = this.handleAuth.currentUserId;
    if (this.currentUserId) {
      //setting the reference for the user's object
      //used to get data such as Location and name
      this.userReference = db.object(this.usersDataPath+`${this.currentUserId}`);

      //setting the reference for the crows on the perch 
      //data
      this.crowsOnPerchDataPath = `Users/${this.currentUserId}/Crowbox/crows_landed_on_perch`;
      this.crowsOnPerchReference = db.list(this.crowsOnPerchDataPath);

      //setting the reference for the coins deposited data
      this.coinsDepositedDataPath = `Users/${this.currentUserId}/Crowbox/coins_deposited`;
      this.coinsDepositedReference = db.list(this.coinsDepositedDataPath);

    } else {
      console.log("Error in crowboxdb Service - Cannot retrieve user id");
    }

    //set up public list
    this.publicReference = db.list(this.publicDataPath);

    //set up site list
    this.siteReference = db.list(this.siteDataPath);
  }


  /* these functions simply return the reference. 
  The reference will be used to further obtain the 
  individual pieces of data from the various nodes */
  getUser(): AngularFireObject<any> {
    return this.userReference;
  }

  updateUserLocation(location:String):void {
    this.userReference.update({ Location: location });
  }

  getAllPublicData(): AngularFireList<any> {
    return this.publicReference;
  }

  getAllSiteData(): AngularFireList<any>{
    return this.siteReference;
  }

  getCrowOnPerchData(): AngularFireList<any> {
    return this.crowsOnPerchReference;
  }

  getCoinDepositedData():AngularFireList<any> {
    return this.coinsDepositedReference;
  }


}
