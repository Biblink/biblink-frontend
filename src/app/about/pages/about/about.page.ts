import { Component, OnInit } from '@angular/core';

/**
 * About component to display about page
 */
@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: [ './about.page.css' ]
})
export class AboutComponent implements OnInit {
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
