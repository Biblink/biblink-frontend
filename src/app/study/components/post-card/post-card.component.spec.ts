import { CoreModule } from './../../../core/core.module';
import { FormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostCardComponent } from './post-card.component';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { environment } from '../../../../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { StudyDataService } from '../../services/study-data.service';
import { ToastrModule } from 'ngx-toastr';

describe('PostCardComponent', () => {
  let component: PostCardComponent;
  let fixture: ComponentFixture<PostCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        AngularFireModule.initializeApp(environment.firebase, 'biblink'),
        AngularFireAuthModule,
        AngularFirestoreModule,
        ToastrModule.forRoot({
          positionClass: 'toast-bottom-left'
        })
      ],
      declarations: [ PostCardComponent, SafeHtmlPipe ],
      providers: [ StudyDataService ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
