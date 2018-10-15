import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserDataService } from '../../../core/services/user-data/user-data.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { User } from '../../../core/interfaces/user';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { StudyDataService } from '../../../study/services/study-data.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

/**
 * Dashboard component to display dashboard page
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: [ './dashboard.page.css' ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  /**
   * Suscription to hold auth state
   */
  authStateSubscription: Subscription;
  /**
   * Suscription to hold user data
   */
  userDataSubscription: Subscription;
  /**
   * Suscription to hold group data
   */
  groupDataSubscription: Subscription;
  // modal activations
  /**
   * value to hold edit image modal activation
   */
  activateEditImage = false;
  /**
   * value to hold join study modal activation
   */
  activateJoinStudy = false;
  /**
   * value to hold create study modal activation
   */
  activateCreateStudy = false;

  // group variables
  /**
   * value to see whether or not use has groups
   */
  hasNoGroups = false;
  /**
   * BehaviorSubject to keep current loading status
   */
  isLoading: BehaviorSubject<boolean> = new BehaviorSubject(true);
  /**
   * value to see whether or not to display user data
   */
  showResults = false;
  /**
   * default study group data, used to initialize join study group inputs
   * See [resetJoinStudy]{@link DashboardComponent#resetJoinStudy}
   */
  studyGroup = { name: '', uniqueID: '' };
  /**
   * creates default new study group data, used to initialze create new study group inputs
   * See [createStudy]{@link DashbaordComponent#createStudy}
   */
  defaultNewStudy = { name: '', leader: '', description: '', bannerImage: '', profileImage: '' };
  /**
   * value to hold data from form of createstudy group
   * See [createStudy]{@link DashbaordComponent#createStudy}
   */
  newStudy = { name: '', leader: '', description: '', bannerImage: '', profileImage: '' };


  // user profile variables
  /**
   * value to see whether or not user has a password
   */
  noPassword = false;
  /**
   * value to see whether or not user is verified
   */
  isVerified = false;
  /**
   * array listing user's studies
   */
  studies = [];
  /**
   * value to hold user's data
   */
  data = null;
  /**
   * value to hold current tab (either studies or profile)
   */
  tab = 'studies';
  /**
   * value to hold user's profile image URL
   */
  imageUrl = '';
  /**
   * value to get user data as a User object
   */
  user: User = new User('', '', '', { profileImage: '', bio: '', shortDescription: '' });
  /**
   * value to hold user's name
   */
  name = '';

  // form variabless
  /**
   * variable to hold security form data
   */
  securityForm: FormGroup;
  /**
   * regular expression for email check
   */
  email_regex = new RegExp('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"' +
    '(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")' +
    '@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?' +
    '|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])' +
    '|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]' +
    '|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])');


  /**
   * Initializes necessary dependency and does dependency injection
   * @param {Title} title Title dependency to change title of pages
   * @param {AuthService} _auth Auth service dependency to track auth state
   * @param {FormBuilder} fb FormBuilder dependency to create reactive forms
   * @param {UserDataService} _data UserData service dependency to get user data
   * @param {AngularFireAuth} afAuth AngularFireAuth dependency to access authentication
   * @param {Router} _router Router dependency to access router for navigations
   * @param {StudyDataService} groupData Study data service dependency to get study data
   * @param {ToastrService} toastr Toastr service to display notifications
   */
  constructor(
    private title: Title,
    private _auth: AuthService,
    private fb: FormBuilder,
    private _data: UserDataService,
    private afAuth: AngularFireAuth,
    private _router: Router,
    private groupData: StudyDataService,
    private toastr: ToastrService
  ) { }
  /**
   * Initializes component
   */
  ngOnInit() {
    this.title.setTitle('Your Dashboard');
    this.isLoading.next(true);
    this.authStateSubscription = this._auth.authState.subscribe((res) => {
      if (res !== undefined) {
        console.log(res);
        if (res === null) {
          console.log('redirecting back to sign in');
          setTimeout(() => this._router.navigateByUrl('/sign-in'), 1000);
        } else if (!res.emailVerified) {
          this._router.navigateByUrl('/verify-email');
        }
      }
    });
    this.createForm();
    this.userDataSubscription = this._data.userData.subscribe((res) => {
      this.data = res;
      if (res !== null && (res.email !== null && res.email !== '')) {
        this.isLoading.next(false);
        this.showResults = true;
        this.user = new User(res[ 'firstName' ], res[ 'lastName' ], res[ 'email' ], res[ 'data' ]);
        this.imageUrl = this.user.data.profileImage;
        this.name = this.user.firstName + ' ' + this.user.lastName;
        this.securityForm.patchValue({ 'email': res[ 'email' ] });

      }
    });
    this.groupDataSubscription = this.groupData.studies.subscribe((groups) => {
      if (groups.length === 0) {
        this.hasNoGroups = true;
      } else {
        this.hasNoGroups = false;
        this.studies = groups;
      }
    });
  }
  /**
   * Destroys component when not used. Removes all current subscriptions
   */
  ngOnDestroy() {
    this.userDataSubscription.unsubscribe();
    this.groupDataSubscription.unsubscribe();
    this.authStateSubscription.unsubscribe();
  }
  /**
   * Resetscurrent join study form data
   */
  resetJoinStudy() {
    this.studyGroup = { name: '', uniqueID: '' };
  }
  /**
   * Updates user data
   * @param {User} user User data to update
   */
  updateUser(user: User) {
    return this._data.updateProfile(user);
  }
  /**
   * Updates user's profile image
   */

  updateImage() {
    this.user.data.profileImage = this.imageUrl;
    this.updateUser(this.user).then(() => {
      this.toastr.show('Successfully Updated Your Profile Image', 'Successful Update of Profile Image');
    });
  }
  /**
   * Changes current tab
   * @param {string} tabName Name of tab
   */
  switchTab(tabName: string) {
    this.tab = tabName;
  }
  /**
   * Gets current download url and saves it to (imageUrl){@link DashboardComponent#imageUrl}
   * @param event current download url
   */
  getDownloadUrl(event) {
    this.imageUrl = event;
  }

  /**
   * Updates a user's proifle and displays a notification
   * @param name whether or not user is updating a name
   */
  updateProfile(name = false) {
    this.updateUser(this.user).then(() => {
      if (name) {
        this.toastr.show('Successfully Updated Your Name', 'Successful Update of Name');
      } else {
        this.toastr.show('Successfully Updated Your Profile', 'Successful Update');
      }
    });
  }
  /**
   * Creates security form
   */
  createForm(): void {
    this.securityForm = this.fb.group({
      email: [ '', [ Validators.pattern(this.email_regex), Validators.required ] ],
      oldPassword: [ '', Validators.required ],
      newPassword: [ '' ],
      confirmPassword: [ '' ],
    },
      {
        validator: CustomValidators.matchPassword
      });

  }
  /**
   * Gets email from form
   */
  get email() {
    return this.securityForm.get('email');
  }
  /**
   * Gets password from form
   */
  get oldPassword() {
    return this.securityForm.get('oldPassword');
  }
  /**
   * Gets new password from form
   */
  get newPassword() {
    return this.securityForm.get('newPassword');
  }
  /**
   * Gets confirm password from form
   */
  get confirmPassword() {
    return this.securityForm.get('confirmPassword');
  }
  /**
   * Checks password to access security form
   */
  checkPassword() {
    if (this.afAuth.auth.currentUser.providerId !== 'firebase') {
      this.isVerified = true;
      this.noPassword = true;
      this.oldPassword.setValue('');
      return null;
    }
    return this.afAuth.auth.currentUser.reauthenticateWithCredential(
      firebase.auth.EmailAuthProvider.credential(this.afAuth.auth.currentUser.email, this.oldPassword.value)
    ).then(() => {
      this.isVerified = true;
      return null;
    }).catch((err) => {
      console.log(err);
      const required = this.oldPassword.getError('required');
      return this.oldPassword.setErrors({ required: required, incorrectPassword: true });
    });
  }

  /**
   * Updates security info based on user input
   */
  updateSecurityInfo() {
    if (this.email.value !== this.afAuth.auth.currentUser.email) {
      this._auth.updateEmail(this.email.value).then((res) => {
        if (res === 'success') {
          this.user.email = this.email.value;
          this.updateUser(this.user).then(() => {
            this.toastr.show('Successfully Updated Your Email', 'Successful Update of Email');
          });
        }
      });
    }
    if (this.newPassword.value.trim() !== '') {
      this._auth.updatePassword(this.newPassword.value).then((res) => {
        if (res === 'success') {
          this.toastr.show('Successfully Updated Your Password', 'Successful Update of Password');
          const email = this.email.value;
          const password = this.newPassword.value;
          this.securityForm.reset();
          this.securityForm.patchValue({ 'email': email, 'oldPassword': password });
        }
      });
    }
  }
  /**
   * Joins study based on form data in (joinStudy){@link DashboardComponent#joinStudy}
   */
  joinStudy() {
    const name = this.studyGroup.name
      .replace(/[\s\p{P}(?<!')]/g, '')
      .toLowerCase();
    const joinStudy = this.groupData.joinStudy(name, parseInt(this.studyGroup.uniqueID, 10)).subscribe((res) => {
      const groupName = res[ 0 ].payload.doc.data()[ 'name' ];
      const groupID = res[ 0 ].payload.doc.id;
      this.groupData.addMember(groupID, this._data.userID.getValue()).then((test) => {
        this._data.addStudy(groupID, 'member').then(() => {
          this.toastr.show(`Added You to ${ groupName }`, 'Successfully Added To Group');
        });
      }).catch((reason) => {
        if (reason === 'already added') {
          this.toastr.show(`You are already part of ${ groupName }`, 'Already Added');
        } else {
          this.toastr.show(`Study ${ groupName } was not found`, 'Study Not Found');
        }
      });
    });
  }
  /**
   * Creates study based on form data provided in (newStudy){@link DashbaordComponent#newStudy}
   */
  createStudy() {
    this.groupData.createStudy(this.newStudy.name, this.afAuth.auth.currentUser.uid,
      {
        bannerImage: this.newStudy.bannerImage,
        profileImage: this.newStudy.profileImage,
        description: this.newStudy.description,
        leader: this.user.name
      }).then((firebaseID) => {
        this._data.addStudy(firebaseID, 'leader').then(() => {
          this.toastr.show('Successfully Created Your New Study', 'Created New Study');
          this.newStudy = this.defaultNewStudy;
        }).catch(err => console.error(err));
      });
  }

  /**
   * opens study based on id
   * @param id study id
   */
  openStudy(id) {
    this._router.navigateByUrl(`/dashboard/studies/study/${ id }`);
  }
  /**
   * Gets download url during creation of study
   * @param event image (banner or profile)
   * @param type type of image
   */
  getDownloadUrlStudy(event, type) {
    if (type === 'banner') {
      this.newStudy.bannerImage = event;
    } else if (type === 'study-profile') {
      this.newStudy.profileImage = event;
    }
  }

  /**
   * Capitalizes string
   * @param str string to capitalize
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
  }

}

/**
 * Custom validators for security form
 */
export class CustomValidators {
  /**
   * Checks if passwords match
   * @param {AbstractControl} AC control to check for matched password
   */
  static matchPassword(AC: AbstractControl) {
    const password = AC.get('newPassword').value; // to get value in input tag
    const confirmPassword = AC.get('confirmPassword').value; // to get value in input tag
    if (password !== confirmPassword) {
      const required = AC.get('confirmPassword').getError('required');
      AC.get('confirmPassword').setErrors({ required: required, MatchPassword: true });
    } else {
      return null;
    }
  }
}
