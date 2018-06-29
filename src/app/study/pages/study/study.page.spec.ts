import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CoreModule } from './../../../core/core.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyComponent } from './study.page';
import { StudyNavComponent } from '../../components/study-nav/study-nav.component';
import { StudyDataService } from '../../services/study-data.service';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../../../../environments/environment';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { ToastrModule } from 'ngx-toastr';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { SharedModule } from '../../../shared/shared.module';
import { PostCardComponent } from '../../components/post-card/post-card.component';

describe('StudyComponent', () => {
  let component: StudyComponent;
  let fixture: ComponentFixture<StudyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        AngularFireModule.initializeApp(environment.firebase, 'biblink'),
        AngularFireAuthModule,
        AngularFirestoreModule,
        ToastrModule.forRoot({
          positionClass: 'toast-bottom-left'
        }),
        SharedModule,
        CoreModule
      ],
      declarations: [StudyComponent, StudyNavComponent, PostCardComponent],
      providers: [StudyDataService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
