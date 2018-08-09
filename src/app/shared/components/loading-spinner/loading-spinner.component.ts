import { Component, OnInit } from '@angular/core';
/**
 * Loading spinner component to display while data is being loaded
 */
@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: [ './loading-spinner.component.css' ]
})
export class LoadingSpinnerComponent implements OnInit {

  /**
     * Initializes necessary dependency and does dependency injection
     */
  constructor() { }
  /**
   * Initializes component
   */
  ngOnInit() {
  }

}
