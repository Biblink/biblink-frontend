import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDataService } from './core/services/user-data/user-data.service';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { MessagingService } from './core/messaging/messaging.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
/**
 * App component to create parent component of which all sub components follow
 * creates initial app routing in html
 */
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit, OnDestroy {
    /**
     * value to check if navbar has been initialized
     */
    static navInitialized = false;
    /**
     * variable to hold userID subscription
     */
    private userIDSubscription: Subscription = new Subscription();
    /**
     * variable to hold user data subscription
     */
    private userSubscription: Subscription = new Subscription();
    /**
     * value to see if user is on home page
     */
    onHome = false;
    /**
     * Initializes necessary dependency and does dependency injection
     * @param {Router} _route Router dependency to access router for navigation
     * @param {Angulartics2GoogleAnalytics} angulartics2GoogleAnalytics Analytics dependency to access analytics throughout app
     * @param {MessagingService} msg Messaging service dependency to request user for messaging permissions
     * @param {ToastrService} toastr Toastr service to display notifications
     * @param {UserDataService} user UserData service dependency to set firebase cloud messaging
     */
    constructor(
        private _route: Router,
        angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
        private msg: MessagingService,
        private toastr: ToastrService,
        private user: UserDataService
    ) { }
    /**
     * Initializes component
     */
    ngOnInit() {
        this._route.events.subscribe((event) => {
            if (this._route.url === '/' || this._route.url.indexOf('studies') !== -1) {
                this.onHome = true;
            } else {
                this.onHome = false;
            }
        });
        this.userIDSubscription = this.user.userID.subscribe((uid) => {
            if (uid !== '') {
                this.userSubscription = this.user.userData.subscribe((user) => {
                    if (user !== null && user.email !== '') {
                        this.msg.getPermission(user, uid);
                        this.msg.monitorRefresh(user, uid);
                        this.msg.receiveMessages();
                    }
                });
            }
        });
        this.msg.currentMessage.subscribe((message) => {

            const notif = message[ 'notification' ];
            if (this._route.url.split('/').pop() !== message[ 'data' ][ 'gcm.notification.studyID' ]) {
                this.toastr.show(
                    `
                        <img src="${ notif[ 'icon' ] }" class="notif-image" width="40px" height="40px" style="border-radius: 50%">
                        ${ notif[ 'body' ] }
                    `,
                    notif.title,
                    { enableHtml: true }
                );
            }
        });
    }
    /**
     * Destroys component when not used. Unsubscribes from all subscriptions
     */
    ngOnDestroy() {
        this.userIDSubscription.unsubscribe();
        this.userSubscription.unsubscribe();
    }
}
