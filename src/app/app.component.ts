import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDataService } from './core/services/user-data/user-data.service';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { MessagingService } from './core/messaging/messaging.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit, OnDestroy {
    static navInitialized = false;
    private userIDSubscription: Subscription;
    private userSubscription: Subscription;
    onHome = false;

    constructor(
        private _route: Router,
        angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
        private msg: MessagingService,
        private toastr: ToastrService,
        private user: UserDataService
    ) { }

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
                    if (user !== null) {
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
    ngOnDestroy() {
        this.userIDSubscription.unsubscribe();
        this.userSubscription.unsubscribe();
    }
}
