import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudyComponent } from './study/study.component';
import { DashboardComponent } from './dashboard/dashboard.component';



const routes: Routes = [
  { path: 'dashboard/home', component: DashboardComponent },
  { path: 'dashboard', pathMatch: 'full', redirectTo: '/dashboard/home' },
  { path: 'dashboard/studies/study/:id', component: StudyComponent },
];
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]

})
export class AppRoutingModule { }
