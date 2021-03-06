import { SharedImportsModule } from './../../../shared/shared-imports/shared-imports.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StudyNavComponent } from './study-nav.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { environment } from '../../../../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { ToastrModule } from 'ngx-toastr';
import { StudyDataService } from '../../services/study-data.service';
import { ClipboardModule } from 'ngx-clipboard';
import { HttpClientModule } from '@angular/common/http';

describe('StudyNavComponent', () => {
  let component: StudyNavComponent;
  let fixture: ComponentFixture<StudyNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebase, 'biblink'),
        AngularFireAuthModule,
        AngularFirestoreModule,
        HttpClientTestingModule,
        SharedImportsModule,
        ClipboardModule,
        ToastrModule.forRoot({
          positionClass: 'toast-bottom-left'
        }),
        RouterTestingModule,
        Angulartics2Module.forRoot()
      ],
      declarations: [ StudyNavComponent ],
      providers: [ StudyDataService ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
