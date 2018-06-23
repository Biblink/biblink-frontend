import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { UserDataService } from '../../../core/services/user-data/user-data.service';
import { Angulartics2Module } from 'angulartics2';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
declare const $: any;
declare const AOS: any;

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: [ './home.page.css' ]
})
export class HomeComponent implements OnInit, OnDestroy {
    enhanced = false;
    imageUrl = '';
    isBrowser = false;
    isLoggedIn = false;
    isCurrent = true;
    activated = false;
    menuOpacity = 0;
    menuHeight = '0';
    menuZ = 0;
    init = [];

    routeSubscription: Subscription = new Subscription();

    constructor(private title: Title, private _auth: AuthService,
        @Inject(PLATFORM_ID) platformId: string,
        private _router: Router, private activatedRoute: ActivatedRoute, private _data: UserDataService, private afs: AngularFirestore) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.init = [];
        if (this.isBrowser) {
            const x = setInterval(() => {
                this.init.push(AOS.init({
                    disable: 'mobile'
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
        }, 1000);
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

    logout(): void {
        this._auth.logout().then(() => {
            this._router.navigateByUrl('/sign-in');
            localStorage.removeItem('user');
        });
    }

    ngOnDestroy() {
        this.init = [];
        this.routeSubscription.unsubscribe();
    }
}
