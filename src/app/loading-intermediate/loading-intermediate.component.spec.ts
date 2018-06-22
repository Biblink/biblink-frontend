import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingIntermediateComponent } from './loading-intermediate.component';

describe('LoadingIntermediateComponent', () => {
  let component: LoadingIntermediateComponent;
  let fixture: ComponentFixture<LoadingIntermediateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadingIntermediateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingIntermediateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
