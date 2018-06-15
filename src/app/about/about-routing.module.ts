import { NotFinishedComponent } from './../not-finished/not-finished.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// const routes: Routes = [
//     { path: '/about', component: AboutComponent },
// ]; // TODO: update when finished
const routes: Routes = [
    { path: '', component: NotFinishedComponent },
];
@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ]
})
export class AboutRoutingModule { }
