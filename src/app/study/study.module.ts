
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudyComponent } from './pages/study/study.page';
import { StudyRoutingModule } from './study-routing.module';
import { StudyNavComponent } from './components/study-nav/study-nav.component';
import { SharedModule } from '../shared/shared.module';
import { PostCardComponent } from './components/post-card/post-card.component';
import { StudyDataService } from './services/study-data.service';
import { SwitchTabComponent } from './components/switch-tab/switch-tab.component';
import { RightBarAnnouncments } from './components/right-bar-announcements/right-bar-announcements.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    StudyRoutingModule
  ],
  declarations: [
    PostCardComponent,
    StudyNavComponent,
    StudyComponent,
    SwitchTabComponent,
    RightBarAnnouncments
  ],
  providers: [ StudyDataService ]
})
export class StudyModule { }
