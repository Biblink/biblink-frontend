import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';


import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { ShareModule } from '@ngx-share/core';
import { ClipboardModule } from 'ngx-clipboard';
import { ToastrModule } from 'ngx-toastr';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { RecaptchaModule } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// custom modules
import { SharedModule } from './shared/shared.module';
import { OrganizationModule } from './organization/organization.module';
import { AppRoutingModule } from './/app-routing.module';
import { LegalModule } from './legal/legal.module';
import { SupportModule } from './support/support.module';
import { HomeModule } from './home/home.module';
import { AboutModule } from './about/about.module';



// components
import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { ResultsComponent } from './results/results.component';
import { ResultCardComponent } from './result-card/result-card.component';

// providers
import { SearchService } from './search.service';
import { SignInComponent } from './sign-in/sign-in.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { AuthService } from './auth.service';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { UserDataService } from './user-data.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StudyDataService } from './study-data.service';
import { StudyComponent } from './study/study.component';
import { StudyNavComponent } from './study-nav/study-nav.component';
import { NotFinishedComponent } from './not-finished/not-finished.component';



@NgModule({
    declarations: [
        AppComponent,
        SearchComponent,
        ResultsComponent,
        ResultCardComponent,
        SignInComponent,
        GetStartedComponent,
        PasswordResetComponent,
        VerifyEmailComponent,
        DashboardComponent,
        StudyComponent,
        StudyNavComponent,
        NotFinishedComponent
    ],
    imports: [
        SharedModule,
        AngularFireModule.initializeApp(environment.firebase, 'biblya'),
        AngularFirestoreModule.enablePersistence(),
        AngularFireAuthModule,
        AngularFireStorageModule,
        ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
        RecaptchaModule.forRoot(),
        Angulartics2Module.forRoot([ Angulartics2GoogleAnalytics ]),
        RecaptchaFormsModule,
        ScrollToModule.forRoot(),
        HttpClientModule,
        HttpClientJsonpModule,
        ClipboardModule,
        ShareModule.forRoot(),
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            positionClass: 'toast-bottom-left'
        }),
        HomeModule,
        AboutModule,
        SupportModule,
        LegalModule,
        OrganizationModule,
        AppRoutingModule
    ],
    providers: [ SearchService, AuthService, UserDataService, StudyDataService ],
    bootstrap: [ AppComponent ]
})
export class AppModule {
}
