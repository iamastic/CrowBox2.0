import { Component, OnChanges, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';



@Component({
  selector: 'app-picture',
  templateUrl: './picture.component.html',
  styleUrls: ['./picture.component.css']
})
export class PictureComponent implements OnInit, OnChanges {

  userId?:string;
  profileUrl?:any;
  filePath?:string;

  constructor(private storage: AngularFireStorage, private crowboxService:CrowboxdbService) { }

  ngOnInit(): void {
    this.userId = this.crowboxService.currentUserId;
    
  }

  ngOnChanges() {
  }

  uploadFile(event:any) {
    const file = event.target.files[0];
    this.filePath = `${this.userId}/displayPicture`;
    const task = this.storage.upload(this.filePath, file);

    this.getProfilePicture();
  }

  getProfilePicture() {
    const ref = this.storage.ref(`${this.userId}/displayPicture.jpg`);
    this.profileUrl = ref.getDownloadURL();
  }

}
