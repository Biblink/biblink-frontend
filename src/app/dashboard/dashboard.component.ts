import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../user-data.service';
import { AuthService } from '../auth.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})
export class DashboardComponent implements OnInit {
  data = null;
  tab = 'studies';
  firstName = '';
  imageUrl = '';

  lastName = '';
  name = '';

  emailInUse = false;
  differentCredential = false;
  profileForm: FormGroup;
  email_regex = new RegExp('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"' +
    '(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")' +
    '@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?' +
    '|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])' +
    '|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]' +
    '|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])');

  static matchPassword(AC: AbstractControl) {
    const password = AC.get('password').value; // to get value in input tag
    const confirmPassword = AC.get('confirmPassword').value; // to get value in input tag
    if (password !== confirmPassword) {
      const required = AC.get('confirmPassword').getError('required');
      AC.get('confirmPassword').setErrors({ required: required, MatchPassword: true });
    } else {
      return null;
    }
  }
  constructor(private _auth: AuthService, private fb: FormBuilder, private _data: UserDataService, private toastr: ToastrService) { }

  ngOnInit() {
    this.createForm();
    this._data.userData.subscribe((res) => {
      this.data = res;
      if (res !== null) {
        this.name = res[ 'name' ];
        this.profileForm.patchValue({ firstName: res[ 'firstName' ], lastName: res[ 'lastName' ], email: res[ 'email' ] });
        this.imageUrl = res[ 'imageUrl' ];
      }
    });
  }

  updateUser(object) {
    return this._data.updateProfile(object);
  }
  updateName() {
    this.updateUser({ firstName: this.firstName, lastName: this.lastName, name: `${ this.firstName } ${ this.lastName }` });
  }

  switchTab(tabName: string) {
    this.tab = tabName;
  }

  updateProfile() {
    this.updateUser({ firstName: this.firstNameForm.value, lastName: this.lastNameForm.value, name: this.nameForm }).then(() => {
      this.toastr.show('Successfully Updated Your Profile', 'Successful Update');
    });
  }

  createForm(): void {
    this.profileForm = this.fb.group({
      firstName: [ '' ],
      lastName: [ '' ],
      email: [ '', [ Validators.pattern(this.email_regex) ] ],
      password: [ '' ],
      confirmPassword: [ '' ],
    },
      {
        validator: DashboardComponent.matchPassword
      });
  }

  get firstNameForm() {
    return this.profileForm.get('firstName');
  }

  get lastNameForm() {
    return this.profileForm.get('lastName');
  }

  get email() {
    return this.profileForm.get('email');
  }

  get nameForm() {
    return this.profileForm.get('firstName').value + ' ' + this.profileForm.get('lastName').value;
  }


  get password() {
    return this.profileForm.get('password');
  }

  get confirmPassword() {
    return this.profileForm.get('confirmPassword');
  }
}
