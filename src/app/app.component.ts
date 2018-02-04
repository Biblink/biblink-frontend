import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    static navInitialized = false;
    onHome = false;

    constructor(private _route: Router) {
        this._route.events.subscribe((event) => {
            if (this._route.url === '/') {
                this.onHome = true;
            } else {
                this.onHome = false;
            }
        });
    }

    ngOnInit() {
    }
}
