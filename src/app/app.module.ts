import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule,
    environment.production
      ? ServiceWorkerModule.register('/ngsw-worker.js')
      : []
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
