import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-private',
  templateUrl: './private.component.html',
  styleUrls: ['./private.component.css']
})
export class PrivateComponent implements OnInit {

  crownsOnPerchValues: number[] = [];
  coinsDepositedValues: number[] = [];


  constructor() { }

  ngOnInit(): void {
  }

  receiveCrowsOnPerchOutput($event: number[]) {
    this.crownsOnPerchValues = $event;
  }

  receiveCoinsDepositedOutput($event: number[]) {
    this.coinsDepositedValues = $event;
  }

}
