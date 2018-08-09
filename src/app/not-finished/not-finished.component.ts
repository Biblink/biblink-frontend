import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

/**
 * Not finished component to display not finished page
 */
@Component({
  selector: 'app-not-finished',
  templateUrl: './not-finished.component.html',
  styleUrls: [ './not-finished.component.css' ]
})
export class NotFinishedComponent implements OnInit {
  /**
   * Initializes necessary dependency and does dependency injection
   * @param _location Loaction service to accesss current url
   */
  constructor(private _location: Location) { }
  /**
   * Initializes component
   */
  ngOnInit() {

  }
  /**
   * Goes back once in the browser history
   */
  goBack() {
    this._location.back();
  }

}
