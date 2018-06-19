import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotFinishedComponent } from './not-finished.component';

describe('NotFinishedComponent', () => {
  let component: NotFinishedComponent;
  let fixture: ComponentFixture<NotFinishedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotFinishedComponent ]
    })
    .compileComponents();
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
