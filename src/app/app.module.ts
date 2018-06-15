import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShareModule } from '@ngx-share/core';
import { ClipboardModule } from 'ngx-clipboard';
import { ToastrModule } from 'ngx-toastr';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { RecaptchaModule } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';

// analytics
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';


// components
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
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
import { DropZoneDirective } from './drop-zone.directive';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { StudyDataService } from './study-data.service';
import { StudyComponent } from './study/study.component';
import { StudyNavComponent } from './study-nav/study-nav.component';
import { PostCardComponent } from './post-card/post-card.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { NotFinishedComponent } from './not-finished/not-finished.component';
import { AppRoutingModule } from './/app-routing.module';


@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        FooterComponent,
        NavbarComponent,
        SearchComponent,
        ResultsComponent,
        ResultCardComponent,
        SignInComponent,
        GetStartedComponent,
        PasswordResetComponent,
        VerifyEmailComponent,
        DashboardComponent,
        DropZoneDirective,
        FileUploadComponent,
        StudyComponent,
        StudyNavComponent,
        PostCardComponent,
        LoadingSpinnerComponent,
        SafeHtmlPipe,
        NotFinishedComponent
    ],
    imports: [
        Angulartics2Module.forRoot([ Angulartics2GoogleAnalytics ]),
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        AngularFireModule.initializeApp(environment.firebase, 'biblya'),
        AngularFirestoreModule.enablePersistence(),
        AngularFireAuthModule,
        AngularFireStorageModule,
        ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
        RecaptchaModule.forRoot(),
        RecaptchaFormsModule,
        ScrollToModule.forRoot(),
        HttpClientModule,
        HttpClientJsonpModule,
        ClipboardModule,
        ShareModule.forRoot(),
        ToastrModule.forRoot({
            positionClass: 'toast-bottom-left'
        }),
        AppRoutingModule
    ],
    providers: [ SearchService, AuthService, UserDataService, StudyDataService ],
    bootstrap: [ AppComponent ]
})
export class AppModule {
}
