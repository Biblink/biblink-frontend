import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFinishedComponent } from './../not-finished/not-finished.component';

// import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';
// import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';

// const routes: Routes = [
//     { path: 'legal/terms-of-use', component: TermsOfUseComponent },
//     { path: 'legal/privacy-policy', component: PrivacyPolicyComponent },
// ]; // TODO: Uncomment when pages are implemented

const routes: Routes = [
    { path: 'terms-of-use', component: NotFinishedComponent },
    { path: 'privacy-policy', component: NotFinishedComponent },
];
@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ]

})
export class LegalRoutingModule { }
