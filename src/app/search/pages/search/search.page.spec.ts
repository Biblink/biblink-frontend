import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchComponent } from './search.page';
import { SharedModule } from '../../../shared/shared.module';
import { ResultsComponent } from '../../components/results/results.component';
import { ResultCardComponent } from '../../components/result-card/result-card.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ClipboardModule } from 'ngx-clipboard';
import { ShareModule } from '@ngx-share/core';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { CoreModule } from '../../../core/core.module';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule,
        ClipboardModule,
        ShareModule.forRoot(),
        CoreModule,
        Angulartics2Module.forRoot()
      ],
      declarations: [SearchComponent, ResultsComponent, ResultCardComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
