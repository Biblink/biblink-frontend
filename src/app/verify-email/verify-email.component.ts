import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-verify-email',
    templateUrl: './verify-email.component.html',
    styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
    isVerified = null;

    constructor(private _auth: AuthService, private router: Router, private toastr: ToastrService) {
    }

    ngOnInit() {
    }

    checkVerification() {
        this._auth.emailVerified.then((res) => {
            this.isVerified = res;
            if (this.isVerified) {
                setTimeout(() => {
                    this.router.navigateByUrl('/'); // TODO: change this to dashboard later.
                }, 2000);
            }
        });
    }

    resendVerificationEmail() {
        this._auth.emailVerified.then((status) => {
            if (!status) {
                this._auth.sendVerificationEmail().then(() => {
                    this.toastr.show(`Successfully sent a verification email to ${this._auth.email}`, 'Verified Email Sent');
                });
            }
        });
    }

}
