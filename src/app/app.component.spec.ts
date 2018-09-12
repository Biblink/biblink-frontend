import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { SharedModule } from './shared/shared.module';
import { LoadingIntermediateComponent } from './loading-intermediate/loading-intermediate.component';
import { Location } from '@angular/common';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_ROUTES } from './app-routing.module';
import { Router } from '@angular/router';
import { CoreModule } from './core/core.module';
import { Angulartics2, Angulartics2Module } from 'angulartics2';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { ToastrModule } from 'ngx-toastr';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AppComponent', () => {
  let component: AppComponent;
  let de: DebugElement;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;
  let location: Location;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(APP_ROUTES),
        SharedModule,
        AngularFireModule.initializeApp(environment.firebase, 'biblink'),
        AngularFireAuthModule,
        AngularFirestoreModule,
        HttpClientTestingModule,
        ToastrModule.forRoot({
          positionClass: 'toast-bottom-left'
        }),
        CoreModule,
        Angulartics2Module.forRoot([ Angulartics2GoogleAnalytics ])
      ],
      declarations: [ AppComponent, LoadingIntermediateComponent ]
      // providers: [Angulartics2GoogleAnalytics]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    router = TestBed.get(Router);
    location = TestBed.get(Location);
    router.initialNavigation();
  });

  it('should create the app', async(() => {
    expect(component).toBeTruthy();
  }));
});
