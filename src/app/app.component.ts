import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDataService } from './user-data.service';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit {
    static navInitialized = false;
    onHome = false;

    constructor(private _route: Router, private _userData: UserDataService, angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) {
        this._route.events.subscribe((event) => {
            if (this._route.url === '/' || this._route.url.indexOf('studies') !== -1) {
                this.onHome = true;
            } else {
                this.onHome = false;
            }
        });
    }

    ngOnInit() {
    }
}
