import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {RouterModule, Routes} from '@angular/router';
import {HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {ScrollToModule} from '@nicky-lenaers/ngx-scroll-to';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ShareModule} from '@ngx-share/core';
import {ClipboardModule} from 'ngx-clipboard';
import {ToastrModule} from 'ngx-toastr';
// components
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {FooterComponent} from './footer/footer.component';
import {NavbarComponent} from './navbar/navbar.component';
import {SearchComponent} from './search/search.component';
import {ResultsComponent} from './results/results.component';
import {ResultCardComponent} from './result-card/result-card.component';

// providers
import {SearchService} from './search.service';
import { SignInComponent } from './sign-in/sign-in.component';
import { GetStartedComponent } from './get-started/get-started.component';
import {AuthService} from './auth.service';
import {PasswordValidation} from './validators/password-validation.directive';

const appRoutes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'search', component: SearchComponent},
    {path: 'sign-in', component: SignInComponent},
    {path: 'get-started', component: GetStartedComponent}
];

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
        GetStartedComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        environment.production
            ? ServiceWorkerModule.register('/ngsw-worker.js')
            : [],
        RouterModule.forRoot(appRoutes),
        ScrollToModule.forRoot(),
        HttpClientModule,
        HttpClientJsonpModule,
        ClipboardModule,
        ShareModule.forRoot(),
        ToastrModule.forRoot()
    ],
    providers: [SearchService, AuthService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
