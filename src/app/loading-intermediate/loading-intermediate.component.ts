import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
/**
 * Loading intermediate componet to display loading intermediate page
 */
@Component({
  selector: 'app-loading-intermediate',
  templateUrl: './loading-intermediate.component.html',
  styleUrls: [ './loading-intermediate.component.css' ]
})
export class LoadingIntermediateComponent implements OnInit, OnDestroy {
  /**
   * Route subscription to keep track of current route parameters
   */
  routeSubscription: Subscription = new Subscription();
  /**
     * Initializes necessary dependency and does dependency injection
     * @param {Router} _router Router dependency to access router for navigation
     * @param {ActivatedRoute} activatedRoute ActivatedRoute dependency to access router parameters
     */
  constructor(private _router: Router, private activatedRoute: ActivatedRoute) { }
  /**
   * Initializes component
   */
  ngOnInit() {
    this.routeSubscription = this.activatedRoute.queryParams.take(1).subscribe(params => {
      const path = params[ 'path' ];
      if (path) {
        this._router.navigateByUrl(path);
      }
    });
  }
  /**
   * Removes all subscriptions on destruction of component
   */
  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

}
