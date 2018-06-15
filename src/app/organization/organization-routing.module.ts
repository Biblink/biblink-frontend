import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFinishedComponent } from './../not-finished/not-finished.component';
// import { UpdatesAndReleasesComponent } from './updates-and-releases/updates-and-releases.component';
// import { ContactComponent } from './contact/contact.component';

// const routes: Routes = [
//     { path: 'organization/updates-&-releases', component: UpdatesAndReleasesComponent },
//     { path: 'organization/contact-us', component: ContactComponent },
// ]; // TODO: uncomment when these pages have been implemented
const routes: Routes = [
    { path: 'organization/updates-&-releases', component: NotFinishedComponent },
    { path: 'organization/contact-us', component: NotFinishedComponent },
];
@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ]

})
export class OrganizationRoutingModule { }
