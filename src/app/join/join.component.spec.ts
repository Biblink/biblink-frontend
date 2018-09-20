import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinComponent } from './join.component';
import { SharedModule } from '../shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';

import { AngularFirestoreModule } from '@angular/fire/firestore';
import { ToastrModule } from 'ngx-toastr';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../environments/environment';
import { CoreModule } from '../core/core.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StudyModule } from '../study/study.module';

describe('JoinComponent', () => {
  let component: JoinComponent;
  let fixture: ComponentFixture<JoinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        AngularFireModule.initializeApp(environment.firebase, 'biblink'),
        AngularFireAuthModule,
        AngularFirestoreModule,
        HttpClientTestingModule,
        CoreModule,
        StudyModule,
        AngularFireStorageModule,
        ToastrModule.forRoot({
          positionClass: 'toast-bottom-left'
        }),
        SharedModule,
        CoreModule
      ],
      declarations: [ JoinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
