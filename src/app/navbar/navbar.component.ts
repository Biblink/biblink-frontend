import {Component, OnInit} from '@angular/core';
import {AppComponent} from '../app.component';

declare const AOS: any;
declare const $: any;

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
    activated = false;
    menuOpacity = 0;
    menuHeight = '0';
    menuZ = 0;
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

    toggleMobileMenu() {
        this.activated = !this.activated;
        this.menuOpacity = this.activated ? 1 : 0;
        this.menuZ = this.activated ? 800 : 0;
        this.menuHeight = this.activated ? '100%' : '0';
        if (this.activated) {
            $('body').css('overflow', 'hidden');
            $('html').css('overflow', 'hidden');
        } else {
            $('body').css('overflow', 'visible');
            $('html').css('overflow', 'visible');
        }
    }

}
