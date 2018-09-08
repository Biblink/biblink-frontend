import { AngularFireAuthModule } from '@angular/fire/auth';
import { TestBed, inject } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';
import { AngularFireModule } from '@angular/fire';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebase, 'biblink'),
        AngularFireAuthModule
      ],
      providers: [ AuthService ]
    });
  });

  it('should be created', inject([ AuthService ], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
