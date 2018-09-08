import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.page';
import { Title } from '@angular/platform-browser';
import { Angulartics2Module } from 'angulartics2';
import { UserDataService } from '../../../core/services/user-data/user-data.service';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { SharedModule } from '../../../shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ScrollToModule, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { environment } from '../../../../environments/environment';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SharedModule,
        ScrollToModule,
        AngularFireModule.initializeApp(environment.firebase, 'biblink'),
        AngularFireAuthModule,
        AngularFirestoreModule,
        Angulartics2Module.forRoot([ Angulartics2GoogleAnalytics ])
      ],
      declarations: [ HomeComponent ],
      providers: [ Title, UserDataService, ScrollToService ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
