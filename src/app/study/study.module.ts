
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudyComponent } from './pages/study/study.page';
import { StudyRoutingModule } from './study-routing.module';
import { StudyNavComponent } from './components/study-nav/study-nav.component';
import { SharedModule } from '../shared/shared.module';
import { PostCardComponent } from './components/post-card/post-card.component';
import { StudyDataService } from './services/study-data.service';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    SharedModule,
    StudyRoutingModule,
  ],
  declarations: [
    PostCardComponent,
    StudyNavComponent,
    StudyComponent
  ],
  providers: [ StudyDataService ]
})
export class StudyModule { }
