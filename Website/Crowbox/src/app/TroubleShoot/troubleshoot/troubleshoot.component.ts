import { Component, OnInit } from '@angular/core';
import { interval, Observable, Subscription, timer } from 'rxjs';
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

@Component({
  selector: 'app-troubleshoot',
  templateUrl: './troubleshoot.component.html',
  styleUrls: ['./troubleshoot.component.css']
})
export class TroubleshootComponent implements OnInit {

  coinsRemaining = "EMPTY";
  foodLevel = "EMPTY";
  water = "EMPTY";
  servo = "EMPTY";
  wifi = "EMPTY";

  constructor(private handleAuth:HandleAuthService, private crowboxService:CrowboxdbService) { }

  ngOnInit(): void {
    this.handleAuth.currentUser$
    .subscribe(user => {
      this.getTroubleshootInfo();
    });

  }

  getTroubleshootInfo() {
    this.crowboxService
    .getStatusData()
    .snapshotChanges()
    .subscribe(result => {
      this.coinsRemaining = result.payload.val().coins;
      this.foodLevel = result.payload.val().food;
      this.water = result.payload.val().humidity;
      this.wifi = result.payload.val().wifi;
      this.servo = result.payload.val().servo;
    });
  }

}
