import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudyComponent } from './pages/study/study.page';



const routes: Routes = [
    { path: 'study/:id', component: StudyComponent },
];
@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ]

})
export class StudyRoutingModule { }
