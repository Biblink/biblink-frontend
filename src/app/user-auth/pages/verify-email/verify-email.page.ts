import { AuthService } from './../../../core/services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

/**
 * Verify email component to display verify email page
 */
@Component({
    selector: 'app-verify-email',
    templateUrl: './verify-email.page.html',
    styleUrls: [ './verify-email.page.css' ]
})
export class VerifyEmailComponent implements OnInit {
    /**
     * value to see if user is verified
     */
    isVerified = null;

    /**
     * Initializes necessary dependency and does dependency injection
     * @param {AuthService} _auth Auth service dependency to track auth state
     * @param {Router} router Router dependency to access to router for navigation
     * @param {ToastrService} toastr Toastr service dependency to display notifications (toasts)
     */
    constructor(private _auth: AuthService, private router: Router, private toastr: ToastrService, private http: HttpClient) {
    }
    /**
     * Initializes component
     */
    ngOnInit() {
    }
    /**
     * Checks email verification of current user, if verified, sends to dashboard
     */
    checkVerification() {
        this._auth.emailVerified(true).then((res) => {
            this.isVerified = res;
            if (this.isVerified) {
                setTimeout(() => {
                    this.router.navigateByUrl('/dashboard/home');
                }, 2000);
            }
        });
    }

    sendWelcomeEmail() {
        const welcomeEndpoint = 'https://us-central1-biblya-ed2ec.cloudfunctions.net/sendWelcomeEmail';
        const data = {
            email: this._auth.email,
            name: this._auth.userData.firstName
        };
        this.http.post(welcomeEndpoint, data).subscribe()


    }
    /**
     * Function to resend email verification
     */
    resendVerificationEmail() {
        this._auth.emailVerified().then((status) => {
            if (!status) {
                this._auth.sendVerificationEmail().then(() => {
                    this.toastr.show(`Successfully sent a verification email to ${ this._auth.email }`, 'Verified Email Sent');
                });
            }
        });
    }

}
