import { DashboardComponent } from './pages/dashboard/dashboard.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { UserDashboardRoutingModule } from './user-dashboard-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    UserDashboardRoutingModule
  ],
  declarations: [ DashboardComponent ]
})
export class UserDashboardModule { }
