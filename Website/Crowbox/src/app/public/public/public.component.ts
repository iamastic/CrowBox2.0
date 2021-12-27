import { Component, OnInit } from '@angular/core';
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.css']
})
export class PublicComponent implements OnInit {
  showHeader!:boolean;

  constructor(private handleAuth:HandleAuthService) { }

  ngOnInit(): void {

    if(this.isLoggedIn()){
      this.showHeader = true;
    } else {
      this.showHeader = false;
    }
  }

    
  isLoggedIn() {
    return this.handleAuth.isLoggedIn;
  }

}
