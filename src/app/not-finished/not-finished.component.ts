import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-finished',
  templateUrl: './not-finished.component.html',
  styleUrls: [ './not-finished.component.css' ]
})
export class NotFinishedComponent implements OnInit {

  constructor(private _location: Location) { }

  ngOnInit() {

  }
  goBack() {
    this._location.back();
  }

}
