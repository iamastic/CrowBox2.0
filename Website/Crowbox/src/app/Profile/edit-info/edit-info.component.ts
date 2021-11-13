import { Component, Inject, OnInit } from '@angular/core';
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

import {DialogRole, MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';


@Component({
  selector: 'app-edit-info',
  templateUrl: './edit-info.component.html',
  styleUrls: ['./edit-info.component.css']
})
export class EditInfoComponent implements OnInit {

  constructor(private handleAuth:HandleAuthService, public dialog:MatDialog, private crowboxService:CrowboxdbService ) { }

  newLocation?:string;
  newEmail?:string;
  newNotification?:string;
  newSharing?:string;

  ngOnInit(): void {
  }

  changeLocation() {
    const dialogRef = this.dialog.open(EditLocationComponent, {
      width: '270px',
      data: { text:"Location",property: this.newLocation }
    });

    dialogRef.afterClosed().subscribe(result => {

      if(result) {
        console.log("New Location is: " + result);
        this.crowboxService.updateUserLocation(result);
      }

    });
  }

  changeEmail() {
    const dialogRef = this.dialog.open(EditLocationComponent, {
      width: '300',
      data: { text:"Email",property: this.newEmail }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        console.log("New Email is: " + result);
        this.crowboxService.updateUserEmail(result);
      }

    });
  }

  changeNotification() {
    const dialogRef = this.dialog.open(EditLocationComponent, {
      width: '300',
      data: { text:"Notification Settings",property: this.newNotification }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        console.log("New Notification Setting is: " + result);
        this.crowboxService.updateNotifcationSettings(result);
      }
    });
  }

  changeSharing() {
    const dialogRef = this.dialog.open(EditLocationComponent, {
      width: '300',
      data: { text:"Sharing Preference",property: this.newNotification }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        console.log("New Sharing Preference is: " + result);
        this.crowboxService.updateSharingPreferences(result);
      }
    });
  }

  addABox() {

  }

  logout() {
    this.handleAuth.logout();
  }

}


@Component({
  selector: 'edit-location',
  templateUrl: './editBox/editLocation.html',
})

export class EditLocationComponent {

  constructor(public dialogRef: MatDialogRef<EditLocationComponent>, @Inject(MAT_DIALOG_DATA) public data: any){

  }

  cancelChange() {
    this.dialogRef.close();
  }

} 