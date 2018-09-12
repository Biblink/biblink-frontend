import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { User } from '../../../core/interfaces/user';
import { Router } from '@angular/router';
import { EmailUserInterface } from '../../../core/interfaces/email-user.interface';

/**
 * Access to AOS instance
 */
declare const AOS: any;

/**
 * Sign in component to display sign in page
 */
@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.page.html',
    styleUrls: [ './sign-in.page.css' ]
})
export class SignInComponent implements OnInit {
    /**
     * value to keep track of browser
     */
    isBrowser: boolean;
    /**
     * value to keep track of incorrect password error
     */
    incorrectPassword = false;
    /**
     * value to keep track of different credential error
     */
    differentCredential = false;
    /**
     * value ti keep track of form data
     */
    emailSignInForm: FormGroup;
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
     * @param {Title} title Title dependency to change title of page
     * @param {AuthService} _auth Auth service dependency to track auth state
     * @param {FormBuilder} fb FormBuilder dependency to create reactive forms
     * @param {Router} router Router dependency to access router for navigation
     * @param {PLATFORM_ID} platformId Platform ID to check if client is in browser
     */
    constructor(public title: Title, private _auth: AuthService,
        private fb: FormBuilder, private router: Router,
        @Inject(PLATFORM_ID) platformId) {
        this.title.setTitle('Biblink | Sign In');
        this.isBrowser = isPlatformBrowser(platformId);
    }
    /**
     * Initializes component
     */
    ngOnInit() {
        if (this.isBrowser) {
            AOS.init({
                disable: 'mobile'
            });
        }
        this.createForm();
        this._auth.authState.subscribe((state) => {
            if (state !== undefined && state !== null) {
                setTimeout(() => {
                    this._auth.emailVerified().then((res) => {
                        if (res) {
                            this.router.navigateByUrl('/dashboard/home');
                        } else {
                            this.router.navigateByUrl('/verify-email');
                        }
                    });
                }, 500);
            }
        });
    }

    /**
     * Initializes sign in form
     */
    createForm(): void {
        this.emailSignInForm = this.fb.group({
            email: [ '', [ Validators.required, Validators.pattern(this.email_regex) ] ],
            password: [ '', Validators.required ]
        });
    }

    /**
     * Gets email from form
     */
    get email() {
        return this.emailSignInForm.get('email');
    }

    /**
     * Gets password from form
     */
    get password() {
        return this.emailSignInForm.get('password');
    }

    /**
     * Signs user in based on a given provider and associated data
     * @param {'email' | 'google' | 'facebook' | 'twitter'} provider Provider to log user in with
     * @param {EmailUserInterface} Data sign in data from email sign in
     */
    signIn(provider: 'email' | 'google' | 'facebook' | 'twitter', data: EmailUserInterface = null) {
        this.differentCredential = false;
        this._auth.userLogin(provider, data).then((res: User | Object) => {
            if (res instanceof User) {
                return;
            } else {
                if (res[ 'errorCode' ] === 'auth/wrong-password') {
                    this.incorrectPassword = true;
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
        this.incorrectPassword = false;
        this.differentCredential = false;
    }

    /**
     * Signs user in with email
     */
    signInWithEmail() {
        this.signIn('email', { email: this.email.value, password: this.password.value });
    }
}
