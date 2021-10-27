import { Injectable } from '@angular/core';

//for firebase connection
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

//import the model
import CrowboxData from '../models/crowbox-data';

@Injectable({
  providedIn: 'root'
})
export class CrowboxdbService {

  crowboxDataPath = 'Users/';

  crowboxReference!: AngularFireList<CrowboxData>;

  userReference!:AngularFireList<CrowboxData>;
  userDbPath!: string;
  userItem!:any;
  
  constructor(public db: AngularFireDatabase) { 
    this.crowboxReference = db.list(this.crowboxDataPath);
  }

  getAll(): AngularFireList<CrowboxData>{
    return this.crowboxReference;
  }

  update(key:string, value:any): Promise<void> {
    return this.crowboxReference.update(key, value);
  }


}
