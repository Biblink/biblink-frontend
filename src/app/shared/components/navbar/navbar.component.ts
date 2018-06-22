import { isPlatformBrowser } from '@angular/common';
import { UserDataService } from '../../../core/services/user-data/user-data.service';
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { tap, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

declare const $: any;
declare const AOS: any;

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: [ './navbar.component.css' ]
})
export class NavbarComponent implements OnInit, OnDestroy {
    activated = false;
    notifications;
    unreadCount = new BehaviorSubject(0);
    userSubscription: Subscription;
    notificationIDs = [];
    menuOpacity = 0;
    menuHeight = '0';
    menuZ = 0;
    isLoggedIn: boolean = null;
    imageUrl = '';
    isBrowser = false;

    constructor(private _auth: AuthService,
        private _router: Router,
        private _data: UserDataService,
        private toastr: ToastrService,
        @Inject(PLATFORM_ID) platformId: string,
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    toHome() {
        AppComponent.navInitialized = false;
    }

    ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
    }


    ngOnInit() {

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

    clearNotifications() {
        this._data.clearNotifications(this.notificationIDs).then(() => {
            this.toastr.show('Cleared Your Notifications', 'Cleared Notifications');
        });
    }
    navigateToStudy(notifID: string, studyID: string) {
        this._router.navigateByUrl(`/dashboard/studies/study/${ studyID }`).then(() => {
            this._data.markNotificationAsRead(notifID);
        });
    }

    logout(): void {
        this._auth.logout().then(() => {
            this._router.navigateByUrl('/sign-in');
            localStorage.removeItem('user');
        });
    }
}
