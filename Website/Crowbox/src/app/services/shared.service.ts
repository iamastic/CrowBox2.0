import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class SharedService {

  /* private useridSource = new BehaviorSubject('empty');

  useridMessage$ = this.useridSource.asObservable(); */

  public userId:any;

  constructor() {
    this.userId = sessionStorage.getItem('uid');
   }

  storeDataInSession() {
    if (this.userId) {
      sessionStorage.setItem('uid', this.userId);
    }
  }

  /* sendUserId(userId:string) {
    this.useridSource.next(userId);
  } */
}
