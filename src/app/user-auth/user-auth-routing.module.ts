import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './pages/sign-in/sign-in.page';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.page';
import { GetStartedComponent } from './pages/get-started/get-started.page';
import { PasswordResetComponent } from './pages/password-reset/password-reset.page';



const routes: Routes = [
    { path: 'sign-in', component: SignInComponent },
    { path: 'verify-email', component: VerifyEmailComponent },
    { path: 'get-started', component: GetStartedComponent },
    { path: 'password-reset', component: PasswordResetComponent },
];
@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ]

})
export class UserAuthRoutingModule { }
