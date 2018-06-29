import { NgModule, PLATFORM_ID } from '@angular/core';
import { environment } from '../environments/environment';

import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { ShareModule } from '@ngx-share/core';
import { ToastrModule } from 'ngx-toastr';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { RecaptchaModule } from 'ng-recaptcha';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  BrowserModule,
  BrowserTransferStateModule
} from '@angular/platform-browser';

// custom modules
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { OrganizationModule } from './organization/organization.module';
import { AppRoutingModule } from './app-routing.module';
import { LegalModule } from './legal/legal.module';
import { SupportModule } from './support/support.module';
import { HomeModule } from './home/home.module';
import { AboutModule } from './about/about.module';
import { SearchModule } from './search/search.module';
import { UserAuthModule } from './user-auth/user-auth.module';
import { StudyModule } from './study/study.module';
import { UserDashboardModule } from './user-dashboard/user-dashboard.module';

// components
import { AppComponent } from './app.component';
import { NotFinishedComponent } from './not-finished/not-finished.component';

// providers
import { LoadingIntermediateComponent } from './loading-intermediate/loading-intermediate.component';

/**
 * App module that creates root of angular application
 */
@NgModule({
  declarations: [
    AppComponent,
    NotFinishedComponent,
    LoadingIntermediateComponent
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase, 'biblink'),
    AngularFirestoreModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserTransferStateModule,
    SharedModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    ServiceWorkerModule.register('/combined-worker.js', {
      enabled: environment.production
    }),
    RecaptchaModule.forRoot(),
    Angulartics2Module.forRoot([Angulartics2GoogleAnalytics]),
    ScrollToModule.forRoot(),
    HttpClientModule,
    HttpClientJsonpModule,
    ShareModule.forRoot(),
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-left'
    }),
    CoreModule.forRoot(),
    HomeModule,
    StudyModule,
    UserDashboardModule,
    UserAuthModule,
    AboutModule,
    SearchModule,
    SupportModule,
    LegalModule,
    OrganizationModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
