import { Component, OnInit } from '@angular/core';

declare const AOS: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  enhanced = false;
  constructor() {}

  ngOnInit() {
    AOS.init();
    setTimeout(() => {
      this.enhanced = true;
    }, 1000);
  }
}
