import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { SupportCenterComponent } from './support-center/support-center.component';
// import { FAQComponent } from './faq/faq.component';
import { NotFinishedComponent } from './../not-finished/not-finished.component';

// const routes: Routes = [
//     { path: 'support/faq', component: FAQComponent },
//     { path: 'suppot/center', component: SupportCenterComponent },
// ]; // TODO: uncomment when these pages have been implemented
const routes: Routes = [
    { path: 'faq', component: NotFinishedComponent },
    { path: 'center', component: NotFinishedComponent },
];
@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ]

})
export class SupportRoutingModule { }
