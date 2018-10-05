import { StudyDataService } from './../../services/study-data.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UserDataService } from '../../../core/services/user-data/user-data.service';
import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { AppComponent } from '../../../app.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { Observable } from '@firebase/util';
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
 * Study nav component to initialize study navbar
 */
@Component({
  selector: 'app-study-nav',
  templateUrl: './study-nav.component.html',
  styleUrls: [ './study-nav.component.css' ]
})
export class StudyNavComponent implements OnInit, OnDestroy {
  /**
   * Input to get title of study
   */
  @Input() title = '';
  /**
   * Input to get group ID of study
   */
  @Input() groupID = '';

  @Input() id = '';

  @Input() searchName = '';
  @Output() tab: EventEmitter<string> = new EventEmitter();
  /**
    * value to see if mobile menu is activated
    */
  activated = false;
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
     * value to keep track of form data
     */
  emailInviteForm: FormGroup;
  joinUrl = '';
  /**
   * Email regex
   */
  email_regex = new RegExp('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"' +
    '(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")' +
    '@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?' +
    '|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])' +
    '|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]' +
    '|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])');
  /**
   * whether or not to activate user modal
   */
  activateAddUserModal = false;
  /**
   * Current Email
   */
  currentEmail = '';
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
   * Initializes necessary dependency and does dependency injection
   * @param {AuthService} _auth Auth service dependency to track auth state
   * @param {Router} _router Router dependency to access router for navigation
   * @param {ToastrService} toastr Toastr service to display notifications
   * @param {UserDataService} _data UserData service dependency to get user profile image and notifications
   * @param {StudyDataService} study StudyData service dependency to get study data
   */
  constructor(private _auth: AuthService, private _router: Router, private toastr: ToastrService,
    private _data: UserDataService, private study: StudyDataService, private fb: FormBuilder,
    private _study: StudyDataService) {
  }
  /**
   * function to convert nav initialization to false as navigating to home page
   */
  toHome() {
    AppComponent.navInitialized = false;
  }
  /**
   * Initializes component
   */
  ngOnInit() {
    this.createForm();
    this.unreadCount.subscribe((length) => {
      $('span.badge').attr('data-badge', length);
    });
    this.userSubscription = this._data.userData.subscribe((user) => {
      if (user !== null) {
        this.imageUrl = user.data.profileImage;
        this.notifications = this.getNotifications();
      }
    });
    this._auth.authState.subscribe((state) => {
      this.isLoggedIn = !(state === null);
    });
    if (!AppComponent.navInitialized) {
      AOS.init();
      AppComponent.navInitialized = !AppComponent.navInitialized;
    }
  }
  /**
   * Destroys component when not used. Removes all current subscriptions
   */
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
  /**
   * Toggles Mobile Menu based on [activated]{@link StudyNavComponent#activated} variable
   */
  toggleMobileMenu() {
    this.activated = !this.activated;
    this.menuOpacity = this.activated ? 1 : 0;
    this.menuZ = this.activated ? 800 : -5;
    this.menuHeight = this.activated ? '100%' : '0';
    if (this.activated) {
      $('body').css('overflow', 'hidden');
      $('html').css('overflow', 'hidden');
    } else {
      $('body').css('overflow', 'visible');
      $('html').css('overflow', 'visible');
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
          if (notification['notification']['icon'] === null) {
            notification['notification']['icon'] = '/assets/images/feature-images/default-photo.png';
          }
          this.notificationIDs.push(notification[ 'id' ]);
          if (notification[ 'read' ] === undefined || notification[ 'read' ] !== true) {
            this.unreadCount.next(this.unreadCount.getValue() + 1);
          }
          this.study.getStudyData(notification[ 'notification' ][ 'studyID' ]).take(1).subscribe((value) => {
            notifications[ index ][ 'notification' ][ 'body' ] =
              notifications[ index ][ 'notification' ][ 'body' ] + ' in ' + value[ 'name' ];
          });
        });
        return notifications;
      })
    );
  }

  /**
   * Emit switch tab event to study on mobile
   * @param tab tab to switch to
   */
  switchTab(tab: string) {
    console.log('here');
    this.tab.emit(tab);
    this.toggleMobileMenu();
  }


  toDashboard() {
    this._router.navigateByUrl('/dashboard/home');
    this.toggleMobileMenu();
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

  activateUserModal() {
    this.createForm();
    this.activateAddUserModal = true;
    this.currentEmail = '';
    this.joinUrl = `https://biblink.io/join?info=${this.searchName};${this.groupID}`;
  }
  closeModal() {
    this.activateAddUserModal = false;
    this.currentEmail = '';
  }

  /**
     * Initializes sign up form
     */
  createForm(): void {
    this.emailInviteForm = this.fb.group({
      email: [ '', [ Validators.required, Validators.pattern(this.email_regex) ] ],
    });
  }

  inviteUser() {
    console.log(this.emailInviteForm);
    this._study.sendJoinEmail(this.emailInviteForm.value['email'], this.id);
    this.toastr.show(`Invite Email Sent to ${ this.emailInviteForm.value[ 'email' ] }`, 'Invite Email Sent');
    this.createForm();
  }

  copyToClipboard() {
    this.toastr.show('Link Copied to Clipboard');
  }
}
