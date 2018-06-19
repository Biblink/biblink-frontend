import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';



const routes: Routes = [
  { path: 'about', loadChildren: 'app/about/about.module#AboutModule' },
  { path: 'search', loadChildren: 'app/search/search.module#SearchModule' },
  { path: 'dashboard', loadChildren: 'app/user-dashboard/user-dashboard.module#UserDashboardModule' },
  { path: 'dashboard/studies', loadChildren: 'app/study/study.module#StudyModule' },
  { path: 'organization', loadChildren: 'app/organization/organization.module#OrganizationModule' },
  { path: 'legal', loadChildren: 'app/legal/legal.module#LegalModule' },
  { path: 'support', loadChildren: 'app/support/support.module#SupportModule' },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]

})
export class AppRoutingModule { }
