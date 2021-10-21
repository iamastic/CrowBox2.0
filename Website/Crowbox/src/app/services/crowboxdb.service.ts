import { Injectable } from '@angular/core';

//for firebase connection
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

//import the model
import CrowboxData from '../models/crowbox-data';

@Injectable({
  providedIn: 'root'
})
export class CrowboxdbService {

  private crowboxDataPath!: '/Users/qureshiahamza/Crowbox';

  constructor() { }
}
