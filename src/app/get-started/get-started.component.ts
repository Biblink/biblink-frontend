import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';

@Component({
    selector: 'app-get-started',
    templateUrl: './get-started.component.html',
    styleUrls: ['./get-started.component.css']
})
export class GetStartedComponent implements OnInit {
    emailSignupForm: FormGroup;
    email_regex = new RegExp('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])');

    static matchPassword(AC: AbstractControl) {
        const password = AC.get('password').value; // to get value in input tag
        const confirmPassword = AC.get('confirmPassword').value; // to get value in input tag
        if (password !== confirmPassword) {
            const required = AC.get('confirmPassword').getError('required');
            AC.get('confirmPassword').setErrors({required: required, MatchPassword: true});
        } else {
            return null;
        }
    }

    constructor(private _auth: AuthService, private fb: FormBuilder) {
    }

    ngOnInit(): void {
        this.createForm();
    }

    createForm(): void {
        this.emailSignupForm = this.fb.group({
                email: ['', [Validators.required, Validators.pattern(this.email_regex)]],
                password: ['', Validators.required],
                confirmPassword: ['', Validators.required],
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

}
