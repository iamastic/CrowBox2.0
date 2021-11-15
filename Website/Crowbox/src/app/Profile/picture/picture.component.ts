import { Component, OnChanges, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';



@Component({
  selector: 'app-picture',
  templateUrl: './picture.component.html',
  styleUrls: ['./picture.component.css']
})
export class PictureComponent implements OnInit, OnChanges {

  userName?:string;
  userId?:string;
  profileUrl?:any;
  filePath?:string;

  constructor(private handleAuth:HandleAuthService, private storage: AngularFireStorage, private crowboxService:CrowboxdbService) { }

  ngOnInit(): void {
/*     
    this.handleAuth.getAuthUser$()
    .subscribe(result => {
      if (result) {
        this.userId = result.uid;
        //this.getProfilePicture();
      }
    }) */
    
    //Subscribe to the user auth state observable and wait 
    //to get the UID to proceed
    this.handleAuth.currentUser$
    .subscribe(user => {
      //this.userName = user.displayName;
      this.userId = user.uid;
      console.log("AUTH STATE is: ")
      console.log(this.handleAuth.printAuthState());

      //subscribe to the reference object of the user and get their name
      this.crowboxService.getUser()
      .snapshotChanges()
      .subscribe(result => {
        this.userName = result.payload.val().name;
      });

      if(this.userId) {
        this.getProfilePicture();
      }
    });



  }

  ngOnChanges() {
  }

  uploadFile(event:any) {
    const file = event.target.files[0];
/*     this.filePath = `${this.userId}/displayPicture`; */
    this.filePath = "/image1";
    const task = this.storage.upload(this.filePath, file);
  }

  getProfilePicture() {
/*     const ref = this.storage.ref(`${this.userId}/displayPicture.jpg`); */

    const ref = this.storage.ref("image1.jpg");
    this.profileUrl = ref.getDownloadURL();
  }

}
