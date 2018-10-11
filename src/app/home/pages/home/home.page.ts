import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { UserDataService } from '../../../core/services/user-data/user-data.service';
import { Angulartics2Module } from 'angulartics2';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
/**
 * access to jquery instance
 */
declare const $: any;
/**
 * access to AOS instance
 */
declare const AOS: any;

/**
 * Home component to display home page
 */
@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: [ './home.page.css' ]
})
export class HomeComponent implements OnInit, OnDestroy {
    /**
     * value to keep track of image enhancement
     */
    enhanced = false;
    /**
     * value of user's profile image URL
     */
    imageUrl = '';
    /**
     * value to keep track of browser
     */
    isBrowser = false;
    /**
     * value to keep track of login status
     */
    isLoggedIn = false;
    /**
     * value to keep track of mobile menu activation
     */
    activated = false;
    /**
     * value of opacity of menu
     */
    menuOpacity = 0;
    activateVideoModal = false;
    /**
     * value of menu height
     */
    menuHeight = '0';
    /**
     * value of z-index of menu
     */
    menuZ = 0;
    /**
     * array to hold AOS init values
     */
    init = [];
    /**
     * Initializes necessary dependency and does dependency injection
     * @param {Title} title Title dependency to change title of page
     * @param {AuthService} _auth Auth service dependency to track auth state
     * @param {PLATFORM_ID} platformId Platform ID to check if client is in browser
     * @param {Router} _router Router dependency to access router for navigation
     * @param {UserDataService} _data UserData service dependency to get user profile image
     */
    constructor(private title: Title, private _auth: AuthService,
        @Inject(PLATFORM_ID) platformId: string,
        private _router: Router, private _data: UserDataService) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    /**
     * Initializes component
     */
    ngOnInit() {
        this.init = [];
        if (this.isBrowser) {
            const x = setInterval(() => {
                this.init.push(AOS.init({
                    disable: 'mobile',
                    once: true,
                    mirror: true
                }));
                if (this.init.length >= 2) {
                    console.log('clearing interval...');
                    clearInterval(x);
                }
            }, 1500);
        }
        this.title.setTitle('Biblink | Home');
        this._data.userData.subscribe((user) => {
            if (user !== null) {
                this.imageUrl = user.data.profileImage;
            }
        });
        this._auth.authState.subscribe((state) => {
            this.isLoggedIn = !(state === null);
        });
        setTimeout(() => {
            this.enhanced = true;
        }, 300);
    }

    /**
     * Toggles Mobile Menu based on [activated]{@link HomeComponent#activated} variable
     */
    toggleMobileMenu() {
        this.activated = !this.activated;
        this.menuOpacity = this.activated ? 1 : 0;
        this.menuZ = this.activated ? 800 : 0;
        this.menuHeight = this.activated ? '100%' : '0';
        if (this.isBrowser) {
            if (this.activated) {
                $('body').css('overflow', 'hidden');
                $('html').css('overflow', 'hidden');
            } else {
                $('body').css('overflow', 'visible');
                $('html').css('overflow', 'visible');
            }
        }
    }

    /**
     * Function to log user out
     */
    logout(): void {
        this._auth.logout().then(() => {
            this._router.navigateByUrl('/sign-in');
            localStorage.removeItem('user');
        });
    }

    openVideoModal() {
        this.activateVideoModal = true;
    }

    /**
     * Destroys component when not used. Resets init array
     */
    ngOnDestroy() {
        this.init = [];
    }
}
