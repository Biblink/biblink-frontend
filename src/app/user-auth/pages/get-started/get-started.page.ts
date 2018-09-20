import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { User } from '../../../core/interfaces/user';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
/**
 * Get started component to display get started page
 */
@Component({
    selector: 'app-get-started',
    templateUrl: './get-started.page.html',
    styleUrls: [ './get-started.page.css' ]
})
export class GetStartedComponent implements OnInit, OnDestroy {
    authSubscription: Subscription;
    info: any;
    redirect: any;
    finishedNavigating = false;
    /**
     * value to keep track if email is already in use
     */
    emailInUse = false;
    /**
     * value to keep track of different credential error
     */
    differentCredential = false;
    /**
     * value to keep track of form data
     */
    emailSignupForm: FormGroup;
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
     * Checks if passwords match in form
     * @param {AbstractControl} AC control to check if passwords are matching
     */
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
    /**
     * Initializes necessary dependency and does dependency injection
     * @param {Title} title Title dependency to change title of page
     * @param {AuthService} _auth Auth service dependency to track auth state
     * @param {FormBuilder} fb FormBuilder dependency to create reactive forms
     * @param {Router} router Router dependency to access router for navigation
     */
    constructor(public title: Title, private _auth: AuthService, private fb: FormBuilder, private router: Router,
        private route: ActivatedRoute) {
        this.title.setTitle('Biblink | Get Started');
    }
    /**
     * Initializes component
     */
    ngOnInit(): void {
        this.createForm();
        this.route.queryParams.subscribe(param => {
          if (param['redirect'] !== undefined) {
              this.redirect = param[ 'redirect' ];
              this.info = param[ 'info' ];
          }
        });
        // this._auth.logout();
        this.authSubscription = this._auth.authState.subscribe((state) => {
            if (state !== undefined && state !== null) {
                if (this.redirect) {
                    console.log('here');
                    this.router.navigateByUrl(`/${ this.redirect }?info=${this.info}`);
                } else {
                    console.log('here2');
                    this._auth.emailVerified().then((res) => {
                        if (res && res !== null) {
                            this.router.navigateByUrl('/dashboard/home');
                        } else {
                            this.router.navigateByUrl('/verify-email');
                        }
                    });
                }
            }
        });
    }

    ngOnDestroy() {
        this.authSubscription.unsubscribe();
    }
    /**
     * Initializes sign up form
     */
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
    /**
     * Gets email from form
     */
    get email() {
        return this.emailSignupForm.get('email');
    }
    /**
     * Gets password from form
     */
    get password() {
        return this.emailSignupForm.get('password');
    }
    /**
     * Gets confirm password from form
     */
    get confirmPassword() {
        return this.emailSignupForm.get('confirmPassword');
    }
    /**
     * Gets recaptcha verification from form
     */
    get recaptchaVerification() {
        return this.emailSignupForm.get('recaptchaVerification');
    }
    /**
     * Signs user up based on a given provider and associated data
     * @param {'email' | 'google' | 'facebook' | 'twitter'} provider Provider to log user in with
     * @param {EmailUserInterface} Data sign in data from email sign in
     */
    signUp(provider, data = null) {
        this.differentCredential = false;
        this._auth.userSignup(provider, data).then((res: User | Object) => {
            if (res instanceof User) {
                if (this.redirect) {
                    console.log('here');
                    this.router.navigateByUrl(`/${ this.redirect }?info=${ this.info }`);
                } else {
                    console.log('here in verify email for some reason');
                    this.router.navigateByUrl('/verify-email');
                }
            } else {
                if (res[ 'errorCode' ] === 'auth/email-already-in-use') {
                    this.emailInUse = true;
                } else if (res[ 'errorCode' ] === 'auth/account-exists-with-different-credential') {
                    this.differentCredential = true;
                }
            }
        });
    }
    /**
     * Resets all errors
     */
    resetErrors() {
        this.emailInUse = false;
        this.differentCredential = false;
    }
    /**
     * Signs user in with email
     */
    signUpWithEmail() {
        this.signUp('email', { email: this.email.value, password: this.password.value });
    }
}
