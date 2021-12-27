import { Component, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';



@Component({
  selector: 'app-picture',
  templateUrl: './picture.component.html',
  styleUrls: ['./picture.component.css']
})
export class PictureComponent implements OnInit, OnChanges, OnDestroy {
  
  /* NEW */
  downloadURL?: Observable<string>;

  /* OLD */
  userName?:string;
  userId?:string;
  profileUrl?:String;
  filePath?:string;


  /* HANDLE SUBSCRIPTIONS */
  $handleAuthUserSub?:Subscription;
  $userSub?:Subscription;
  $downloadURLSub?:Subscription;
  $taskSub?:Subscription;
  $profilePicture?:Subscription;

  constructor(private handleAuth:HandleAuthService, private storage: AngularFireStorage, private crowboxService:CrowboxdbService) { }

  ngOnDestroy(): void {
    this.$handleAuthUserSub?.unsubscribe();
    this.$userSub?.unsubscribe();
    this.$downloadURLSub?.unsubscribe();
    this.$taskSub?.unsubscribe();
    this.$profilePicture?.unsubscribe();
  }

  ngOnInit(): void {
    //Subscribe to the user auth state observable and wait 
    //to get the UID to proceed
    this.$handleAuthUserSub = this.handleAuth.currentUser$
    .subscribe(user => {
      //this.userName = user.displayName;
      this.userId = user.uid;
      // console.log("AUTH STATE is: ")
      // console.log(this.handleAuth.printAuthState());

      //subscribe to the reference object of the user and get their name
      this.$userSub = this.crowboxService.getUser()
      .snapshotChanges()
      .subscribe(result => {
        this.userName = result.payload.val().name;
        
        // Obtain the profile picture's url 
        this.profileUrl = result.payload.val().profilePicture; 
        console.log(this.profileUrl);
      });
    });
  }

  ngOnChanges() {
  }

  uploadFile(event:any) {
    const file = event.target.files[0];
    this.filePath = `/Users/${this.userId}/profilePicture`;
    const fileRef = this.storage.ref(this.filePath);
    const task = this.storage.upload(this.filePath, file);


    console.log("Upload Percentage: " + task.percentageChanges().subscribe(result => {console.log(result)}));

    this.$taskSub = task.snapshotChanges().pipe(
      finalize(() => {
        //Get the download url of the photo that has been stored
        //in the storage
        this.downloadURL = fileRef.getDownloadURL();
        
        //Store this url in the user's database
        this.$downloadURLSub = this.downloadURL.subscribe(result => {
          console.log("Printing downloadURL");
          console.log(result);
          this.crowboxService.updateProfilePictureURL(result);
        })
      }))
    .subscribe();
  }

  // This function retrieves the profile picture 
  // by getting the download url from the user's 
  // database node
  getProfilePicture() {
    this.crowboxService.getUser()
    .snapshotChanges()
    .subscribe(result => {
      // Obtain the profile picture's url 
      this.profileUrl = result.payload.val().profilePicture; 
      console.log(this.profileUrl);
    })
  }

}
