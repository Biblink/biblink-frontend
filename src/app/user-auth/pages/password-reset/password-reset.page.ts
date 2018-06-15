import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-password-reset',
    templateUrl: './password-reset.page.html',
    styleUrls: [ './password-reset.page.css' ]
})
export class PasswordResetComponent implements OnInit {
    passwordSent = false;
    notFound = false;
    passwordResetForm: FormGroup;
    email_regex = new RegExp('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"' +
        '(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")' +
        '@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?' +
        '|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])' +
        '|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]' +
        '|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])');

    constructor(public title: Title, private toastr: ToastrService,
        private router: Router, private _auth: AuthService,
        private fb: FormBuilder) {
    }

    ngOnInit() {
        this.title.setTitle('Reset Password');
        this.createForm();
    }

    createForm() {
        this.passwordResetForm = this.fb.group({
            email: [ '', [ Validators.required, Validators.pattern(this.email_regex) ] ]
        });
    }

    sendPasswordReset() {
        return this._auth.sendPasswordReset(this.email.value).then((res) => {
            if (res === 'success') {
                this.passwordSent = true;
            } else {
                this.notFound = true;
            }
        });
    }

    get email(): AbstractControl {
        return this.passwordResetForm.get('email');
    }

    toSignIn() {
        this.router.navigateByUrl('/sign-in');
    }


    resendResetPassword() {
        this.sendPasswordReset().then(() => {
            this.toastr.show(`Successfully resent a password reset email to ${ this.email.value }`, 'Reset Password Email Resent');
        });
    }

}
