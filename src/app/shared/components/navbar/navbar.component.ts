import { isPlatformBrowser } from '@angular/common';
import { UserDataService } from '../../../core/services/user-data/user-data.service';
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { tap, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
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
 * Navbar component to initialize navbar
 */
@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: [ './navbar.component.css' ]
})
export class NavbarComponent implements OnInit, OnDestroy {
    redirectSignIn: string;
    /**
     * value to see if mobile menu is activated
     */
    activated = false;
    /**
     * Whether or not to use redirect sign in button
     */
    changeButton = true;
    /**
     * variable to hold list of notifications
     */
    notifications;
    /**
     * BehaviorSubject to hold the number of unread notifications
     */
    unreadCount = new BehaviorSubject(0);
    /**
     * Subscription to hold user data
     */
    userSubscription: Subscription;
    /**
     * list of notification IDs
     */
    notificationIDs = [];
    /**
     * value to hold menu opacity
     */
    menuOpacity = 0;
    /**
     * value to hold menu height
     */
    menuHeight = '0';
    /**
     * value to hold menu z-index
     */
    menuZ = 0;
    /**
     * value to see whether or not user is logged in
     */
    isLoggedIn: boolean = null;
    /**
     * value to hold user profile image url
     */
    imageUrl = '';
    /**
     * value to see if current client is in the browser
     */
    isBrowser = false;

    /**
      * Initializes necessary dependency and does dependency injection
      * @param {AuthService} _auth Auth service dependency to track auth state
      * @param {Router} _router Router dependency to access router for navigation
      * @param {UserDataService} _data UserData service dependency to get user profile image and notifications
      * @param {ToastrService} toastr Toastr service to display notifications
      * @param {PLATFORM_ID} platformId Platform ID to check if client is in browser
      */
    constructor(private _auth: AuthService,
        private _router: Router,
        private route: ActivatedRoute,
        private _data: UserDataService,
        private toastr: ToastrService,
        @Inject(PLATFORM_ID) platformId: string,
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    /**
     * function to convert nav initialization to false as navigating to home page
     */
    toHome() {
        AppComponent.navInitialized = false;
    }
    /**
     * Destroys component when not used. Removes all current subscriptions
     */
    ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
    }

    /**
     * Initializes component
     */
    ngOnInit() {
        if (window) {
            const url = window.location.href;
            if (url.indexOf('join') !== -1) {
                const info = url.split('info=')[ 1 ];
                this.changeButton = true;
                this.redirectSignIn = `/sign-in?redirect=join&info=${ info }`;
            }
        }
        this.userSubscription = this._data.userData.subscribe((user) => {
            if (user !== null) {
                this.imageUrl = user.data.profileImage;
                this.notifications = this.getNotifications();
            }
        });
        this._auth.authState.subscribe((state) => {
            this.isLoggedIn = !(state === null);
        });

        // Initial scroll position
        let scrollState = 0;
        function homeAction(val) {
        }

        function downAction(val: DOMTokenList) {
            val.remove('open');
            val.add('collapse');
        }

        function upAction(val: DOMTokenList) {
            val.remove('collapse');
            val.add('open');
        }
        if (this.isBrowser) {
            if (!AppComponent.navInitialized) {
                AOS.init();
                AppComponent.navInitialized = !AppComponent.navInitialized;
            }
            this.unreadCount.subscribe((length) => {
                $('span.badge').attr('data-badge', length);
            });
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
                    home(navClasses);
                } else if (currentScroll > scrollState) {
                    down(navClasses);
                } else {
                    up(navClasses);
                }
                // Set previous scroll position
                scrollState = scrollTop();
            };



            window.addEventListener('scroll', function () {
                scrollDetect(homeAction, downAction, upAction);
            });
        }
    }

    navigateWithRedirect() {
        this._router.navigateByUrl(this.redirectSignIn);
    }
    /**
     * Toggles Mobile Menu based on [activated]{@link NavbarComponent#activated} variable
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
     * Gets current user's list of notifications
     */
    getNotifications() {
        return this._data.getNotifications().pipe(
            map((notifications) => {
                this.unreadCount.next(0);
                this.notificationIDs = [];
                notifications.forEach((notification, index) => {
                    this.notificationIDs.push(notification[ 'id' ]);
                    if (notification[ 'read' ] === undefined || notification[ 'read' ] !== true) {
                        this.unreadCount.next(this.unreadCount.getValue() + 1);
                    }
                    this._data.getStudyData(notification[ 'notification' ][ 'studyID' ]).take(1).subscribe((value) => {
                        notifications[ index ][ 'notification' ][ 'body' ] =
                            notifications[ index ][ 'notification' ][ 'body' ] + ' in ' + value[ 'name' ];
                    });
                });
                return notifications;
            })
        );
    }
    /**
     * Clears list of notifications
     */
    clearNotifications() {
        this._data.clearNotifications(this.notificationIDs).then(() => {
            this.toastr.show('Cleared Your Notifications', 'Cleared Notifications');
        });
    }
    /**
     * Navigates to study based on notification
     * @param {string} notifID notification ID
     * @param {string} studyID study ID
     */
    navigateToStudy(notifID: string, studyID: string) {
        this._router.navigateByUrl(`/dashboard/studies/study/${ studyID }`).then(() => {
            this._data.markNotificationAsRead(notifID);
        });
    }
    /**
     * Logs current user out
     */
    logout(): void {
        this._auth.logout().then(() => {
            this._router.navigateByUrl('/sign-in');
            localStorage.removeItem('user');
        });
    }
}
