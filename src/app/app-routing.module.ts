import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { StudyComponent } from './study/study.component';
import { NotFinishedComponent } from './not-finished/not-finished.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';



const routes: Routes = [
  { path: 'search', component: SearchComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'get-started', component: GetStartedComponent },
  { path: 'password-reset', component: PasswordResetComponent },
  { path: 'dashboard/home', component: DashboardComponent },
  { path: 'dashboard', pathMatch: 'full', redirectTo: '/dashboard/home' },
  { path: 'dashboard/studies/study/:id', component: StudyComponent },
];
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]

})
export class AppRoutingModule { }
