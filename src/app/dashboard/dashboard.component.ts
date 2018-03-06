import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../user-data.service';
import { AuthService } from '../auth.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { User } from '../interfaces/user';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { GroupDataService } from '../group-data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})
export class DashboardComponent implements OnInit {
  activateEditImage = false;
  hasNoGroups = false;
  activateJoinGroup = false;
  activateCreateStudy = false;
  studyGroup = { name: '', uniqueID: '' };
  defaultGroup = { name: '', uniqueID: '' };
  newDefaultGroup = { name: '', leader: '', description: '', bannerImage: '', profileImage: '' };
  newGroup = { name: '', leader: '', description: '', bannerImage: '', profileImage: '' };
  noPassword = false;
  isVerified = false;
  data = null;
  tab = 'studies';
  imageUrl = '';

  user: User = new User('', '', '', { profileImage: '', bio: '', shortDescription: '' });
  name = '';

  emailInUse = false;
  differentCredential = false;
  securityForm: FormGroup;
  email_regex = new RegExp('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"' +
    '(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")' +
    '@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?' +
    '|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])' +
    '|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]' +
    '|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])');

  constructor(
    private _auth: AuthService,
    private fb: FormBuilder,
    private _data: UserDataService,
    private afAuth: AngularFireAuth,
    private groupData: GroupDataService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.createForm();
    this._data.userData.subscribe((res) => {
      this.data = res;
      if (res !== null) {
        this.user = new User(res[ 'firstName' ], res[ 'lastName' ], res[ 'email' ], res[ 'data' ]);
        this.imageUrl = this.user.data.profileImage;
        this.name = this.user.firstName + ' ' + this.user.lastName;
        this.securityForm.patchValue({ 'email': res[ 'email' ] });
      }
    });
    this.groupData.groups.subscribe((groups) => {
      if (groups.length === 0) {
        this.hasNoGroups = true;
      } else {
        this.hasNoGroups = false;
      }
    });
  }

  updateUser(user: User) {
    return this._data.updateProfile(user);
  }

  updateImage() {
    console.log(this.imageUrl);
    this.user.data.profileImage = this.imageUrl;
    this.updateUser(this.user).then(() => {
      this.toastr.show('Successfully Updated Your Profile Image', 'Successful Update of Profile Image');
    });
  }
  switchTab(tabName: string) {
    this.tab = tabName;
  }

  getDownloadUrl(event) {
    this.imageUrl = event;
  }


  updateProfile(name = false) {
    this.updateUser(this.user).then(() => {
      if (name) {
        this.toastr.show('Successfully Updated Your Name', 'Successful Update of Name');
      } else {
        this.toastr.show('Successfully Updated Your Profile', 'Successful Update');
      }
    });
  }

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

  get email() {
    return this.securityForm.get('email');
  }
  get oldPassword() {
    return this.securityForm.get('oldPassword');
  }
  get newPassword() {
    return this.securityForm.get('newPassword');
  }
  get confirmPassword() {
    return this.securityForm.get('confirmPassword');
  }

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

  joinGroup() {
    console.log('joining group');
  }

  createStudy() {
    this.groupData.createGroup(this.newGroup.name,
      {
        bannerImage: this.newGroup.bannerImage,
        profileImage: this.newGroup.profileImage,
        description: this.newGroup.description,
        leader: this.user.name
      }).then((firebaseID) => {
        this._data.addGroup(firebaseID, 'leader').then(() => {
          this.toastr.show('Successfully Created New Group: ' + this.newGroup.name, 'Created New Group');
        }).catch(err => console.error(err));
      });
  }

  getDownloadUrlStudy(event, type) {
    if (type === 'banner') {
      this.newGroup.bannerImage = event;
    } else if (type === 'study-profile') {
      this.newGroup.profileImage = event;
    }
  }

}


export class CustomValidators {

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
  static oldPassword(afAuth: AngularFireAuth) {
    return (control: AbstractControl) => {
      console.log('here');
      const password = control.get('oldPassword').value;
    };
  }
}
