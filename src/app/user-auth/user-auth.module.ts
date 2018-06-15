import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAuthRoutingModule } from './user-auth-routing.module';
import { SharedModule } from '../shared/shared.module';
import { GetStartedComponent } from './pages/get-started/get-started.page';
import { PasswordResetComponent } from './pages/password-reset/password-reset.page';
import { SignInComponent } from './pages/sign-in/sign-in.page';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.page';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';
import { RecaptchaModule } from 'ng-recaptcha';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    UserAuthRoutingModule
  ],
  declarations: [
    VerifyEmailComponent,
    GetStartedComponent,
    SignInComponent,
    PasswordResetComponent
  ]
})
export class UserAuthModule { }
