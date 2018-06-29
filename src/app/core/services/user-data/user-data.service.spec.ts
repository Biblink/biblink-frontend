import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { TestBed, inject } from '@angular/core/testing';

import { UserDataService } from './user-data.service';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../../../../environments/environment';

describe('UserDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebase, 'biblink'),
        AngularFireAuthModule,
        AngularFirestoreModule
      ],
      providers: [UserDataService]
    });
  });

  it('should be created', inject(
    [UserDataService],
    (service: UserDataService) => {
      expect(service).toBeTruthy();
    }
  ));
});
