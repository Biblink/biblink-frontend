import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { User } from '../core/interfaces/user';
import { Router } from '@angular/router';

@Component({
    selector: 'app-get-started',
    templateUrl: './get-started.component.html',
    styleUrls: [ './get-started.component.css' ]
})
export class GetStartedComponent implements OnInit {
    emailInUse = false;
    differentCredential = false;
    emailSignupForm: FormGroup;
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

    constructor(public title: Title, private _auth: AuthService, private fb: FormBuilder, private router: Router) {
        this.title.setTitle('Biblya | Get Started');
    }

    ngOnInit(): void {
        this.createForm();
        // this._auth.logout();
        this._auth.authState.subscribe((state) => {
            if (state !== null) {
                this._auth.emailVerified.then((res) => {
                    if (res) {
                        this.router.navigateByUrl('/dashboard/home');
                    } else {
                        this.router.navigateByUrl('/verify-email');
                    }
                });
            }
        });
    }

    createForm(): void {
        this.emailSignupForm = this.fb.group({
            email: [ '', [ Validators.required, Validators.pattern(this.email_regex) ] ],
            password: [ '', Validators.required ],
            confirmPassword: [ '', Validators.required ],
            recaptchaVerification: [ null, Validators.required ]
        },
            {
                validator: GetStartedComponent.matchPassword
            });
    }

    get email() {
        return this.emailSignupForm.get('email');
    }

    get password() {
        return this.emailSignupForm.get('password');
    }

    get confirmPassword() {
        return this.emailSignupForm.get('confirmPassword');
    }

    get recaptchaVerification() {
        return this.emailSignupForm.get('recaptchaVerification');
    }

    signUp(provider, data = null) {
        this.differentCredential = false;
        this._auth.userSignup(provider, data).then((res: User | Object) => {
            if (res instanceof User) {
                console.log(res);
                console.log(res.email);
            } else {
                if (res[ 'errorCode' ] === 'auth/email-already-in-use') {
                    this.emailInUse = true;
                } else if (res[ 'errorCode' ] === 'auth/account-exists-with-different-credential') {
                    this.differentCredential = true;
                }
            }
        });
    }

    signUpWithEmail() {
        this.signUp('email', { email: this.email.value, password: this.password.value });
    }
}
