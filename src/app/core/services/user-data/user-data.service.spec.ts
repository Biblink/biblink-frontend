import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { TestBed, inject } from '@angular/core/testing';

import { UserDataService } from './user-data.service';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../../../environments/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UserDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebase, 'biblink'),
        AngularFireAuthModule,
        HttpClientTestingModule,
        AngularFirestoreModule
      ],
      providers: [ UserDataService ]
    });
  });

  it('should be created', inject(
    [ UserDataService ],
    (service: UserDataService) => {
      expect(service).toBeTruthy();
    }
  ));
});
