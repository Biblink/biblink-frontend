import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {RouterModule, Routes} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {ScrollToModule} from '@nicky-lenaers/ngx-scroll-to';
import {FormsModule} from '@angular/forms';
// components
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {FooterComponent} from './footer/footer.component';
import {NavbarComponent} from './navbar/navbar.component';
import {SearchComponent} from './search/search.component';

// providers
import {SearchService} from './search.service';
import {ResultsComponent} from './results/results.component';
import {ResultCardComponent} from './result-card/result-card.component';

const appRoutes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'search', component: SearchComponent}
];

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        FooterComponent,
        NavbarComponent,
        SearchComponent,
        ResultsComponent,
        ResultCardComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        environment.production
            ? ServiceWorkerModule.register('/ngsw-worker.js')
            : [],
        RouterModule.forRoot(appRoutes),
        ScrollToModule.forRoot(),
        HttpClientModule
    ],
    providers: [SearchService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
