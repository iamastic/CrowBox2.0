import { Injectable } from '@angular/core';


/* for firebase connection to database and for getting the lists */
import { AngularFireDatabase, AngularFireList, AngularFireObject  } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class PublicService {

  
  //Country List - to replace "Location"
  countryReference!:AngularFireList<any>;
  countryDataPath = 'Public/Countries/';

  constructor(private db: AngularFireDatabase) { 

    //set up country reference
    this.countryReference = this.db.list(this.countryDataPath);
  }

  getAllCountryData():AngularFireList<any> {
    return this.countryReference;
  }
}

