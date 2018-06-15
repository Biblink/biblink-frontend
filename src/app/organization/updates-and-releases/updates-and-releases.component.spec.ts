import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatesAndReleasesComponent } from './updates-and-releases.component';

describe('UpdatesAndReleasesComponent', () => {
  let component: UpdatesAndReleasesComponent;
  let fixture: ComponentFixture<UpdatesAndReleasesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdatesAndReleasesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatesAndReleasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
