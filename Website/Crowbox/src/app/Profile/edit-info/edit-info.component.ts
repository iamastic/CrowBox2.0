import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

import {DialogRole, MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';
import { PublicService } from 'src/app/services/public/public.service';
import { Observable, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';


@Component({
  selector: 'app-edit-info',
  templateUrl: './edit-info.component.html',
  styleUrls: ['./edit-info.component.css']
})
export class EditInfoComponent implements OnInit, OnDestroy {

  constructor(private handleAuth:HandleAuthService, public dialog:MatDialog, private crowboxService:CrowboxdbService ) { }

  newName?:string;
  newLocation?:string;
  newEmail?:string;
  newNotification?:string;
  newSharing?:string;

  /* HANDLING SUBSCRIPTIONS */
  $nameSub?:Subscription;
  $locationSub?:Subscription;
  $emailSub?:Subscription;
  $notificationSub?:Subscription;
  $sharingSub?:Subscription;

  ngOnDestroy(): void {
    this.$emailSub?.unsubscribe();
    this.$locationSub?.unsubscribe();
    this.$nameSub?.unsubscribe();
    this.$notificationSub?.unsubscribe();
    this.$sharingSub?.unsubscribe();
  }

  ngOnInit(): void {
  }

  changeName() {
    const dialogRef = this.dialog.open(EditOtherComponent, {
      width: '270px',
      data: { text:"Name",property: this.newName }
    });

    this.$nameSub = dialogRef.afterClosed().subscribe(result => {

      if(result) {
        console.log("New Name is: " + result);
        this.crowboxService.updateUserName(result);
      }
    });
  }

  changeLocation() {
    const dialogRef = this.dialog.open(EditLocationComponent, {
      width: '270px',
      data: { text:"Location",property: this.newLocation }
    });

    this.$locationSub = dialogRef.afterClosed().subscribe(result => {

      if(result) {
        console.log("New Location is: " + result);
        this.crowboxService.updateUserLocation(result);
      }
    });
  }

  changeEmail() {
    const dialogRef = this.dialog.open(EditOtherComponent, {
      width: '300',
      data: { text:"Email",property: this.newEmail }
    });

    this.$emailSub = dialogRef.afterClosed().subscribe(result => {
      if(result) {
        console.log("New Email is: " + result);
        this.crowboxService.updateUserEmail(result);
      }

    });
  }

  changeNotification() {
    const dialogRef = this.dialog.open(EditNotificationComponent, {
      width: '300',
      data: { text:"Notification Settings",property: this.newNotification }
    });

    this.$notificationSub = dialogRef.afterClosed().subscribe(result => {
      if(result) {
        console.log("New Notification Setting is: " + result);
        this.crowboxService.updateNotifcationSettings(result);
      }
    });
  }

  changeSharing() {
    const dialogRef = this.dialog.open(EditSharingComponent, {
      width: '300',
      data: { text:"Sharing Preference",property: this.newSharing }
    });

    this.$sharingSub = dialogRef.afterClosed().subscribe(result => {
      if(result) {
        console.log("New Sharing Preference is: " + result);
        this.crowboxService.updateSharingPreferences(result);
      }
    });
  }

  addABox() {
    const dialogRef = this.dialog.open(EditBoxComponent, {
      width: '300',
    });

  }

  logout() {
    this.handleAuth.logout();
  }

}

//Needs to provide the drop down list of all countries
//So must retrieve the list of countries - therefore it is a seperate component
@Component({
  selector: 'edit-location',
  templateUrl: './editBox/editLocation.html',
})

export class EditLocationComponent {

  listOfCountries: any[] = [];
  countries$?:Observable<any>;


  constructor(public dialogRef: MatDialogRef<EditLocationComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private publicService:PublicService){
    this.getCountriesList();
  }

  getCountriesList() {
    this.countries$ = this.publicService.getAllCountryData()
    .snapshotChanges()
    .pipe(
      map(value => 
        value.map(v => (
          {key: v.payload.key, ...v.payload.val()}
        )))
    );

    this.countries$
    .pipe(first())
    .subscribe(result => {
      this.listOfCountries = result;
    })
  }


  cancelChange() {
    this.dialogRef.close();
  }

}  

@Component({
  selector: 'edit-other',
  templateUrl: './editBox/editOther.html',
})

export class EditOtherComponent {

  constructor(public dialogRef: MatDialogRef<EditOtherComponent>, @Inject(MAT_DIALOG_DATA) public data: any){

  }

  cancelChange() {
    this.dialogRef.close();
  }

}  

@Component({
  selector: 'edit-notification',
  templateUrl: './editBox/editNotification.html',
})

export class EditNotificationComponent {

  constructor(public dialogRef: MatDialogRef<EditNotificationComponent>, @Inject(MAT_DIALOG_DATA) public data: any){

  }

  cancelChange() {
    this.dialogRef.close();
  }

}  


@Component({
  selector: 'edit-sharing',
  templateUrl: './editBox/editSharing.html',
})

export class EditSharingComponent {

  constructor(public dialogRef: MatDialogRef<EditSharingComponent>, @Inject(MAT_DIALOG_DATA) public data: any){

  }

  cancelChange() {
    this.dialogRef.close();
  }

}  

@Component({
  selector: 'edit-box',
  templateUrl: './editBox/editBox.html',
})

export class EditBoxComponent {

  constructor(public dialogRef: MatDialogRef<EditBoxComponent>){

  }

  cancelChange() {
    this.dialogRef.close();
  }

}  