import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingIntermediateComponent } from './loading-intermediate.component';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoadingIntermediateComponent', () => {
  let component: LoadingIntermediateComponent;
  let fixture: ComponentFixture<LoadingIntermediateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [LoadingIntermediateComponent, LoadingSpinnerComponent]
    }).compileComponents();
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
