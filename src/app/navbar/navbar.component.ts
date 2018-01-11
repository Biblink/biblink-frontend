import {Component, OnInit} from '@angular/core';
import {AppComponent} from '../app.component';

declare const AOS: any;

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

    constructor() {
    }

    toHome() {
        AppComponent.navInitialized = false;
    }

    ngOnInit() {
        if (!AppComponent.navInitialized) {
            AOS.init();
            AppComponent.navInitialized = !AppComponent.navInitialized;
        }
    }

}
