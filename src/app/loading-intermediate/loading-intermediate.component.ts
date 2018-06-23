import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-loading-intermediate',
  templateUrl: './loading-intermediate.component.html',
  styleUrls: [ './loading-intermediate.component.css' ]
})
export class LoadingIntermediateComponent implements OnInit, OnDestroy {
  routeSubscription: Subscription = new Subscription();
  constructor(private _router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.routeSubscription = this.activatedRoute.queryParams.take(1).subscribe(params => {
      const path = params[ 'path' ];
      if (path) {
        this._router.navigateByUrl(path);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

}
