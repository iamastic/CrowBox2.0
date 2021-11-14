import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  showHeader!:boolean;

  constructor(private handleAuth: HandleAuthService) { }

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
