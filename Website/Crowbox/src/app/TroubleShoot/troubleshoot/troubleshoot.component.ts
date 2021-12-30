import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';
import { HandleAuthService } from 'src/app/services/shared/handle-auth.service';

@Component({
  selector: 'app-troubleshoot',
  templateUrl: './troubleshoot.component.html',
  styleUrls: ['./troubleshoot.component.css'],
  // encapsulation: ViewEncapsulation.None,
})
export class TroubleshootComponent implements OnInit, OnDestroy {

  coinsRemaining = "EMPTY";
  foodLevel = "EMPTY";
  water = "EMPTY";
  servo = "EMPTY";
  wifi = "EMPTY";

  /* HANDLE SUBSCRIPTIONS */
  $handleUserAuthSub?:Subscription;
  $troubleshootInfo?:Subscription;

  showStatusBox:boolean = false;
  
  @Output() showStatusBoxEmit = new EventEmitter<any>();
  sendShowStatusBoxValueToParent() {
    this.showStatusBoxEmit.emit(this.showStatusBox);
  }

  constructor(private handleAuth:HandleAuthService, private crowboxService:CrowboxdbService) { }

  ngOnDestroy(): void {
      this.$handleUserAuthSub?.unsubscribe();
      this.$troubleshootInfo?.unsubscribe();
  }


  ngOnInit(): void {
    this.handleAuth.currentUser$
    .subscribe(user => {
      this.getTroubleshootInfo();
    });

  }

  getTroubleshootInfo() {
    this.$troubleshootInfo = this.crowboxService
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
