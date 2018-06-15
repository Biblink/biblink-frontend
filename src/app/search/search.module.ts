import { SearchComponent } from './pages/search/search.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchRoutingModule } from './search-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ResultsComponent } from './components/results/results.component';
import { ResultCardComponent } from './components/result-card/result-card.component';
import { ClipboardModule } from 'ngx-clipboard';
import { ShareModule } from '@ngx-share/core';

@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    ShareModule,
    SearchRoutingModule,
    SharedModule
  ],
  declarations: [
    SearchComponent,
    ResultsComponent,
    ResultCardComponent
  ]
})
export class SearchModule { }
