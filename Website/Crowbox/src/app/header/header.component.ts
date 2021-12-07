import { Component, OnDestroy, OnInit } from '@angular/core';

import { MediaObserver, MediaChange } from '@angular/flex-layout';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  mediaSub?:Subscription;

  isDeviceXL?:boolean;
  isDeviceLG?:boolean;
  isDeviceMD?:boolean;
  isDeviceSM?:boolean;
  isDeviceXS?:boolean;

  constructor(private mediaObserver:MediaObserver) { }

  ngOnInit(): void {
    this.mediaSub = this.mediaObserver.asObservable().subscribe((result)=> {
      console.log(result[0].mqAlias);
      this.isDeviceXL = result[0].mqAlias === "xl" ? true : false;
      this.isDeviceLG = result[0].mqAlias === "lg" ? true : false;
      this.isDeviceMD = result[0].mqAlias === "md" ? true : false;
      this.isDeviceSM = result[0].mqAlias === "sm" ? true : false;
      this.isDeviceXS = result[0].mqAlias === "xs" ? true : false;
    })
  }

  ngOnDestroy() {
    this.mediaSub?.unsubscribe();
  }

}
