import { Component, OnInit } from '@angular/core';

import { faUtensils, faCrow, faLockOpen, faHome, faLock } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-infobox',
  templateUrl: './infobox.component.html',
  styleUrls: ['./infobox.component.css']
})
export class InfoboxComponent implements OnInit {

  faUtensils = faUtensils;
  faCrow=faCrow;
  faLockOpen=faLockOpen;
  faHome=faHome;
  faLock=faLock;

  constructor() { }

  ngOnInit(): void {
  }

}
