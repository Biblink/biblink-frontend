import { AngularFireAuthModule } from 'angularfire2/auth';
import { SharedImportsModule } from './../../../shared/shared-imports/shared-imports.module';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetStartedComponent } from './get-started.page';
import { CoreModule } from '../../../core/core.module';
import { RecaptchaModule } from 'ng-recaptcha';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../../../../environments/environment';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';

describe('GetStartedComponent', () => {
  let component: GetStartedComponent;
  let fixture: ComponentFixture<GetStartedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CoreModule,
        AngularFireModule.initializeApp(environment.firebase, 'biblink'),
        AngularFireAuthModule,
        RecaptchaModule.forRoot(),
        RecaptchaFormsModule,
        SharedImportsModule
      ],
      declarations: [GetStartedComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetStartedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
