import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultCardComponent } from './result-card.component';
import { ShareModule } from '@ngx-share/core';
import {
  ClipboardModule,
  ClipboardService,
  ClipboardDirective
} from 'ngx-clipboard';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { HttpClient } from 'selenium-webdriver/http';
import { HttpClientModule } from '@angular/common/http';

describe('ResultCardComponent', () => {
  let component: ResultCardComponent;
  let fixture: ComponentFixture<ResultCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ClipboardModule,
        ShareModule.forRoot()
      ],
      declarations: [ResultCardComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
