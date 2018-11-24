import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NotFinishedComponent } from './not-finished.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

describe('NotFinishedComponent', () => {
  let component: NotFinishedComponent;
  let fixture: ComponentFixture<NotFinishedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        Angulartics2Module.forRoot()
      ],
      declarations: [NotFinishedComponent, FooterComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotFinishedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
