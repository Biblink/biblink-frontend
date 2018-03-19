import { UserDataService } from './../user-data.service';
import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

declare const AOS: any;
declare const $: any;

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: [ './navbar.component.css' ]
})
export class NavbarComponent implements OnInit {
    activated = false;
    menuOpacity = 0;
    menuHeight = '0';
    menuZ = 0;
    isLoggedIn: boolean = null;
    imageUrl = '';

    constructor(private _auth: AuthService, private _router: Router, private _data: UserDataService) {
    }

    toHome() {
        AppComponent.navInitialized = false;
    }

    ngOnInit() {

        this._data.userData.subscribe((user) => {
            if (user !== null) {
                this.imageUrl = user.data.profileImage;
            }
        });
        this._auth.authState.subscribe((state) => {
            this.isLoggedIn = !(state === null);
        });

        if (!AppComponent.navInitialized) {
            AOS.init();
            AppComponent.navInitialized = !AppComponent.navInitialized;
        }
        // Initial scroll position
        let scrollState = 0;

        // Store navbar classes
        const navClasses = document.getElementById('navbar-main').classList;

        // returns current scroll position
        const scrollTop = function () {
            return window.scrollY;
        };

        // Primary scroll event function
        const scrollDetect = function (home, down, up) {
            // Current scroll position
            const currentScroll = scrollTop();
            if (scrollTop() === 0) {
                home();
            } else if (currentScroll > scrollState) {
                down();
            } else {
                up();
            }
            // Set previous scroll position
            scrollState = scrollTop();
        };

        function homeAction() {
        }

        function downAction() {
            navClasses.remove('open');
            navClasses.add('collapse');
        }

        function upAction() {
            navClasses.remove('collapse');
            navClasses.add('open');
        }

        window.addEventListener('scroll', function () {
            scrollDetect(homeAction, downAction, upAction);
        });
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

    logout(): void {
        this._auth.logout().then(() => {
            this._router.navigateByUrl('/sign-in');
        });
    }
}
