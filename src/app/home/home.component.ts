import { Component, OnInit } from '@angular/core';

declare const AOS: any;
declare const $: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  enhanced = false;
  activated = false;
  menuOpacity = 0;
  menuHeight = '0';
  constructor() {}

  ngOnInit() {
    AOS.init();
    setTimeout(() => {
      this.enhanced = true;
    }, 1000);
  }

  toggleMobileMenu() {
    this.activated = !this.activated;
    this.menuOpacity = this.activated ? 1 : 0;
    this.menuHeight = this.activated ? '100%' : '0';
    if (this.activated) {
      $('body').css('overflow', 'hidden');
      $('html').css('overflow', 'hidden');
    } else {
      $('body').css('overflow', 'visible');
      $('html').css('overflow', 'visible');
    }
  }
}
