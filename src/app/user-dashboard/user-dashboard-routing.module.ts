import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.page';



const routes: Routes = [
    { path: 'dashboard/home', component: DashboardComponent },
    { path: 'dashboard', pathMatch: 'full', redirectTo: '/dashboard/home' }
];
@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ]

})
export class UserDashboardRoutingModule { }
